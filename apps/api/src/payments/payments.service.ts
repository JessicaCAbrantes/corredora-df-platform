import { randomUUID } from "node:crypto";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import {
  KitPickupPaymentRecordStatus,
  KitPickupPaymentStatus,
  KitPickupRequestStatus,
  PaymentWebhookEventStatus,
  Prisma,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { PaymentGateway, VerifiedPaymentEvent } from "./payment-gateway";

function decimalEquals(a: Prisma.Decimal, b: string): boolean {
  return a.equals(new Prisma.Decimal(b));
}

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: PaymentGateway,
  ) {}

  getProviderName(): string {
    return this.gateway.provider;
  }

  getGateway(): PaymentGateway {
    return this.gateway;
  }

  async createCheckoutForRequest(params: {
    userId: string;
    requestId: string;
    successUrl: string;
    cancelUrl: string;
    customerEmail?: string;
  }): Promise<{ checkoutUrl: string; paymentId: string; provider: string }> {
    const request = await this.prisma.kitPickupRequest.findFirst({
      where: { id: params.requestId, userId: params.userId },
      include: {
        termAcceptance: true,
        payments: {
          where: { status: KitPickupPaymentRecordStatus.PENDING },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!request) {
      throw this.notFound();
    }

    if (request.status === KitPickupRequestStatus.CANCELLED) {
      throw this.error(HttpStatus.CONFLICT, "REQUEST_CANCELLED", "Solicitação cancelada.");
    }

    if (!request.termAcceptance) {
      throw this.error(
        HttpStatus.CONFLICT,
        "TERM_REQUIRED",
        "Aceite o termo antes de iniciar o pagamento.",
      );
    }

    if (
      request.feeAmountSnapshot == null ||
      !request.feeCurrencySnapshot
    ) {
      throw this.error(
        HttpStatus.CONFLICT,
        "PAYMENT_NOT_REQUIRED",
        "Este serviço não possui taxa.",
      );
    }

    if (request.status === KitPickupRequestStatus.PAID) {
      throw this.error(HttpStatus.CONFLICT, "ALREADY_PAID", "Pagamento já confirmado.");
    }

    if (request.status === KitPickupRequestStatus.WAIVED) {
      throw this.error(HttpStatus.CONFLICT, "PAYMENT_WAIVED", "Pagamento dispensado.");
    }

    if (
      request.status !== KitPickupRequestStatus.PAYMENT_PENDING &&
      request.status !== KitPickupRequestStatus.TERM_ACCEPTED
    ) {
      throw this.error(
        HttpStatus.CONFLICT,
        "INVALID_STATUS",
        "Solicitação não está pronta para pagamento.",
      );
    }

    const amount = request.feeAmountSnapshot.toFixed(2);
    const currency = request.feeCurrencySnapshot;

    const existingPending = request.payments[0];
    if (existingPending) {
      // Reuse pending payment — create a fresh checkout session on the same payment row.
      const checkout = await this.gateway.createCheckout({
        paymentId: existingPending.id,
        kitPickupRequestId: request.id,
        amount,
        currency,
        successUrl: params.successUrl,
        cancelUrl: params.cancelUrl,
        customerEmail: params.customerEmail,
      });

      await this.prisma.kitPickupPayment.update({
        where: { id: existingPending.id },
        data: {
          provider: checkout.provider,
          providerPaymentId: checkout.providerPaymentId,
        },
      });

      if (request.status !== KitPickupRequestStatus.PAYMENT_PENDING) {
        await this.prisma.kitPickupRequest.update({
          where: { id: request.id },
          data: {
            status: KitPickupRequestStatus.PAYMENT_PENDING,
            paymentStatus: KitPickupPaymentStatus.PENDING,
          },
        });
      }

      return {
        checkoutUrl: checkout.checkoutUrl,
        paymentId: existingPending.id,
        provider: checkout.provider,
      };
    }

    const paymentId = `kpp_${randomUUID().replace(/-/g, "").slice(0, 24)}`;
    await this.prisma.kitPickupPayment.create({
      data: {
        id: paymentId,
        kitPickupRequestId: request.id,
        provider: this.gateway.provider,
        providerPaymentId: `pending_${paymentId}`,
        amount: request.feeAmountSnapshot,
        currency,
        status: KitPickupPaymentRecordStatus.PENDING,
      },
    });

    try {
      const checkout = await this.gateway.createCheckout({
        paymentId,
        kitPickupRequestId: request.id,
        amount,
        currency,
        successUrl: params.successUrl,
        cancelUrl: params.cancelUrl,
        customerEmail: params.customerEmail,
      });

      await this.prisma.$transaction([
        this.prisma.kitPickupPayment.update({
          where: { id: paymentId },
          data: {
            provider: checkout.provider,
            providerPaymentId: checkout.providerPaymentId,
          },
        }),
        this.prisma.kitPickupRequest.update({
          where: { id: request.id },
          data: {
            status: KitPickupRequestStatus.PAYMENT_PENDING,
            paymentStatus: KitPickupPaymentStatus.PENDING,
          },
        }),
      ]);

      return {
        checkoutUrl: checkout.checkoutUrl,
        paymentId,
        provider: checkout.provider,
      };
    } catch {
      await this.prisma.kitPickupPayment.update({
        where: { id: paymentId },
        data: { status: KitPickupPaymentRecordStatus.FAILED },
      });
      throw this.error(
        HttpStatus.BAD_GATEWAY,
        "GATEWAY_ERROR",
        "Não foi possível iniciar o pagamento.",
      );
    }
  }

  /**
   * FASE 3.4-C1/C2 — ledger + short-circuit by (provider, eventId).
   * Duplicate processed deliveries return without re-running domain writes.
   */
  async processVerifiedWebhook(params: {
    providerEventId: string;
    event: VerifiedPaymentEvent | null;
    payloadHash: string | null;
  }): Promise<"duplicate" | "applied"> {
    const provider = this.gateway.provider;
    const eventId = params.providerEventId;

    const existing = await this.prisma.paymentWebhookEvent.findUnique({
      where: { provider_eventId: { provider, eventId } },
    });

    if (existing?.processedAt != null) {
      return "duplicate";
    }

    if (!existing) {
      try {
        await this.prisma.paymentWebhookEvent.create({
          data: {
            id: `pwe_${randomUUID().replace(/-/g, "")}`,
            provider,
            eventId,
            status: PaymentWebhookEventStatus.RECEIVED,
            payloadHash: params.payloadHash,
          },
        });
      } catch (error: unknown) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          const raced = await this.prisma.paymentWebhookEvent.findUnique({
            where: { provider_eventId: { provider, eventId } },
          });
          if (raced?.processedAt != null) {
            return "duplicate";
          }
          // RECEIVED but not processed — allow domain retry after a crash.
        } else {
          throw error;
        }
      }
    }

    if (params.event) {
      await this.handleVerifiedEvent(params.event);
    }

    await this.prisma.paymentWebhookEvent.update({
      where: { provider_eventId: { provider, eventId } },
      data: {
        status: PaymentWebhookEventStatus.PROCESSED,
        processedAt: new Date(),
      },
    });

    return "applied";
  }

  async handleVerifiedEvent(event: VerifiedPaymentEvent): Promise<void> {
    if (event.type === "payment.failed") {
      await this.markFailed(event);
      return;
    }

    await this.markPaid(event);
  }

  private async markPaid(event: Extract<VerifiedPaymentEvent, { type: "payment.paid" }>) {
    const payment = await this.prisma.kitPickupPayment.findUnique({
      where: { providerPaymentId: event.providerPaymentId },
      include: { request: true },
    });

    if (!payment) {
      // Fallback: locate by internal payment id from metadata
      const byId = await this.prisma.kitPickupPayment.findUnique({
        where: { id: event.paymentId },
        include: { request: true },
      });
      if (!byId) {
        throw this.error(HttpStatus.NOT_FOUND, "PAYMENT_NOT_FOUND", "Pagamento não encontrado.");
      }
      return this.applyPaid(byId, event);
    }

    return this.applyPaid(payment, event);
  }

  private async applyPaid(
    payment: {
      id: string;
      kitPickupRequestId: string;
      amount: Prisma.Decimal;
      currency: string;
      status: KitPickupPaymentRecordStatus;
      providerPaymentId: string;
      request: { id: string; status: KitPickupRequestStatus };
    },
    event: Extract<VerifiedPaymentEvent, { type: "payment.paid" }>,
  ): Promise<void> {
    if (payment.id !== event.paymentId) {
      throw this.error(
        HttpStatus.CONFLICT,
        "PAYMENT_MISMATCH",
        "Pagamento não corresponde à solicitação.",
      );
    }

    if (payment.kitPickupRequestId !== event.kitPickupRequestId) {
      throw this.error(
        HttpStatus.CONFLICT,
        "REQUEST_MISMATCH",
        "Pagamento associado a outra solicitação.",
      );
    }

    if (!decimalEquals(payment.amount, event.amount)) {
      throw this.error(
        HttpStatus.CONFLICT,
        "AMOUNT_MISMATCH",
        "Valor do pagamento diverge do snapshot.",
      );
    }

    if (payment.currency.toUpperCase() !== event.currency.toUpperCase()) {
      throw this.error(
        HttpStatus.CONFLICT,
        "CURRENCY_MISMATCH",
        "Moeda do pagamento diverge do snapshot.",
      );
    }

    // Idempotent success (PAID or already advanced to operational queue)
    if (
      payment.status === KitPickupPaymentRecordStatus.PAID &&
      (payment.request.status === KitPickupRequestStatus.PAID ||
        payment.request.status === KitPickupRequestStatus.PICKUP_PENDING ||
        payment.request.status === KitPickupRequestStatus.PICKED_UP ||
        payment.request.status === KitPickupRequestStatus.IN_CUSTODY ||
        payment.request.status === KitPickupRequestStatus.READY_FOR_HANDOVER ||
        payment.request.status === KitPickupRequestStatus.DELIVERED)
    ) {
      return;
    }

    if (payment.request.status === KitPickupRequestStatus.CANCELLED) {
      throw this.error(
        HttpStatus.CONFLICT,
        "REQUEST_CANCELLED",
        "Solicitação cancelada.",
      );
    }

    await this.prisma.$transaction([
      this.prisma.kitPickupPayment.update({
        where: { id: payment.id },
        data: {
          status: KitPickupPaymentRecordStatus.PAID,
          providerPaymentId: event.providerPaymentId,
        },
      }),
      this.prisma.kitPickupRequest.update({
        where: { id: payment.kitPickupRequestId },
        data: {
          // Auto-enter operational queue after gateway confirmation.
          status: KitPickupRequestStatus.PICKUP_PENDING,
          paymentStatus: KitPickupPaymentStatus.PAID,
        },
      }),
    ]);
  }

  private async markFailed(
    event: Extract<VerifiedPaymentEvent, { type: "payment.failed" }>,
  ): Promise<void> {
    const payment =
      (await this.prisma.kitPickupPayment.findUnique({
        where: { providerPaymentId: event.providerPaymentId },
      })) ??
      (await this.prisma.kitPickupPayment.findUnique({
        where: { id: event.paymentId },
      }));

    if (!payment) {
      return;
    }

    if (payment.status === KitPickupPaymentRecordStatus.PAID) {
      return;
    }

    if (payment.kitPickupRequestId !== event.kitPickupRequestId) {
      throw this.error(
        HttpStatus.CONFLICT,
        "REQUEST_MISMATCH",
        "Pagamento associado a outra solicitação.",
      );
    }

    await this.prisma.$transaction([
      this.prisma.kitPickupPayment.update({
        where: { id: payment.id },
        data: { status: KitPickupPaymentRecordStatus.FAILED },
      }),
      this.prisma.kitPickupRequest.update({
        where: { id: payment.kitPickupRequestId },
        data: { paymentStatus: KitPickupPaymentStatus.FAILED },
      }),
    ]);
  }

  private notFound(): HttpException {
    return this.error(HttpStatus.NOT_FOUND, "NOT_FOUND", "Solicitação não encontrada.");
  }

  private error(status: number, code: string, message: string): HttpException {
    return new HttpException(
      {
        status: "error",
        error: { code, message, status },
      },
      status,
    );
  }
}
