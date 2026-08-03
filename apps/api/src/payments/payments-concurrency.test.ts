/**
 * Unit tests — FASE 3.4-C3 payments concurrency (A+B+C).
 * Run via: pnpm --filter api test
 */
import {
  KitPickupPaymentRecordStatus,
  KitPickupPaymentStatus,
  KitPickupRequestStatus,
  Prisma,
  type KitPickupPayment,
  type KitPickupRequest,
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { MockPaymentGateway } from "./mock-payment-gateway";
import {
  isCurrentProviderSession,
  isPendingRequestUniqueConflict,
  KIT_PICKUP_PAYMENTS_PENDING_REQUEST_UIDX,
  PaymentsService,
} from "./payments.service";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function baseRequest(now: Date): KitPickupRequest {
  return {
    id: "kpr_c3_1",
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
}

function basePayment(now: Date, requestId: string): KitPickupPayment {
  return {
    id: "kpp_c3_1",
    kitPickupRequestId: requestId,
    provider: "mock",
    providerPaymentId: "cs_current",
    amount: new Decimal("10.00"),
    currency: "BRL",
    status: KitPickupPaymentRecordStatus.PENDING,
    createdAt: now,
    updatedAt: now,
  };
}

function createPrismaMock(params: {
  request: KitPickupRequest;
  payment: KitPickupPayment;
  payments?: Map<string, KitPickupPayment>;
}) {
  const { request, payment } = params;
  const payments = params.payments ?? new Map([[payment.id, payment]]);

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
      findFirst: async ({
        where,
      }: {
        where: {
          kitPickupRequestId: string;
          status: KitPickupPaymentRecordStatus;
        };
      }) => {
        return (
          [...payments.values()].find(
            (p) =>
              p.kitPickupRequestId === where.kitPickupRequestId &&
              p.status === where.status,
          ) ?? null
        );
      },
      create: async ({ data }: { data: KitPickupPayment }) => {
        const pendingExists = [...payments.values()].some(
          (p) =>
            p.kitPickupRequestId === data.kitPickupRequestId &&
            p.status === KitPickupPaymentRecordStatus.PENDING,
        );
        if (pendingExists && data.status === KitPickupPaymentRecordStatus.PENDING) {
          throw new Prisma.PrismaClientKnownRequestError("Unique constraint", {
            code: "P2002",
            clientVersion: "test",
            meta: { constraint: KIT_PICKUP_PAYMENTS_PENDING_REQUEST_UIDX },
          });
        }
        payments.set(data.id, { ...data });
        return data;
      },
      update: async ({
        where,
        data,
      }: {
        where: { id: string };
        data: Partial<KitPickupPayment>;
      }) => {
        const row = payments.get(where.id);
        if (!row) throw new Error("missing payment");
        Object.assign(row, data, { updatedAt: new Date() });
        return row;
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
      update: async ({
        where,
        data,
      }: {
        where: { id: string };
        data: Partial<KitPickupRequest>;
      }) => {
        if (where.id !== request.id) throw new Error("missing request");
        Object.assign(request, data, { updatedAt: new Date() });
        return request;
      },
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
    $transaction: async (
      ops: Promise<unknown>[] | ((tx: unknown) => Promise<unknown>),
    ) => {
      if (typeof ops === "function") return ops(prisma);
      return Promise.all(ops);
    },
  };

  return { prisma, payments };
}

async function run(): Promise<void> {
  assert(
    isCurrentProviderSession("cs_current", "cs_current"),
    "current session matches",
  );
  assert(
    isCurrentProviderSession("pending_kpp_1", "cs_new"),
    "pending placeholder accepts bind",
  );
  assert(
    !isCurrentProviderSession("cs_current", "cs_stale"),
    "stale session rejected",
  );

  assert(
    isPendingRequestUniqueConflict(
      new Prisma.PrismaClientKnownRequestError("Unique", {
        code: "P2002",
        clientVersion: "test",
        meta: { constraint: KIT_PICKUP_PAYMENTS_PENDING_REQUEST_UIDX },
      }),
    ),
    "detects pending-request unique",
  );
  assert(
    !isPendingRequestUniqueConflict(
      new Prisma.PrismaClientKnownRequestError("Unique", {
        code: "P2002",
        clientVersion: "test",
        meta: { target: ["provider_payment_id"] },
      }),
    ),
    "other P2002 not masked",
  );

  const gateway = new MockPaymentGateway({
    webhookSecret: "whsec_c3",
    publicApiBaseUrl: "http://localhost:3001",
  });

  // --- paid then failed: FAILED must not clobber PAID ---
  {
    const now = new Date();
    const request = baseRequest(now);
    const payment = basePayment(now, request.id);
    const { prisma } = createPrismaMock({ request, payment });
    const payments = new PaymentsService(prisma as never, gateway);

    await payments.handleVerifiedEvent({
      type: "payment.paid",
      provider: "mock",
      providerPaymentId: "cs_current",
      paymentId: payment.id,
      kitPickupRequestId: request.id,
      amount: "10.00",
      currency: "BRL",
    });
    assert(payment.status === KitPickupPaymentRecordStatus.PAID, "paid first");
    assert(request.status === KitPickupRequestStatus.PICKUP_PENDING, "request advanced");
    assert(request.paymentStatus === KitPickupPaymentStatus.PAID, "paymentStatus PAID");

    await payments.handleVerifiedEvent({
      type: "payment.failed",
      provider: "mock",
      providerPaymentId: "cs_current",
      paymentId: payment.id,
      kitPickupRequestId: request.id,
    });
    assert(payment.status === KitPickupPaymentRecordStatus.PAID, "failed does not overwrite paid");
    assert(request.paymentStatus === KitPickupPaymentStatus.PAID, "request paymentStatus stays PAID");
  }

  // --- failed then paid: existing semantics allow PAID after FAILED ---
  {
    const now = new Date();
    const request = baseRequest(now);
    const payment = basePayment(now, request.id);
    const { prisma } = createPrismaMock({ request, payment });
    const payments = new PaymentsService(prisma as never, gateway);

    await payments.handleVerifiedEvent({
      type: "payment.failed",
      provider: "mock",
      providerPaymentId: "cs_current",
      paymentId: payment.id,
      kitPickupRequestId: request.id,
    });
    assert(
      payment.status === KitPickupPaymentRecordStatus.FAILED,
      "failed first",
    );
    assert(
      request.paymentStatus === KitPickupPaymentStatus.FAILED,
      "paymentStatus FAILED",
    );
    assert(
      request.status === KitPickupRequestStatus.PAYMENT_PENDING,
      "request status unchanged",
    );

    await payments.handleVerifiedEvent({
      type: "payment.paid",
      provider: "mock",
      providerPaymentId: "cs_current",
      paymentId: payment.id,
      kitPickupRequestId: request.id,
      amount: "10.00",
      currency: "BRL",
    });
    const afterPaidStatus = payment.status as KitPickupPaymentRecordStatus;
    const afterPaidRequestStatus = request.status as KitPickupRequestStatus;
    const afterPaidPaymentStatus = request.paymentStatus as KitPickupPaymentStatus;
    assert(
      afterPaidStatus === KitPickupPaymentRecordStatus.PAID,
      "paid after failed",
    );
    assert(
      afterPaidRequestStatus === KitPickupRequestStatus.PICKUP_PENDING,
      "request advanced after paid",
    );
    assert(
      afterPaidPaymentStatus === KitPickupPaymentStatus.PAID,
      "paymentStatus PAID after recovery",
    );
  }

  // --- stale checkout ignored ---
  {
    const now = new Date();
    const request = baseRequest(now);
    const payment = basePayment(now, request.id);
    payment.providerPaymentId = "cs_new";
    const { prisma } = createPrismaMock({ request, payment });
    const payments = new PaymentsService(prisma as never, gateway);

    await payments.handleVerifiedEvent({
      type: "payment.paid",
      provider: "mock",
      providerPaymentId: "cs_old",
      paymentId: payment.id,
      kitPickupRequestId: request.id,
      amount: "10.00",
      currency: "BRL",
    });
    assert(payment.status === KitPickupPaymentRecordStatus.PENDING, "stale paid ignored");
    assert(payment.providerPaymentId === "cs_new", "providerPaymentId unchanged");

    await payments.handleVerifiedEvent({
      type: "payment.failed",
      provider: "mock",
      providerPaymentId: "cs_old",
      paymentId: payment.id,
      kitPickupRequestId: request.id,
    });
    assert(payment.status === KitPickupPaymentRecordStatus.PENDING, "stale failed ignored");
  }

  // --- concurrent create → P2002 → reuse PENDING ---
  {
    const now = new Date();
    const request = baseRequest(now);
    request.status = KitPickupRequestStatus.TERM_ACCEPTED;
    const existing = basePayment(now, request.id);
    existing.providerPaymentId = "pending_existing";
    const paymentsMap = new Map([[existing.id, existing]]);
    const { prisma } = createPrismaMock({
      request,
      payment: existing,
      payments: paymentsMap,
    });

    // Enrich findFirst for createCheckout path
    const prismaWithCheckout = {
      ...prisma,
      kitPickupRequest: {
        ...prisma.kitPickupRequest,
        findFirst: async () => ({
          ...request,
          termAcceptance: { version: "1" },
          payments: [existing],
        }),
      },
    };
    // First path: existing pending already present → reuse without create
    const paymentsSvc = new PaymentsService(prismaWithCheckout as never, gateway);
    const result = await paymentsSvc.createCheckoutForRequest({
      userId: request.userId,
      requestId: request.id,
      successUrl: "http://ok",
      cancelUrl: "http://cancel",
    });
    assert(result.paymentId === existing.id, "reuses existing pending");
    assert(paymentsMap.size === 1, "still one payment row");

    // Explicit P2002 path: no payments in include, create races
    const request2 = baseRequest(now);
    request2.id = "kpr_c3_race";
    request2.status = KitPickupRequestStatus.TERM_ACCEPTED;
    const racedPending = basePayment(now, request2.id);
    racedPending.id = "kpp_raced";
    racedPending.providerPaymentId = "pending_raced";
    const raceMap = new Map([[racedPending.id, racedPending]]);
    const racePrismaBase = createPrismaMock({
      request: request2,
      payment: racedPending,
      payments: raceMap,
    });
    let createAttempts = 0;
    const racePrisma = {
      ...racePrismaBase.prisma,
      kitPickupRequest: {
        findFirst: async () => ({
          ...request2,
          termAcceptance: { version: "1" },
          payments: [], // concurrent peer already inserted PENDING
        }),
        update: racePrismaBase.prisma.kitPickupRequest.update,
        updateMany: racePrismaBase.prisma.kitPickupRequest.updateMany,
      },
      kitPickupPayment: {
        ...racePrismaBase.prisma.kitPickupPayment,
        create: async (_data: { data: KitPickupPayment }) => {
          createAttempts += 1;
          throw new Prisma.PrismaClientKnownRequestError("Unique constraint", {
            code: "P2002",
            clientVersion: "test",
            meta: { constraint: KIT_PICKUP_PAYMENTS_PENDING_REQUEST_UIDX },
          });
        },
        findFirst: async () => racedPending,
      },
    };
    const raceSvc = new PaymentsService(racePrisma as never, gateway);
    const reused = await raceSvc.createCheckoutForRequest({
      userId: request2.userId,
      requestId: request2.id,
      successUrl: "http://ok",
      cancelUrl: "http://cancel",
    });
    assert(createAttempts === 1, "create attempted once");
    assert(reused.paymentId === racedPending.id, "P2002 reuses raced PENDING");
    assert(raceMap.size === 1, "no second PENDING created");
  }

  console.log("payments-concurrency.test.ts: OK");
}

run().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
