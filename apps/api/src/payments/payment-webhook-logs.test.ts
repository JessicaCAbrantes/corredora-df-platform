/**
 * Unit tests — FASE 3.5-B2 payment webhook decision logs.
 * Run via: pnpm --filter api test
 */
import { createHmac } from "node:crypto";
import { HttpException, HttpStatus } from "@nestjs/common";
import {
  KitPickupPaymentRecordStatus,
  KitPickupPaymentStatus,
  KitPickupRequestStatus,
  PaymentWebhookEventStatus,
  Prisma,
  type KitPickupPayment,
  type KitPickupRequest,
  type PaymentWebhookEvent,
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { MockPaymentGateway } from "./mock-payment-gateway";
import type { PaymentDecisionPayload } from "./payment-decision-log";
import { PaymentWebhookController } from "./payment-webhook.controller";
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
  assert(!raw.includes("test_webhook_secret"), "no mock webhook secret");
  assert(!("payloadHash" in payload), "no payloadHash field");
  assert(!("rawBody" in payload), "no rawBody");
  assert(!("signature" in payload), "no signature field");
}

type LedgerKey = string;

function ledgerKey(provider: string, eventId: string): LedgerKey {
  return `${provider}::${eventId}`;
}

function baseRequest(now: Date): KitPickupRequest {
  return {
    id: "kpr_wh_log_1",
    userId: "usr_wh_1",
    kitPickupServiceId: "kps_1",
    registrationId: null,
    status: KitPickupRequestStatus.PAYMENT_PENDING,
    paymentStatus: KitPickupPaymentStatus.PENDING,
    feeAmountSnapshot: new Decimal("10.00"),
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

function basePayment(now: Date, requestId: string): KitPickupPayment {
  return {
    id: "kpp_wh_log_1",
    kitPickupRequestId: requestId,
    provider: "mock",
    providerPaymentId: "mock_pay_kpp_wh_log_1",
    amount: new Decimal("10.00"),
    currency: "BRL",
    status: KitPickupPaymentRecordStatus.PENDING,
    createdAt: now,
    updatedAt: now,
  };
}

function createPrismaMock(params: {
  request: KitPickupRequest;
  payment: KitPickupPayment | null;
  ledger: Map<LedgerKey, PaymentWebhookEvent>;
}) {
  const { request, payment, ledger } = params;
  const payments = new Map<string, KitPickupPayment>();
  if (payment) {
    payments.set(payment.id, payment);
  }

  return {
    kitPickupPayment: {
      findUnique: async ({
        where,
      }: {
        where: { id?: string; providerPaymentId?: string };
      }) => {
        if (where.id) {
          const p = payments.get(where.id);
          if (!p) return null;
          return { ...p, request };
        }
        if (where.providerPaymentId) {
          const p = [...payments.values()].find(
            (x) => x.providerPaymentId === where.providerPaymentId,
          );
          if (!p) return null;
          return { ...p, request };
        }
        return null;
      },
      updateMany: async ({
        where,
        data,
      }: {
        where: {
          id: string;
          status?:
            | KitPickupPaymentRecordStatus
            | { in: KitPickupPaymentRecordStatus[] };
        };
        data: Partial<KitPickupPayment>;
      }) => {
        const row = payments.get(where.id);
        if (!row) return { count: 0 };
        const allowed =
          where.status == null
            ? true
            : typeof where.status === "object" && "in" in where.status
              ? where.status.in.includes(row.status)
              : row.status === where.status;
        if (!allowed) return { count: 0 };
        Object.assign(row, data, { updatedAt: new Date() });
        return { count: 1 };
      },
    },
    kitPickupRequest: {
      updateMany: async ({
        where,
        data,
      }: {
        where: {
          id: string;
          status?: { in: KitPickupRequestStatus[] };
          paymentStatus?: KitPickupPaymentStatus;
        };
        data: Partial<KitPickupRequest>;
      }) => {
        if (where.id !== request.id) return { count: 0 };
        if (
          where.status &&
          "in" in where.status &&
          !where.status.in.includes(request.status)
        ) {
          return { count: 0 };
        }
        if (
          where.paymentStatus != null &&
          request.paymentStatus !== where.paymentStatus
        ) {
          return { count: 0 };
        }
        Object.assign(request, data, { updatedAt: new Date() });
        return { count: 1 };
      },
    },
    paymentWebhookEvent: {
      findUnique: async ({
        where,
      }: {
        where: { provider_eventId: { provider: string; eventId: string } };
      }) => {
        const key = ledgerKey(
          where.provider_eventId.provider,
          where.provider_eventId.eventId,
        );
        return ledger.get(key) ?? null;
      },
      create: async ({ data }: { data: PaymentWebhookEvent }) => {
        const key = ledgerKey(data.provider, data.eventId);
        if (ledger.has(key)) {
          throw new Prisma.PrismaClientKnownRequestError("Unique", {
            code: "P2002",
            clientVersion: "test",
          });
        }
        ledger.set(key, { ...data });
        return data;
      },
      update: async ({
        where,
        data,
      }: {
        where: { provider_eventId: { provider: string; eventId: string } };
        data: Partial<PaymentWebhookEvent>;
      }) => {
        const key = ledgerKey(
          where.provider_eventId.provider,
          where.provider_eventId.eventId,
        );
        const row = ledger.get(key);
        assert(row, "ledger row exists");
        Object.assign(row, data);
        return row;
      },
    },
    $transaction: async (
      fn: (tx: unknown) => Promise<unknown> | unknown[] | Promise<unknown>[],
    ) => {
      if (typeof fn === "function") {
        return fn({
          kitPickupPayment: {
            findUnique: async ({ where }: { where: { id: string } }) =>
              payments.get(where.id) ?? null,
            updateMany: async (args: {
              where: {
                id: string;
                status?:
                  | KitPickupPaymentRecordStatus
                  | { in: KitPickupPaymentRecordStatus[] };
              };
              data: Partial<KitPickupPayment>;
            }) => {
              const row = payments.get(args.where.id);
              if (!row) return { count: 0 };
              const allowed =
                args.where.status == null
                  ? true
                  : typeof args.where.status === "object" &&
                      "in" in args.where.status
                    ? args.where.status.in.includes(row.status)
                    : row.status === args.where.status;
              if (!allowed) return { count: 0 };
              Object.assign(row, args.data);
              return { count: 1 };
            },
          },
          kitPickupRequest: {
            updateMany: async (args: {
              where: {
                id: string;
                status?: { in: KitPickupRequestStatus[] };
                paymentStatus?: KitPickupPaymentStatus;
              };
              data: Partial<KitPickupRequest>;
            }) => {
              if (args.where.id !== request.id) return { count: 0 };
              if (
                args.where.status &&
                !args.where.status.in.includes(request.status)
              ) {
                return { count: 0 };
              }
              if (
                args.where.paymentStatus != null &&
                request.paymentStatus !== args.where.paymentStatus
              ) {
                return { count: 0 };
              }
              Object.assign(request, args.data);
              return { count: 1 };
            },
          },
        });
      }
      return Promise.all(fn as Promise<unknown>[]);
    },
  };
}

function decisionEvents(
  events: PaymentDecisionPayload[],
  name: string,
): PaymentDecisionPayload[] {
  return events.filter((e) => e.event === name);
}

async function main(): Promise<void> {
  const now = new Date();
  const gateway = new MockPaymentGateway({
    webhookSecret: "test_webhook_secret_value",
    publicApiBaseUrl: "http://localhost:3001",
  });

  // --- payment_confirmed (received + confirmed) ---
  {
    const events: PaymentDecisionPayload[] = [];
    const request = baseRequest(now);
    const payment = basePayment(now, request.id);
    const ledger = new Map<LedgerKey, PaymentWebhookEvent>();
    const prisma = createPrismaMock({ request, payment, ledger });
    const svc = new PaymentsService(prisma as never, gateway, {
      environment: "test",
      decisionLogSink: (p) => events.push(p),
    });

    const outcome = await svc.processVerifiedWebhook({
      providerEventId: "evt_paid_1",
      event: {
        type: "payment.paid",
        provider: "mock",
        providerPaymentId: payment.providerPaymentId,
        paymentId: payment.id,
        kitPickupRequestId: request.id,
        amount: "10.00",
        currency: "BRL",
      },
      payloadHash: "abc",
    });

    assert(outcome === "applied", "applied");
    assert(decisionEvents(events, "payment.webhook.received").length === 1, "received once");
    assert(
      decisionEvents(events, "payment.webhook.payment_confirmed").length === 1,
      "confirmed once",
    );
    assert(decisionEvents(events, "payment.webhook.duplicate").length === 0, "not duplicate");
    const confirmed = decisionEvents(events, "payment.webhook.payment_confirmed")[0];
    assert(confirmed.result === "success", "success");
    assert(confirmed.category === "audit", "audit");
    assert(confirmed.userId === null, "no invented userId");
    assertNoSecrets(confirmed);
  }

  // --- duplicate replay: ONLY duplicate ---
  {
    const events: PaymentDecisionPayload[] = [];
    const request = baseRequest(now);
    const payment = basePayment(now, request.id);
    const ledger = new Map<LedgerKey, PaymentWebhookEvent>();
    const key = ledgerKey("mock", "evt_dup_1");
    ledger.set(key, {
      id: "pwe_1",
      provider: "mock",
      eventId: "evt_dup_1",
      status: PaymentWebhookEventStatus.PROCESSED,
      payloadHash: "x",
      receivedAt: now,
      processedAt: now,
    });
    const prisma = createPrismaMock({ request, payment, ledger });
    const svc = new PaymentsService(prisma as never, gateway, {
      environment: "test",
      decisionLogSink: (p) => events.push(p),
    });

    const outcome = await svc.processVerifiedWebhook({
      providerEventId: "evt_dup_1",
      event: {
        type: "payment.paid",
        provider: "mock",
        providerPaymentId: payment.providerPaymentId,
        paymentId: payment.id,
        kitPickupRequestId: request.id,
        amount: "10.00",
        currency: "BRL",
      },
      payloadHash: "abc",
    });

    assert(outcome === "duplicate", "duplicate outcome");
    assert(events.length === 1, `only duplicate log, got ${events.length}`);
    assert(events[0].event === "payment.webhook.duplicate", "duplicate event");
    assert(events[0].reason === "duplicate_event", "reason");
    assertNoSecrets(events[0]);
  }

  // --- acknowledged_permanent + PROCESSED ---
  {
    const events: PaymentDecisionPayload[] = [];
    const request = {
      ...baseRequest(now),
      status: KitPickupRequestStatus.CANCELLED,
    };
    const payment = basePayment(now, request.id);
    const ledger = new Map<LedgerKey, PaymentWebhookEvent>();
    const prisma = createPrismaMock({ request, payment, ledger });
    const svc = new PaymentsService(prisma as never, gateway, {
      environment: "test",
      decisionLogSink: (p) => events.push(p),
    });

    const outcome = await svc.processVerifiedWebhook({
      providerEventId: "evt_perm_1",
      event: {
        type: "payment.paid",
        provider: "mock",
        providerPaymentId: payment.providerPaymentId,
        paymentId: payment.id,
        kitPickupRequestId: request.id,
        amount: "10.00",
        currency: "BRL",
      },
      payloadHash: "abc",
    });

    assert(outcome === "applied", "ACK applied");
    const row = ledger.get(ledgerKey("mock", "evt_perm_1"));
    assert(row?.processedAt != null, "ledger PROCESSED");
    assert(
      decisionEvents(events, "payment.webhook.acknowledged_permanent").length === 1,
      "permanent ack",
    );
    assert(
      decisionEvents(events, "payment.webhook.acknowledged_permanent")[0].code ===
        "REQUEST_CANCELLED",
      "code",
    );
  }

  // --- retryable → 500 semantics via thrown HttpException ---
  {
    const events: PaymentDecisionPayload[] = [];
    const request = baseRequest(now);
    const ledger = new Map<LedgerKey, PaymentWebhookEvent>();
    const prisma = createPrismaMock({ request, payment: null, ledger });
    const svc = new PaymentsService(prisma as never, gateway, {
      environment: "test",
      decisionLogSink: (p) => events.push(p),
    });

    let caught: HttpException | null = null;
    try {
      await svc.processVerifiedWebhook({
        providerEventId: "evt_retry_1",
        event: {
          type: "payment.paid",
          provider: "mock",
          providerPaymentId: "missing",
          paymentId: "kpp_missing",
          kitPickupRequestId: request.id,
          amount: "10.00",
          currency: "BRL",
        },
        payloadHash: "abc",
      });
    } catch (error: unknown) {
      caught = error as HttpException;
    }

    assert(caught instanceof HttpException, "throws");
    assert(caught.getStatus() === HttpStatus.INTERNAL_SERVER_ERROR, "500");
    const row = ledger.get(ledgerKey("mock", "evt_retry_1"));
    assert(row != null && row.processedAt == null, "stays RECEIVED");
    assert(decisionEvents(events, "payment.webhook.retryable").length === 1, "retryable");
    assert(
      decisionEvents(events, "payment.webhook.retryable")[0].reason ===
        "payment_not_found",
      "reason",
    );
  }

  // --- stale ---
  {
    const events: PaymentDecisionPayload[] = [];
    const request = baseRequest(now);
    const payment = {
      ...basePayment(now, request.id),
      providerPaymentId: "cs_current",
    };
    const ledger = new Map<LedgerKey, PaymentWebhookEvent>();
    const prisma = createPrismaMock({ request, payment, ledger });
    const svc = new PaymentsService(prisma as never, gateway, {
      environment: "test",
      decisionLogSink: (p) => events.push(p),
    });

    await svc.processVerifiedWebhook({
      providerEventId: "evt_stale_1",
      event: {
        type: "payment.paid",
        provider: "mock",
        providerPaymentId: "cs_old",
        paymentId: payment.id,
        kitPickupRequestId: request.id,
        amount: "10.00",
        currency: "BRL",
      },
      payloadHash: "abc",
    });

    assert(decisionEvents(events, "payment.webhook.stale").length === 1, "stale");
    assert(
      decisionEvents(events, "payment.webhook.stale")[0].reason === "stale_session",
      "stale_session",
    );
    assert(payment.status === KitPickupPaymentRecordStatus.PENDING, "unchanged");
  }

  // --- ignored_unmapped ---
  {
    const events: PaymentDecisionPayload[] = [];
    const request = baseRequest(now);
    const payment = basePayment(now, request.id);
    const ledger = new Map<LedgerKey, PaymentWebhookEvent>();
    const prisma = createPrismaMock({ request, payment, ledger });
    const svc = new PaymentsService(prisma as never, gateway, {
      environment: "test",
      decisionLogSink: (p) => events.push(p),
    });

    await svc.processVerifiedWebhook({
      providerEventId: "evt_ignore_1",
      event: null,
      payloadHash: "abc",
    });

    assert(
      decisionEvents(events, "payment.webhook.ignored_unmapped").length === 1,
      "ignored",
    );
  }

  // --- signature_rejected via controller ---
  {
    const events: PaymentDecisionPayload[] = [];
    const request = baseRequest(now);
    const payment = basePayment(now, request.id);
    const ledger = new Map<LedgerKey, PaymentWebhookEvent>();
    const prisma = createPrismaMock({ request, payment, ledger });
    const svc = new PaymentsService(prisma as never, gateway, {
      environment: "test",
      decisionLogSink: (p) => events.push(p),
    });
    const controller = new PaymentWebhookController(svc);

    let caught: HttpException | null = null;
    try {
      await controller.webhook(
        { body: { type: "payment.paid" } } as never,
        undefined,
        "bad-signature",
      );
    } catch (error: unknown) {
      caught = error as HttpException;
    }

    assert(caught?.getStatus() === HttpStatus.UNAUTHORIZED, "401");
    assert(events.length === 1, "only signature_rejected");
    assert(events[0].event === "payment.webhook.signature_rejected", "sig event");
    assert(events[0].code === "INVALID_SIGNATURE", "code");
    assertNoSecrets(events[0]);
  }

  // --- payment_failed ---
  {
    const events: PaymentDecisionPayload[] = [];
    const request = baseRequest(now);
    const payment = basePayment(now, request.id);
    const ledger = new Map<LedgerKey, PaymentWebhookEvent>();
    const prisma = createPrismaMock({ request, payment, ledger });
    const svc = new PaymentsService(prisma as never, gateway, {
      environment: "test",
      decisionLogSink: (p) => events.push(p),
    });

    await svc.processVerifiedWebhook({
      providerEventId: "evt_fail_1",
      event: {
        type: "payment.failed",
        provider: "mock",
        providerPaymentId: payment.providerPaymentId,
        paymentId: payment.id,
        kitPickupRequestId: request.id,
      },
      payloadHash: "abc",
    });

    assert(
      decisionEvents(events, "payment.webhook.payment_failed").length === 1,
      "failed",
    );
    assert(
      decisionEvents(events, "payment.webhook.payment_failed")[0].reason ===
        "declined",
      "declined",
    );
    assert(payment.status === KitPickupPaymentRecordStatus.FAILED, "FAILED row");
  }

  // silence unused hmac import if tree-shaken — keep for parity with other tests
  assert(typeof createHmac === "function", "crypto available");

  console.log("payment-webhook-logs.test.ts: OK");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
