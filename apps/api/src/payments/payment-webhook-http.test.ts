/**
 * Unit tests — FASE 3.4-C4 webhook HTTP retry contract.
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
import { PaymentsService } from "./payments.service";
import {
  isPermanentDomainWebhookError,
  isRetryableDomainWebhookError,
  isSignatureVerifyError,
} from "./webhook-http-policy";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function httpError(status: number, code: string): HttpException {
  return new HttpException(
    { status: "error", error: { code, message: code, status } },
    status,
  );
}

type LedgerKey = string;

function ledgerKey(provider: string, eventId: string): LedgerKey {
  return `${provider}::${eventId}`;
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

  const prisma = {
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
          status?: KitPickupRequestStatus | { in: KitPickupRequestStatus[] };
          paymentStatus?: KitPickupPaymentStatus;
        };
        data: Partial<KitPickupRequest>;
      }) => {
        if (where.id !== request.id) return { count: 0 };
        if (
          where.paymentStatus != null &&
          request.paymentStatus !== where.paymentStatus
        ) {
          return { count: 0 };
        }
        const statusOk =
          where.status == null
            ? true
            : typeof where.status === "object" && "in" in where.status
              ? where.status.in.includes(request.status)
              : request.status === where.status;
        if (!statusOk) return { count: 0 };
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
        if (!row) throw new Error("missing ledger row");
        Object.assign(row, data);
        return row;
      },
    },
    $transaction: async (
      ops: Promise<unknown>[] | ((tx: unknown) => Promise<unknown>),
    ) => {
      if (typeof ops === "function") return ops(prisma);
      return Promise.all(ops);
    },
  };

  return prisma;
}

async function run(): Promise<void> {
  assert(isSignatureVerifyError("MISSING_SIGNATURE"), "missing signature");
  assert(isSignatureVerifyError("INVALID_SIGNATURE"), "invalid signature");
  assert(!isSignatureVerifyError("INVALID_PAYLOAD"), "payload is not signature");

  assert(
    isPermanentDomainWebhookError(httpError(409, "AMOUNT_MISMATCH")),
    "AMOUNT_MISMATCH permanent",
  );
  assert(
    isPermanentDomainWebhookError(httpError(409, "REQUEST_CANCELLED")),
    "cancelled permanent",
  );
  assert(
    !isPermanentDomainWebhookError(httpError(404, "PAYMENT_NOT_FOUND")),
    "PAYMENT_NOT_FOUND not permanent ACK",
  );
  assert(
    !isPermanentDomainWebhookError(httpError(401, "UNAUTHORIZED_FUTURE")),
    "unknown 4xx not auto permanent",
  );
  assert(
    isRetryableDomainWebhookError(httpError(404, "PAYMENT_NOT_FOUND")),
    "PAYMENT_NOT_FOUND retryable",
  );

  const gateway = new MockPaymentGateway({
    webhookSecret: "whsec_c4",
    publicApiBaseUrl: "http://localhost:3001",
  });

  // Signature-only 401 path: gateway throws INVALID_SIGNATURE
  {
    try {
      await gateway.verifyAndParseWebhook({
        rawBody: Buffer.from("{}"),
        signatureHeader: "sha256=deadbeef",
      });
      throw new Error("should reject");
    } catch (error: unknown) {
      assert(
        error instanceof Error && error.message === "INVALID_SIGNATURE",
        "bad signature",
      );
    }
  }

  // Authenticated unprocessable payload → event null (not INVALID_SIGNATURE)
  {
    const body = JSON.stringify({ type: "payment.paid", paymentId: "x" });
    const signature = createHmac("sha256", "whsec_c4")
      .update(body, "utf8")
      .digest("hex");
    const parsed = await gateway.verifyAndParseWebhook({
      rawBody: Buffer.from(body, "utf8"),
      signatureHeader: `sha256=${signature}`,
    });
    assert(parsed.event === null, "incomplete payload → null event");
    assert(parsed.providerEventId.length > 0, "event id present for ledger ACK");
  }

  const now = new Date();
  const request: KitPickupRequest = {
    id: "kpr_c4_1",
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

  // Permanent AMOUNT_MISMATCH → PROCESSED, payment unchanged
  {
    const payment: KitPickupPayment = {
      id: "kpp_c4_1",
      kitPickupRequestId: request.id,
      provider: "mock",
      providerPaymentId: "cs_c4",
      amount: new Decimal("10.00"),
      currency: "BRL",
      status: KitPickupPaymentRecordStatus.PENDING,
      createdAt: now,
      updatedAt: now,
    };
    const ledger = new Map<LedgerKey, PaymentWebhookEvent>();
    const prisma = createPrismaMock({ request, payment, ledger });
    const payments = new PaymentsService(prisma as never, gateway);

    const result = await payments.processVerifiedWebhook({
      providerEventId: "evt_mismatch_1",
      event: {
        type: "payment.paid",
        provider: "mock",
        providerPaymentId: "cs_c4",
        paymentId: payment.id,
        kitPickupRequestId: request.id,
        amount: "99.00",
        currency: "BRL",
      },
      payloadHash: "hash1",
    });
    assert(result === "applied", "permanent mismatch ACKed");
    assert(payment.status === KitPickupPaymentRecordStatus.PENDING, "no domain flip");
    const row = ledger.get(ledgerKey("mock", "evt_mismatch_1"));
    assert(row?.processedAt != null, "ledger PROCESSED after permanent");
    assert(row?.status === PaymentWebhookEventStatus.PROCESSED, "status PROCESSED");
  }

  // PAYMENT_NOT_FOUND → 500, ledger stays RECEIVED
  {
    const ledger = new Map<LedgerKey, PaymentWebhookEvent>();
    const prisma = createPrismaMock({ request, payment: null, ledger });
    const payments = new PaymentsService(prisma as never, gateway);

    let threw: HttpException | null = null;
    try {
      await payments.processVerifiedWebhook({
        providerEventId: "evt_missing_1",
        event: {
          type: "payment.paid",
          provider: "mock",
          providerPaymentId: "cs_missing",
          paymentId: "kpp_missing",
          kitPickupRequestId: request.id,
          amount: "10.00",
          currency: "BRL",
        },
        payloadHash: "hash2",
      });
    } catch (error: unknown) {
      assert(error instanceof HttpException, "HttpException");
      threw = error;
    }
    assert(threw != null, "must throw");
    assert(threw!.getStatus() === HttpStatus.INTERNAL_SERVER_ERROR, "500 for NOT_FOUND");
    const body = threw!.getResponse() as { error?: { code?: string } };
    assert(body.error?.code === "PAYMENT_NOT_FOUND", "code retained");
    const row = ledger.get(ledgerKey("mock", "evt_missing_1"));
    assert(row != null, "RECEIVED created");
    assert(row!.processedAt == null, "not PROCESSED — retryable");
    assert(row!.status === PaymentWebhookEventStatus.RECEIVED, "stays RECEIVED");
  }

  // null event (unmapped) → PROCESSED + applied
  {
    const ledger = new Map<LedgerKey, PaymentWebhookEvent>();
    const prisma = createPrismaMock({ request, payment: null, ledger });
    const payments = new PaymentsService(prisma as never, gateway);
    const result = await payments.processVerifiedWebhook({
      providerEventId: "evt_ignore_1",
      event: null,
      payloadHash: "hash3",
    });
    assert(result === "applied", "null event ACKed");
    assert(
      ledger.get(ledgerKey("mock", "evt_ignore_1"))?.processedAt != null,
      "PROCESSED for unmapped",
    );
  }

  console.log("payment-webhook-http.test.ts: OK");
}

run().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
