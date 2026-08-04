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
import {
  checkoutRejectReason,
  emitPaymentDecisionLog,
  type PaymentDecisionCategory,
  type PaymentDecisionEventName,
  type PaymentDecisionLogSink,
  type PaymentDecisionReason,
  type PaymentDecisionResult,
} from "./payment-decision-log";
import type { PaymentGateway, VerifiedPaymentEvent } from "./payment-gateway";
import {
  getWebhookHttpErrorCode,
  isPermanentDomainWebhookError,
  isRetryableDomainWebhookError,
} from "./webhook-http-policy";
import { getCorrelationId } from "../observability/correlation-context";

export type PaymentsServiceOptions = {
  environment?: string;
  decisionLogSink?: PaymentDecisionLogSink;
};

/** Partial unique index from migration 20260803160000. */
export const KIT_PICKUP_PAYMENTS_PENDING_REQUEST_UIDX =
  "kit_pickup_payments_pending_request_uidx";

function decimalEquals(a: Prisma.Decimal, b: string): boolean {
  return a.equals(new Prisma.Decimal(b));
}

/**
 * Current checkout session for this payment row.
 * Placeholder `pending_*` ids may still be bound by the first real session.
 */
export function isCurrentProviderSession(
  currentProviderPaymentId: string,
  eventProviderPaymentId: string,
): boolean {
  if (currentProviderPaymentId === eventProviderPaymentId) {
    return true;
  }
  return currentProviderPaymentId.startsWith("pending_");
}

export function isPendingRequestUniqueConflict(error: unknown): boolean {
  if (
    !(error instanceof Prisma.PrismaClientKnownRequestError) ||
    error.code !== "P2002"
  ) {
    return false;
  }
  const meta = error.meta as
    | { target?: string | string[]; constraint?: string }
    | undefined;
  const constraint = meta?.constraint;
  if (constraint === KIT_PICKUP_PAYMENTS_PENDING_REQUEST_UIDX) {
    return true;
  }
  const target = meta?.target;
  if (typeof target === "string") {
    return target === KIT_PICKUP_PAYMENTS_PENDING_REQUEST_UIDX;
  }
  if (Array.isArray(target)) {
    return target.includes(KIT_PICKUP_PAYMENTS_PENDING_REQUEST_UIDX);
  }
  // Fallback: Postgres often embeds the index name in the message.
  return error.message.includes(KIT_PICKUP_PAYMENTS_PENDING_REQUEST_UIDX);
}

@Injectable()
export class PaymentsService {
  private readonly environment: string;
  private readonly decisionLogSink?: PaymentDecisionLogSink;

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: PaymentGateway,
    options?: PaymentsServiceOptions,
  ) {
    this.environment = options?.environment ?? process.env.NODE_ENV ?? "development";
    this.decisionLogSink = options?.decisionLogSink;
  }

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
      throw this.rejectCheckout(params, "NOT_FOUND", "Solicitação não encontrada.", HttpStatus.NOT_FOUND);
    }

    if (request.status === KitPickupRequestStatus.CANCELLED) {
      throw this.rejectCheckout(
        params,
        "REQUEST_CANCELLED",
        "Solicitação cancelada.",
      );
    }

    if (!request.termAcceptance) {
      throw this.rejectCheckout(
        params,
        "TERM_REQUIRED",
        "Aceite o termo antes de iniciar o pagamento.",
      );
    }

    if (
      request.feeAmountSnapshot == null ||
      !request.feeCurrencySnapshot
    ) {
      throw this.rejectCheckout(
        params,
        "PAYMENT_NOT_REQUIRED",
        "Este serviço não possui taxa.",
      );
    }

    if (request.status === KitPickupRequestStatus.PAID) {
      throw this.rejectCheckout(
        params,
        "ALREADY_PAID",
        "Pagamento já confirmado.",
      );
    }

    if (request.status === KitPickupRequestStatus.WAIVED) {
      throw this.rejectCheckout(
        params,
        "PAYMENT_WAIVED",
        "Pagamento dispensado.",
      );
    }

    if (
      request.status !== KitPickupRequestStatus.PAYMENT_PENDING &&
      request.status !== KitPickupRequestStatus.TERM_ACCEPTED
    ) {
      throw this.rejectCheckout(
        params,
        "INVALID_STATUS",
        "Solicitação não está pronta para pagamento.",
      );
    }

    const amount = request.feeAmountSnapshot.toFixed(2);
    const currency = request.feeCurrencySnapshot;

    const existingPending = request.payments[0];
    if (existingPending) {
      return this.checkoutWithExistingPending({
        pending: existingPending,
        requestId: request.id,
        userId: params.userId,
        requestStatus: request.status,
        amount,
        currency,
        successUrl: params.successUrl,
        cancelUrl: params.cancelUrl,
        customerEmail: params.customerEmail,
        reuseReason: "existing_pending",
      });
    }

    const paymentId = `kpp_${randomUUID().replace(/-/g, "").slice(0, 24)}`;
    try {
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
    } catch (error: unknown) {
      if (isPendingRequestUniqueConflict(error)) {
        const racedPending = await this.prisma.kitPickupPayment.findFirst({
          where: {
            kitPickupRequestId: request.id,
            status: KitPickupPaymentRecordStatus.PENDING,
          },
          orderBy: { createdAt: "desc" },
        });
        if (!racedPending) {
          throw error;
        }
        return this.checkoutWithExistingPending({
          pending: racedPending,
          requestId: request.id,
          userId: params.userId,
          requestStatus: request.status,
          amount,
          currency,
          successUrl: params.successUrl,
          cancelUrl: params.cancelUrl,
          customerEmail: params.customerEmail,
          reuseReason: "race_detected",
        });
      }
      throw error;
    }

    try {
      const checkout = await this.gateway.createCheckout({
        paymentId,
        kitPickupRequestId: request.id,
        amount,
        currency,
        successUrl: params.successUrl,
        cancelUrl: params.cancelUrl,
        customerEmail: params.customerEmail,
        correlationId: getCorrelationId(),
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

      this.emitDecision({
        event: "payment.checkout.created",
        category: "audit",
        result: "success",
        paymentId,
        requestId: request.id,
        userId: params.userId,
        providerPaymentId: checkout.providerPaymentId,
      });

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
      this.emitDecision({
        event: "payment.checkout.gateway_error",
        category: "error",
        result: "error",
        paymentId,
        requestId: request.id,
        userId: params.userId,
        code: "GATEWAY_ERROR",
        reason: "gateway_failure",
      });
      throw this.error(
        HttpStatus.BAD_GATEWAY,
        "GATEWAY_ERROR",
        "Não foi possível iniciar o pagamento.",
      );
    }
  }

  private async checkoutWithExistingPending(params: {
    pending: { id: string };
    requestId: string;
    userId: string;
    requestStatus: KitPickupRequestStatus;
    amount: string;
    currency: string;
    successUrl: string;
    cancelUrl: string;
    customerEmail?: string;
    reuseReason: Extract<
      PaymentDecisionReason,
      "existing_pending" | "race_detected"
    >;
  }): Promise<{ checkoutUrl: string; paymentId: string; provider: string }> {
    try {
      const checkout = await this.gateway.createCheckout({
        paymentId: params.pending.id,
        kitPickupRequestId: params.requestId,
        amount: params.amount,
        currency: params.currency,
        successUrl: params.successUrl,
        cancelUrl: params.cancelUrl,
        customerEmail: params.customerEmail,
        correlationId: getCorrelationId(),
      });

      await this.prisma.kitPickupPayment.update({
        where: { id: params.pending.id },
        data: {
          provider: checkout.provider,
          providerPaymentId: checkout.providerPaymentId,
        },
      });

      if (params.requestStatus !== KitPickupRequestStatus.PAYMENT_PENDING) {
        await this.prisma.kitPickupRequest.update({
          where: { id: params.requestId },
          data: {
            status: KitPickupRequestStatus.PAYMENT_PENDING,
            paymentStatus: KitPickupPaymentStatus.PENDING,
          },
        });
      }

      this.emitDecision({
        event: "payment.checkout.reused",
        category: "audit",
        result: "success",
        paymentId: params.pending.id,
        requestId: params.requestId,
        userId: params.userId,
        providerPaymentId: checkout.providerPaymentId,
        reason: params.reuseReason,
      });

      return {
        checkoutUrl: checkout.checkoutUrl,
        paymentId: params.pending.id,
        provider: checkout.provider,
      };
    } catch (error: unknown) {
      this.emitDecision({
        event: "payment.checkout.gateway_error",
        category: "error",
        result: "error",
        paymentId: params.pending.id,
        requestId: params.requestId,
        userId: params.userId,
        code: "GATEWAY_ERROR",
        reason: "gateway_failure",
      });
      // Preserve prior behavior for reused path (no FAILED rewrite / no envelope change).
      throw error;
    }
  }

  /** Used by webhook controller for verify/signature/processing errors (FASE 3.5-B2). */
  emitWebhookDecision(params: {
    event: PaymentDecisionEventName;
    category: PaymentDecisionCategory;
    result: PaymentDecisionResult;
    paymentId?: string | null;
    requestId?: string | null;
    userId?: string | null;
    providerPaymentId?: string | null;
    providerEventId?: string | null;
    code?: string | null;
    reason?: PaymentDecisionReason | null;
  }): void {
    this.emitDecision(params);
  }

  private emitDecision(params: {
    event: PaymentDecisionEventName;
    category: PaymentDecisionCategory;
    result: PaymentDecisionResult;
    paymentId?: string | null;
    requestId?: string | null;
    userId?: string | null;
    providerPaymentId?: string | null;
    providerEventId?: string | null;
    code?: string | null;
    reason?: PaymentDecisionReason | null;
  }): void {
    emitPaymentDecisionLog(
      {
        environment: this.environment,
        event: params.event,
        category: params.category,
        provider: this.gateway.provider,
        paymentId: params.paymentId,
        requestId: params.requestId,
        userId: params.userId,
        providerPaymentId: params.providerPaymentId,
        providerEventId: params.providerEventId ?? null,
        result: params.result,
        code: params.code,
        reason: params.reason,
      },
      this.decisionLogSink,
    );
  }

  private rejectCheckout(
    params: { userId: string; requestId: string },
    code: string,
    message: string,
    status: number = HttpStatus.CONFLICT,
  ): HttpException {
    this.emitDecision({
      event: "payment.checkout.rejected",
      category: "warn",
      result: "rejected",
      requestId: params.requestId,
      userId: params.userId,
      code,
      reason: checkoutRejectReason(code),
    });
    return this.error(status, code, message);
  }

  /**
   * FASE 3.4-C1/C2 — ledger + short-circuit by (provider, eventId).
   * FASE 3.4-C4 — permanent domain codes → PROCESSED (ACK); PAYMENT_NOT_FOUND → 500 + RECEIVED.
   * FASE 3.5-B2 — structured webhook decision logs (no HTTP/ledger/domain change).
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
      this.emitDecision({
        event: "payment.webhook.duplicate",
        category: "audit",
        result: "noop",
        providerEventId: eventId,
        paymentId: params.event?.paymentId ?? null,
        requestId: params.event?.kitPickupRequestId ?? null,
        providerPaymentId: params.event?.providerPaymentId ?? null,
        reason: "duplicate_event",
      });
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
            this.emitDecision({
              event: "payment.webhook.duplicate",
              category: "audit",
              result: "noop",
              providerEventId: eventId,
              paymentId: params.event?.paymentId ?? null,
              requestId: params.event?.kitPickupRequestId ?? null,
              providerPaymentId: params.event?.providerPaymentId ?? null,
              reason: "duplicate_event",
            });
            return "duplicate";
          }
          // RECEIVED but not processed — allow domain retry after a crash.
        } else {
          throw error;
        }
      }
    }

    // TRACE — omit on duplicate replay (acceptance: replay → only duplicate).
    this.emitDecision({
      event: "payment.webhook.received",
      category: "trace",
      result: "success",
      providerEventId: eventId,
      paymentId: params.event?.paymentId ?? null,
      requestId: params.event?.kitPickupRequestId ?? null,
      providerPaymentId: params.event?.providerPaymentId ?? null,
    });

    if (params.event) {
      try {
        await this.handleVerifiedEvent(params.event, eventId);
      } catch (error: unknown) {
        if (isPermanentDomainWebhookError(error)) {
          this.emitDecision({
            event: "payment.webhook.acknowledged_permanent",
            category: "audit",
            result: "noop",
            providerEventId: eventId,
            paymentId: params.event.paymentId,
            requestId: params.event.kitPickupRequestId,
            providerPaymentId: params.event.providerPaymentId,
            code: getWebhookHttpErrorCode(error),
            reason: "permanent_domain_conflict",
          });
          // Explicit allowlist only — mark PROCESSED and ACK (no domain change).
        } else if (isRetryableDomainWebhookError(error)) {
          this.emitDecision({
            event: "payment.webhook.retryable",
            category: "warn",
            result: "rejected",
            providerEventId: eventId,
            paymentId: params.event.paymentId,
            requestId: params.event.kitPickupRequestId,
            providerPaymentId: params.event.providerPaymentId,
            code: "PAYMENT_NOT_FOUND",
            reason: "payment_not_found",
          });
          // Leave RECEIVED; surface as 500 so the provider retries (FASE 3.4-C4).
          throw this.error(
            HttpStatus.INTERNAL_SERVER_ERROR,
            "PAYMENT_NOT_FOUND",
            "Pagamento não encontrado; retry do provedor permitido.",
          );
        } else {
          // Unknown 4xx / other errors — do not auto-ACK.
          throw error;
        }
      }
    } else {
      this.emitDecision({
        event: "payment.webhook.ignored_unmapped",
        category: "audit",
        result: "noop",
        providerEventId: eventId,
        reason: "ignored_unmapped",
      });
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

  async handleVerifiedEvent(
    event: VerifiedPaymentEvent,
    providerEventId: string = "evt_direct",
  ): Promise<void> {
    if (event.type === "payment.failed") {
      await this.markFailed(event, providerEventId);
      return;
    }

    await this.markPaid(event, providerEventId);
  }

  private async markPaid(
    event: Extract<VerifiedPaymentEvent, { type: "payment.paid" }>,
    providerEventId: string,
  ) {
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
      return this.applyPaid(byId, event, providerEventId);
    }

    return this.applyPaid(payment, event, providerEventId);
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
    providerEventId: string,
  ): Promise<void> {
    // FASE 3.4-C3-B: stale checkout — no domain write; caller still marks ledger PROCESSED.
    if (!isCurrentProviderSession(payment.providerPaymentId, event.providerPaymentId)) {
      this.emitDecision({
        event: "payment.webhook.stale",
        category: "warn",
        result: "noop",
        providerEventId,
        paymentId: payment.id,
        requestId: payment.kitPickupRequestId,
        providerPaymentId: event.providerPaymentId,
        reason: "stale_session",
      });
      return;
    }

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
      this.emitDecision({
        event: "payment.webhook.payment_confirmed",
        category: "audit",
        result: "noop",
        providerEventId,
        paymentId: payment.id,
        requestId: payment.kitPickupRequestId,
        providerPaymentId: event.providerPaymentId,
        reason: "already_processed",
      });
      return;
    }

    if (payment.request.status === KitPickupRequestStatus.CANCELLED) {
      throw this.error(
        HttpStatus.CONFLICT,
        "REQUEST_CANCELLED",
        "Solicitação cancelada.",
      );
    }

    // FASE 3.4-C3-A: conditional transitions (PENDING|FAILED → PAID). Never clobber CANCELLED.
    const outcome: { value: "confirmed" | "crash_recovery" | "noop" } = {
      value: "noop",
    };
    await this.prisma.$transaction(async (tx) => {
      const paymentUpdate = await tx.kitPickupPayment.updateMany({
        where: {
          id: payment.id,
          status: {
            in: [
              KitPickupPaymentRecordStatus.PENDING,
              KitPickupPaymentRecordStatus.FAILED,
            ],
          },
        },
        data: {
          status: KitPickupPaymentRecordStatus.PAID,
          providerPaymentId: event.providerPaymentId,
        },
      });

      if (paymentUpdate.count === 0) {
        // Crash recovery: payment already PAID but request may still be PAYMENT_PENDING.
        const current = await tx.kitPickupPayment.findUnique({
          where: { id: payment.id },
        });
        if (current?.status === KitPickupPaymentRecordStatus.PAID) {
          await tx.kitPickupRequest.updateMany({
            where: {
              id: payment.kitPickupRequestId,
              status: {
                in: [
                  KitPickupRequestStatus.PAYMENT_PENDING,
                  KitPickupRequestStatus.TERM_ACCEPTED,
                  KitPickupRequestStatus.PAID,
                ],
              },
            },
            data: {
              status: KitPickupRequestStatus.PICKUP_PENDING,
              paymentStatus: KitPickupPaymentStatus.PAID,
            },
          });
          outcome.value = "crash_recovery";
        }
        return;
      }

      await tx.kitPickupRequest.updateMany({
        where: {
          id: payment.kitPickupRequestId,
          status: {
            in: [
              KitPickupRequestStatus.PAYMENT_PENDING,
              KitPickupRequestStatus.TERM_ACCEPTED,
              KitPickupRequestStatus.PAID,
            ],
          },
        },
        data: {
          status: KitPickupRequestStatus.PICKUP_PENDING,
          paymentStatus: KitPickupPaymentStatus.PAID,
        },
      });
      outcome.value = "confirmed";
    });

    if (outcome.value === "confirmed") {
      this.emitDecision({
        event: "payment.webhook.payment_confirmed",
        category: "audit",
        result: "success",
        providerEventId,
        paymentId: payment.id,
        requestId: payment.kitPickupRequestId,
        providerPaymentId: event.providerPaymentId,
      });
    } else if (outcome.value === "crash_recovery") {
      this.emitDecision({
        event: "payment.webhook.payment_confirmed",
        category: "audit",
        result: "noop",
        providerEventId,
        paymentId: payment.id,
        requestId: payment.kitPickupRequestId,
        providerPaymentId: event.providerPaymentId,
        reason: "crash_recovery",
      });
    }
  }

  private async markFailed(
    event: Extract<VerifiedPaymentEvent, { type: "payment.failed" }>,
    providerEventId: string,
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

    // FASE 3.4-C3-B: stale checkout — ignore domain.
    if (!isCurrentProviderSession(payment.providerPaymentId, event.providerPaymentId)) {
      this.emitDecision({
        event: "payment.webhook.stale",
        category: "warn",
        result: "noop",
        providerEventId,
        paymentId: payment.id,
        requestId: payment.kitPickupRequestId,
        providerPaymentId: event.providerPaymentId,
        reason: "stale_session",
      });
      return;
    }

    if (payment.status === KitPickupPaymentRecordStatus.PAID) {
      this.emitDecision({
        event: "payment.webhook.payment_failed",
        category: "audit",
        result: "noop",
        providerEventId,
        paymentId: payment.id,
        requestId: payment.kitPickupRequestId,
        providerPaymentId: event.providerPaymentId,
        reason: "already_processed",
      });
      return;
    }

    if (payment.kitPickupRequestId !== event.kitPickupRequestId) {
      throw this.error(
        HttpStatus.CONFLICT,
        "REQUEST_MISMATCH",
        "Pagamento associado a outra solicitação.",
      );
    }

    // FASE 3.4-C3-A: FAILED only from PENDING — never overwrite PAID.
    let applied = false;
    await this.prisma.$transaction(async (tx) => {
      const paymentUpdate = await tx.kitPickupPayment.updateMany({
        where: {
          id: payment.id,
          status: KitPickupPaymentRecordStatus.PENDING,
        },
        data: { status: KitPickupPaymentRecordStatus.FAILED },
      });

      if (paymentUpdate.count === 0) {
        return;
      }

      await tx.kitPickupRequest.updateMany({
        where: {
          id: payment.kitPickupRequestId,
          paymentStatus: KitPickupPaymentStatus.PENDING,
        },
        data: { paymentStatus: KitPickupPaymentStatus.FAILED },
      });
      applied = true;
    });

    if (applied) {
      this.emitDecision({
        event: "payment.webhook.payment_failed",
        category: "audit",
        result: "success",
        providerEventId,
        paymentId: payment.id,
        requestId: payment.kitPickupRequestId,
        providerPaymentId: event.providerPaymentId,
        reason: "declined",
      });
    } else {
      this.emitDecision({
        event: "payment.webhook.payment_failed",
        category: "audit",
        result: "noop",
        providerEventId,
        paymentId: payment.id,
        requestId: payment.kitPickupRequestId,
        providerPaymentId: event.providerPaymentId,
        reason: "already_processed",
      });
    }
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
