/**
 * Unit tests — FASE 3.4-C1/C2 payment webhook ledger + event.id idempotency.
 * Run via: pnpm --filter api test
 */
import { createHash } from "node:crypto";
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
import { PaymentsService } from "./payments.service";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

type LedgerKey = string;

function ledgerKey(provider: string, eventId: string): LedgerKey {
  return `${provider}::${eventId}`;
}

function createPrismaMock(params: {
  request: KitPickupRequest;
  payment: KitPickupPayment;
  ledger: Map<LedgerKey, PaymentWebhookEvent>;
  domainApplyCount: { value: number };
}) {
  const { request, payment, ledger, domainApplyCount } = params;

  return {
    kitPickupPayment: {
      findUnique: async ({
        where,
      }: {
        where: { id?: string; providerPaymentId?: string };
      }) => {
        if (where.id && where.id === payment.id) {
          return { ...payment, request };
        }
        if (
          where.providerPaymentId &&
          where.providerPaymentId === payment.providerPaymentId
        ) {
          return { ...payment, request };
        }
        return null;
      },
      update: async ({
        where,
        data,
      }: {
        where: { id: string };
        data: Partial<KitPickupPayment>;
      }) => {
        if (where.id !== payment.id) {
          throw new Error("missing payment");
        }
        Object.assign(payment, data, { updatedAt: new Date() });
        domainApplyCount.value += 1;
        return payment;
      },
    },
    kitPickupRequest: {
      update: async ({
        where,
        data,
      }: {
        where: { id: string };
        data: Partial<KitPickupRequest>;
      }) => {
        if (where.id !== request.id) {
          throw new Error("missing request");
        }
        Object.assign(request, data, { updatedAt: new Date() });
        return request;
      },
    },
    paymentWebhookEvent: {
      findUnique: async ({
        where,
      }: {
        where: { provider_eventId: { provider: string; eventId: string } };
      }) => {
        return (
          ledger.get(
            ledgerKey(where.provider_eventId.provider, where.provider_eventId.eventId),
          ) ?? null
        );
      },
      create: async ({
        data,
      }: {
        data: {
          id: string;
          provider: string;
          eventId: string;
          status: PaymentWebhookEventStatus;
          payloadHash: string | null;
        };
      }) => {
        const key = ledgerKey(data.provider, data.eventId);
        if (ledger.has(key)) {
          throw new Prisma.PrismaClientKnownRequestError("Unique constraint", {
            code: "P2002",
            clientVersion: "test",
          });
        }
        const row: PaymentWebhookEvent = {
          id: data.id,
          provider: data.provider,
          eventId: data.eventId,
          status: data.status,
          payloadHash: data.payloadHash,
          receivedAt: new Date(),
          processedAt: null,
        };
        ledger.set(key, row);
        return row;
      },
      update: async ({
        where,
        data,
      }: {
        where: { provider_eventId: { provider: string; eventId: string } };
        data: {
          status: PaymentWebhookEventStatus;
          processedAt: Date;
        };
      }) => {
        const key = ledgerKey(
          where.provider_eventId.provider,
          where.provider_eventId.eventId,
        );
        const row = ledger.get(key);
        if (!row) {
          throw new Error("missing ledger row");
        }
        Object.assign(row, data);
        return row;
      },
    },
    $transaction: async (ops: Promise<unknown>[] | (() => Promise<unknown>)) => {
      if (typeof ops === "function") {
        return ops();
      }
      return Promise.all(ops);
    },
  };
}

async function run(): Promise<void> {
  const gateway = new MockPaymentGateway({
    webhookSecret: "whsec_ledger_test",
    publicApiBaseUrl: "http://localhost:3001",
  });

  const now = new Date();
  const request: KitPickupRequest = {
    id: "kpr_ledger_1",
    userId: "usr_1",
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

  const payment: KitPickupPayment = {
    id: "kpp_ledger_1",
    kitPickupRequestId: request.id,
    provider: "mock",
    providerPaymentId: "mock_pay_kpp_ledger_1",
    amount: new Decimal("10.00"),
    currency: "BRL",
    status: KitPickupPaymentRecordStatus.PENDING,
    createdAt: now,
    updatedAt: now,
  };

  const ledger = new Map<LedgerKey, PaymentWebhookEvent>();
  const domainApplyCount = { value: 0 };
  const prisma = createPrismaMock({ request, payment, ledger, domainApplyCount });
  const payments = new PaymentsService(prisma as never, gateway);

  const signed = gateway.signPaidEvent({
    paymentId: payment.id,
    providerPaymentId: payment.providerPaymentId,
    kitPickupRequestId: request.id,
    amount: "10.00",
    currency: "BRL",
    eventId: "mock_evt_stable_replay_1",
  });
  const rawBody = Buffer.from(signed.body, "utf8");
  const payloadHash = createHash("sha256").update(rawBody).digest("hex");

  const parsed = await gateway.verifyAndParseWebhook({
    rawBody,
    signatureHeader: signed.signature,
  });
  assert(parsed.providerEventId === "mock_evt_stable_replay_1", "explicit event id");
  assert(parsed.event?.type === "payment.paid", "paid event");

  const first = await payments.processVerifiedWebhook({
    providerEventId: parsed.providerEventId,
    event: parsed.event,
    payloadHash,
  });
  assert(first === "applied", "first delivery applied");
  assert(request.status === KitPickupRequestStatus.PICKUP_PENDING, "request paid");
  assert(payment.status === KitPickupPaymentRecordStatus.PAID, "payment paid");
  assert(domainApplyCount.value === 1, "domain applied once");

  const ledgerRow = ledger.get(ledgerKey("mock", "mock_evt_stable_replay_1"));
  assert(ledgerRow != null, "ledger row exists");
  assert(ledgerRow.status === PaymentWebhookEventStatus.PROCESSED, "ledger processed");
  assert(ledgerRow.processedAt != null, "processed_at set");
  assert(ledgerRow.receivedAt != null, "received_at set");
  assert(ledgerRow.payloadHash === payloadHash, "payload hash stored");

  const updatedAtBeforeReplay = request.updatedAt;

  const second = await payments.processVerifiedWebhook({
    providerEventId: parsed.providerEventId,
    event: parsed.event,
    payloadHash,
  });
  assert(second === "duplicate", "second delivery short-circuits");
  assert(domainApplyCount.value === 1, "domain not re-applied on duplicate");
  assert(
    request.updatedAt.getTime() === updatedAtBeforeReplay.getTime(),
    "no domain write on duplicate",
  );

  const third = await payments.processVerifiedWebhook({
    providerEventId: parsed.providerEventId,
    event: parsed.event,
    payloadHash,
  });
  assert(third === "duplicate", "third replay still short-circuits");
  assert(domainApplyCount.value === 1, "domain still applied once after multi-replay");
  assert(ledger.size === 1, "single ledger row for provider+event_id");

  // Synthetic id from body hash when eventId omitted
  const unsignedId = gateway.signPaidEvent({
    paymentId: payment.id,
    providerPaymentId: payment.providerPaymentId,
    kitPickupRequestId: request.id,
    amount: "10.00",
    currency: "BRL",
  });
  const hashed = await gateway.verifyAndParseWebhook({
    rawBody: Buffer.from(unsignedId.body, "utf8"),
    signatureHeader: unsignedId.signature,
  });
  assert(hashed.providerEventId.startsWith("mock_evt_"), "hash-derived mock event id");
  const again = await gateway.verifyAndParseWebhook({
    rawBody: Buffer.from(unsignedId.body, "utf8"),
    signatureHeader: unsignedId.signature,
  });
  assert(
    again.providerEventId === hashed.providerEventId,
    "synthetic id stable for identical body",
  );

  console.log("payment-webhook-ledger.test.ts: OK");
}

run().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
