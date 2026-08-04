/**
 * Unit tests — FASE 3.5-B1 payment checkout decision logs.
 * Run via: pnpm --filter api test
 */
import { HttpException, HttpStatus } from "@nestjs/common";
import {
  KitPickupPaymentRecordStatus,
  KitPickupPaymentStatus,
  KitPickupRequestStatus,
  type KitPickupPayment,
  type KitPickupRequest,
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { MockPaymentGateway } from "./mock-payment-gateway";
import type { PaymentDecisionPayload } from "./payment-decision-log";
import { PaymentsService } from "./payments.service";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function assertNoSecrets(payload: PaymentDecisionPayload): void {
  const raw = JSON.stringify(payload);
  assert(!raw.includes("whsec_"), "no stripe webhook secret");
  assert(!raw.includes("sk_"), "no stripe secret key");
  assert(!raw.toLowerCase().includes("password"), "no password");
  assert(!("customerEmail" in payload), "no customerEmail field");
  assert(!("successUrl" in payload), "no successUrl field");
  assert(!("cancelUrl" in payload), "no cancelUrl field");
}

function baseRequest(now: Date): KitPickupRequest {
  return {
    id: "kpr_log_1",
    userId: "usr_log_1",
    kitPickupServiceId: "kps_1",
    registrationId: null,
    status: KitPickupRequestStatus.PAYMENT_PENDING,
    paymentStatus: KitPickupPaymentStatus.PENDING,
    feeAmountSnapshot: new Decimal("25.00"),
    feeCurrencySnapshot: "BRL",
    pickedUpAt: null,
    pickedUpBy: null,
    custodyAt: null,
    custodyBy: null,
    readyAt: null,
    readyBy: null,
    deliveredAt: null,
    deliveredBy: null,
    receivedByName: null,
    handoverNotes: null,
    createdAt: now,
    updatedAt: now,
  };
}

function createCheckoutPrisma(params: {
  request: KitPickupRequest | null;
  termAcceptance?: object | null;
  pendingPayments?: KitPickupPayment[];
  failGatewayCreate?: boolean;
}) {
  const payments = new Map<string, KitPickupPayment>();
  for (const p of params.pendingPayments ?? []) {
    payments.set(p.id, { ...p });
  }

  return {
    kitPickupRequest: {
      findFirst: async () => {
        if (!params.request) return null;
        return {
          ...params.request,
          termAcceptance:
            params.termAcceptance === undefined
              ? { id: "term_1" }
              : params.termAcceptance,
          payments: params.pendingPayments ?? [],
        };
      },
      update: async () => params.request,
    },
    kitPickupPayment: {
      create: async ({ data }: { data: KitPickupPayment }) => {
        payments.set(data.id, data);
        return data;
      },
      update: async ({
        where,
        data,
      }: {
        where: { id: string };
        data: Partial<KitPickupPayment>;
      }) => {
        const current = payments.get(where.id);
        assert(current, "payment exists for update");
        const next = { ...current, ...data };
        payments.set(where.id, next);
        return next;
      },
      findFirst: async () => [...payments.values()][0] ?? null,
    },
    $transaction: async (ops: Promise<unknown>[]) => Promise.all(ops),
  };
}

async function main(): Promise<void> {
  const now = new Date();
  const gateway = new MockPaymentGateway({
    webhookSecret: "test_webhook_secret_value",
    publicApiBaseUrl: "http://localhost:3001",
  });

  // --- created ---
  {
    const events: PaymentDecisionPayload[] = [];
    const request = baseRequest(now);
    const prisma = createCheckoutPrisma({ request });
    const svc = new PaymentsService(prisma as never, gateway, {
      environment: "test",
      decisionLogSink: (p) => events.push(p),
    });

    const result = await svc.createCheckoutForRequest({
      userId: request.userId,
      requestId: request.id,
      successUrl: "http://localhost/ok",
      cancelUrl: "http://localhost/cancel",
      customerEmail: "secret@example.com",
    });

    assert(result.paymentId.startsWith("kpp_"), "payment id created");
    assert(events.length === 1, `exactly one log, got ${events.length}`);
    assert(events[0].event === "payment.checkout.created", "created event");
    assert(events[0].category === "audit", "audit category");
    assert(events[0].result === "success", "success result");
    assert(events[0].reason === null, "reason null");
    assert(events[0].code === null, "code null");
    assert(events[0].service === "api", "service api");
    assert(events[0].environment === "test", "environment");
    assert(events[0].provider === "mock", "provider");
    assert(events[0].userId === request.userId, "userId");
    assert(events[0].requestId === request.id, "requestId");
    assert(events[0].paymentId === result.paymentId, "paymentId");
    assert(events[0].providerEventId === null, "no providerEventId");
    assert(events[0].providerPaymentId != null, "providerPaymentId set");
    assertNoSecrets(events[0]);
    assert(!JSON.stringify(events[0]).includes("secret@example.com"), "no email");
  }

  // --- reused (existing_pending) ---
  {
    const events: PaymentDecisionPayload[] = [];
    const request = baseRequest(now);
    const pending: KitPickupPayment = {
      id: "kpp_existing",
      kitPickupRequestId: request.id,
      provider: "mock",
      providerPaymentId: "pending_kpp_existing",
      amount: new Decimal("25.00"),
      currency: "BRL",
      status: KitPickupPaymentRecordStatus.PENDING,
      createdAt: now,
      updatedAt: now,
    };
    const prisma = createCheckoutPrisma({
      request,
      pendingPayments: [pending],
    });
    const svc = new PaymentsService(prisma as never, gateway, {
      environment: "test",
      decisionLogSink: (p) => events.push(p),
    });

    const result = await svc.createCheckoutForRequest({
      userId: request.userId,
      requestId: request.id,
      successUrl: "http://localhost/ok",
      cancelUrl: "http://localhost/cancel",
    });

    assert(result.paymentId === "kpp_existing", "reused payment id");
    assert(events.length === 1, `exactly one log, got ${events.length}`);
    assert(events[0].event === "payment.checkout.reused", "reused event");
    assert(events[0].reason === "existing_pending", "existing_pending");
    assert(events[0].category === "audit", "audit");
    assert(events[0].result === "success", "success");
    assertNoSecrets(events[0]);
  }

  // --- rejected ---
  {
    const events: PaymentDecisionPayload[] = [];
    const request = {
      ...baseRequest(now),
      status: KitPickupRequestStatus.CANCELLED,
    };
    const prisma = createCheckoutPrisma({ request });
    const svc = new PaymentsService(prisma as never, gateway, {
      environment: "test",
      decisionLogSink: (p) => events.push(p),
    });

    let caught: HttpException | null = null;
    try {
      await svc.createCheckoutForRequest({
        userId: request.userId,
        requestId: request.id,
        successUrl: "http://localhost/ok",
        cancelUrl: "http://localhost/cancel",
      });
    } catch (error: unknown) {
      caught = error as HttpException;
    }

    assert(caught instanceof HttpException, "throws");
    assert(caught.getStatus() === HttpStatus.CONFLICT, "409");
    assert(events.length === 1, "one rejected log");
    assert(events[0].event === "payment.checkout.rejected", "rejected event");
    assert(events[0].category === "warn", "warn");
    assert(events[0].result === "rejected", "rejected result");
    assert(events[0].code === "REQUEST_CANCELLED", "code");
    assert(events[0].reason === "request_cancelled", "reason");
    assert(events[0].paymentId === null, "no paymentId");
    assertNoSecrets(events[0]);
  }

  // --- gateway_error (new checkout path) ---
  {
    const events: PaymentDecisionPayload[] = [];
    const request = baseRequest(now);
    const prisma = createCheckoutPrisma({ request });
    const failingGateway = {
      provider: "mock" as const,
      createCheckout: async () => {
        throw new Error("provider down");
      },
      verifyAndParseWebhook: async () => {
        throw new Error("unused");
      },
    };
    const svc = new PaymentsService(prisma as never, failingGateway, {
      environment: "test",
      decisionLogSink: (p) => events.push(p),
    });

    let caught: HttpException | null = null;
    try {
      await svc.createCheckoutForRequest({
        userId: request.userId,
        requestId: request.id,
        successUrl: "http://localhost/ok",
        cancelUrl: "http://localhost/cancel",
      });
    } catch (error: unknown) {
      caught = error as HttpException;
    }

    assert(caught instanceof HttpException, "throws gateway error");
    assert(caught.getStatus() === HttpStatus.BAD_GATEWAY, "502");
    assert(events.length === 1, "one gateway_error log");
    assert(
      events[0].event === "payment.checkout.gateway_error",
      "gateway_error event",
    );
    assert(events[0].category === "error", "error category");
    assert(events[0].result === "error", "error result");
    assert(events[0].code === "GATEWAY_ERROR", "GATEWAY_ERROR code");
    assert(events[0].reason === "gateway_failure", "gateway_failure");
    assert(events[0].paymentId != null, "paymentId present");
    assert(!JSON.stringify(events[0]).includes("provider down"), "no raw msg");
    assertNoSecrets(events[0]);
  }

  console.log("payment-checkout-logs.test.ts: OK");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
