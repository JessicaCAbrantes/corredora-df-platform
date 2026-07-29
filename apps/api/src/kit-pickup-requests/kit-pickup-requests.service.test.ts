/**
 * Unit tests — Kit Pickup Requests Phase 2 (create/term/cancel/ownership/payment).
 * Run: pnpm --filter api test
 */
import { createHmac } from "node:crypto";
import { HttpException } from "@nestjs/common";
import {
  EventCategory,
  EventLifecycleStatus,
  EventRegistrationMode,
  EventRegistrationStatus,
  KitPickupPaymentRecordStatus,
  KitPickupPaymentStatus,
  KitPickupRequestStatus,
  type Event,
  type EventRegistration,
  type KitPickupRequest,
  type KitPickupService,
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { resolveCurrentUserId } from "../auth/auth.boundary";
import { createSessionToken, SESSION_COOKIE_NAME } from "../auth/session-cookie";
import { MockPaymentGateway } from "../payments/mock-payment-gateway";
import { PaymentsService } from "../payments/payments.service";
import type { CreateKitPickupRequestDto } from "./dto/create-kit-pickup-request.dto";
import { KitPickupRequestsService } from "./kit-pickup-requests.service";
import {
  KIT_PICKUP_TERM_VERSION,
  hashKitPickupTerm,
} from "./kit-pickup-term";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function expectHttpError(
  fn: () => Promise<unknown>,
  status: number,
  code: string,
): Promise<void> {
  try {
    await fn();
    throw new Error(`Expected HttpException ${code}`);
  } catch (error: unknown) {
    assert(error instanceof HttpException, `Expected HttpException, got ${error}`);
    assert(
      error.getStatus() === status,
      `Expected status ${status}, got ${error.getStatus()}`,
    );
    const body = error.getResponse() as { error?: { code?: string } };
    assert(
      body.error?.code === code,
      `Expected code ${code}, got ${body.error?.code}`,
    );
  }
}

const USER = "usr_seed_01";
const OTHER = "usr_other";

function baseEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: "evt_01_meia",
    name: "Meia Maratona",
    slug: "meia-maratona-brasilia",
    date: new Date("2026-08-16T10:00:00.000Z"),
    city: "Brasília",
    category: EventCategory.half_marathon,
    distance: "21K",
    status: EventLifecycleStatus.active,
    registrationStatus: EventRegistrationStatus.open,
    registrationMode: EventRegistrationMode.internal,
    coverImage: "https://example.com/x.jpg",
    priceAmount: new Decimal(149),
    priceCurrency: "BRL",
    createdAt: new Date("2026-01-10T10:00:00.000Z"),
    ...overrides,
  };
}

function baseService(
  overrides: Partial<KitPickupService> & { event?: Event } = {},
): KitPickupService & { event: Event } {
  const { event, ...rest } = overrides;
  return {
    id: "kps_01_own_event",
    eventId: "evt_01_meia",
    title: "Retirada de kit",
    serviceAvailable: true,
    feeAmount: null,
    feeCurrency: "BRL",
    pickupLocation: "Asa Norte",
    pickupStartAt: new Date("2026-08-10T12:00:00.000Z"),
    pickupEndAt: new Date("2026-08-12T21:00:00.000Z"),
    createdAt: new Date("2026-07-01T00:00:00.000Z"),
    updatedAt: new Date("2026-07-01T00:00:00.000Z"),
    ...rest,
    event: event ?? baseEvent(),
  };
}

type Store = {
  services: Map<string, KitPickupService & { event: Event }>;
  registrations: Map<string, EventRegistration>;
  requests: Map<string, KitPickupRequest & {
    participant: {
      fullName: string;
      email: string;
      phone: string;
      externalRegistrationCode: string;
    } | null;
    termAcceptance: {
      version: string;
      termContentHash: string;
      acceptedAt: Date;
      acceptedByUserId: string;
    } | null;
  }>;
  payments: Map<
    string,
    {
      id: string;
      kitPickupRequestId: string;
      provider: string;
      providerPaymentId: string;
      amount: Decimal;
      currency: string;
      status: KitPickupPaymentRecordStatus;
      createdAt: Date;
      updatedAt: Date;
    }
  >;
};

function createPrismaMock(store: Store) {
  return {
    kitPickupService: {
      findUnique: async ({ where }: { where: { id: string } }) =>
        store.services.get(where.id) ?? null,
    },
    eventRegistration: {
      findUnique: async ({ where }: { where: { id: string } }) =>
        store.registrations.get(where.id) ?? null,
      create: async () => {
        throw new Error("must not create EventRegistration for external");
      },
    },
    kitPickupRequest: {
      findFirst: async ({
        where,
      }: {
        where: {
          id?: string;
          userId?: string;
          kitPickupServiceId?: string;
          status?: { not: KitPickupRequestStatus };
        };
        include?: unknown;
      }) => {
        const rows = [...store.requests.values()].filter((row) => {
          if (where.id && row.id !== where.id) return false;
          if (where.userId && row.userId !== where.userId) return false;
          if (
            where.kitPickupServiceId &&
            row.kitPickupServiceId !== where.kitPickupServiceId
          ) {
            return false;
          }
          if (where.status?.not && row.status === where.status.not) return false;
          return true;
        });
        const row = rows[0];
        if (!row) return null;
        const service = store.services.get(row.kitPickupServiceId)!;
        const payments = [...store.payments.values()].filter(
          (p) =>
            p.kitPickupRequestId === row.id &&
            p.status === KitPickupPaymentRecordStatus.PENDING,
        );
        return { ...row, kitPickupService: service, payments };
      },
      findFirstOrThrow: async (args: {
        where: { id: string; userId: string };
      }) => {
        const row = await createPrismaMock(store).kitPickupRequest.findFirst(args);
        if (!row) throw new Error("not found");
        return row;
      },
      findMany: async ({ where }: { where: { userId: string } }) => {
        return [...store.requests.values()]
          .filter((row) => row.userId === where.userId)
          .map((row) => ({
            ...row,
            kitPickupService: store.services.get(row.kitPickupServiceId)!,
          }));
      },
      create: async ({
        data,
      }: {
        data: {
          userId: string;
          kitPickupServiceId: string;
          registrationId: string | null;
          status: KitPickupRequestStatus;
          paymentStatus: KitPickupPaymentStatus;
          feeAmountSnapshot: Decimal | null;
          feeCurrencySnapshot: string | null;
          participant?: {
            create: {
              fullName: string;
              email: string;
              phone: string;
              externalRegistrationCode: string;
            };
          };
        };
      }) => {
        const id = `kpr_${store.requests.size + 1}`;
        const now = new Date();
        const row = {
          id,
          userId: data.userId,
          kitPickupServiceId: data.kitPickupServiceId,
          registrationId: data.registrationId,
          status: data.status,
          paymentStatus: data.paymentStatus,
          feeAmountSnapshot: data.feeAmountSnapshot,
          feeCurrencySnapshot: data.feeCurrencySnapshot,
          pickedUpAt: null as Date | null,
          pickedUpBy: null as string | null,
          custodyAt: null as Date | null,
          custodyBy: null as string | null,
          readyAt: null as Date | null,
          readyBy: null as string | null,
          deliveredAt: null as Date | null,
          deliveredBy: null as string | null,
          receivedByName: null as string | null,
          handoverNotes: null as string | null,
          createdAt: now,
          updatedAt: now,
          participant: data.participant
            ? { ...data.participant.create }
            : null,
          termAcceptance: null,
        };
        store.requests.set(id, row);
        const service = store.services.get(row.kitPickupServiceId)!;
        return { ...row, kitPickupService: service };
      },
      update: async ({
        where,
        data,
      }: {
        where: { id: string };
        data: Partial<{
          status: KitPickupRequestStatus;
          paymentStatus: KitPickupPaymentStatus;
        }>;
      }) => {
        const row = store.requests.get(where.id);
        if (!row) throw new Error("missing");
        Object.assign(row, data, { updatedAt: new Date() });
        const service = store.services.get(row.kitPickupServiceId)!;
        return { ...row, kitPickupService: service };
      },
    },
    pickupTermAcceptance: {
      create: async ({
        data,
      }: {
        data: {
          kitPickupRequestId: string;
          version: string;
          termContentHash: string;
          acceptedByUserId: string;
        };
      }) => {
        const row = store.requests.get(data.kitPickupRequestId);
        if (!row) throw new Error("missing request");
        row.termAcceptance = {
          version: data.version,
          termContentHash: data.termContentHash,
          acceptedAt: new Date(),
          acceptedByUserId: data.acceptedByUserId,
        };
        return data;
      },
    },
    kitPickupPayment: {
      findUnique: async ({
        where,
      }: {
        where: { id?: string; providerPaymentId?: string };
      }) => {
        if (where.id) {
          const p = store.payments.get(where.id);
          if (!p) return null;
          const request = store.requests.get(p.kitPickupRequestId)!;
          return { ...p, request };
        }
        if (where.providerPaymentId) {
          const p = [...store.payments.values()].find(
            (x) => x.providerPaymentId === where.providerPaymentId,
          );
          if (!p) return null;
          const request = store.requests.get(p.kitPickupRequestId)!;
          return { ...p, request };
        }
        return null;
      },
      create: async ({
        data,
      }: {
        data: {
          id: string;
          kitPickupRequestId: string;
          provider: string;
          providerPaymentId: string;
          amount: Decimal;
          currency: string;
          status: KitPickupPaymentRecordStatus;
        };
      }) => {
        const now = new Date();
        const row = { ...data, createdAt: now, updatedAt: now };
        store.payments.set(data.id, row);
        return row;
      },
      update: async ({
        where,
        data,
      }: {
        where: { id: string };
        data: Partial<{
          status: KitPickupPaymentRecordStatus;
          provider: string;
          providerPaymentId: string;
        }>;
      }) => {
        const row = store.payments.get(where.id);
        if (!row) throw new Error("missing payment");
        Object.assign(row, data, { updatedAt: new Date() });
        return row;
      },
    },
    $transaction: async (ops: Promise<unknown>[] | (() => Promise<unknown>)) => {
      if (typeof ops === "function") return ops();
      return Promise.all(ops);
    },
  };
}

async function run(): Promise<void> {
  const previousSecret = process.env.AUTH_SECRET;
  process.env.AUTH_SECRET = "test-auth-secret-for-unit-tests";

  // Auth: body.userId ignored
  {
    const token = createSessionToken(USER, process.env.AUTH_SECRET);
    const req = {
      headers: { cookie: `${SESSION_COOKIE_NAME}=${token}` },
      body: { userId: "attacker" },
    } as never;
    assert(resolveCurrentUserId(req) === USER, "userId from session only");
  }

  // --- Internal create ---
  {
    const store: Store = {
      services: new Map([
        ["kps_01_own_event", baseService()],
      ]),
      registrations: new Map([
        [
          "reg_ok",
          {
            id: "reg_ok",
            eventId: "evt_01_meia",
            userId: USER,
            createdAt: new Date(),
          },
        ],
        [
          "reg_other_user",
          {
            id: "reg_other_user",
            eventId: "evt_01_meia",
            userId: OTHER,
            createdAt: new Date(),
          },
        ],
        [
          "reg_other_event",
          {
            id: "reg_other_event",
            eventId: "evt_other",
            userId: USER,
            createdAt: new Date(),
          },
        ],
      ]),
      requests: new Map(),
      payments: new Map(),
    };
    const service = new KitPickupRequestsService(
      createPrismaMock(store) as never,
    );

    const created = await service.create(USER, {
      kitPickupServiceId: "kps_01_own_event",
      registrationId: "reg_ok",
    });
    assert(created.data.status === "TERM_PENDING", "starts TERM_PENDING");
    assert(created.data.registrationId === "reg_ok", "keeps registrationId");
    assert(created.data.feeAmount === null, "null fee snapshotted");
    assert(created.data.participant === null, "no snapshot internal");
    assert(created.data.term.accepted === false, "term not auto-accepted");

    await expectHttpError(
      () =>
        service.create(USER, {
          kitPickupServiceId: "kps_01_own_event",
          registrationId: "reg_ok",
        }),
      409,
      "ACTIVE_REQUEST_EXISTS",
    );

    await expectHttpError(
      () =>
        service.create(USER, {
          kitPickupServiceId: "kps_01_own_event",
        } as CreateKitPickupRequestDto),
      400,
      "REGISTRATION_REQUIRED",
    );

    await expectHttpError(
      () =>
        service.create(USER, {
          kitPickupServiceId: "kps_01_own_event",
          registrationId: "reg_other_user",
        }),
      403,
      "REGISTRATION_FORBIDDEN",
    );

    await expectHttpError(
      () =>
        service.create(USER, {
          kitPickupServiceId: "kps_01_own_event",
          registrationId: "reg_other_event",
        }),
      400,
      "REGISTRATION_EVENT_MISMATCH",
    );

    await expectHttpError(
      () =>
        service.create(USER, {
          kitPickupServiceId: "kps_01_own_event",
          registrationId: "reg_ok",
          participant: {
            fullName: "X",
            email: "x@y.com",
            phone: "11999999999",
            externalRegistrationCode: "ABC",
          },
        }),
      400,
      "PARTICIPANT_NOT_ALLOWED",
    );

    // accept term → no fee → PICKUP_PENDING + WAIVED payment
    const afterTerm = await service.acceptTerm(USER, created.data.id);
    assert(afterTerm.data.status === "PICKUP_PENDING", "no fee → PICKUP_PENDING");
    assert(afterTerm.data.paymentStatus === "WAIVED", "paymentStatus WAIVED");
    assert(afterTerm.data.term.accepted === true, "term accepted");
    assert(
      afterTerm.data.term.version === KIT_PICKUP_TERM_VERSION,
      "term version stored",
    );

    // idempotent accept
    const again = await service.acceptTerm(USER, created.data.id);
    assert(again.data.term.accepted === true, "accept idempotent");

    // ownership get
    await expectHttpError(
      () => service.getMine(OTHER, created.data.id),
      404,
      "NOT_FOUND",
    );

    const mine = await service.listMine(USER);
    assert(mine.data.length === 1, "listMine only own");
    assert(mine.data[0]?.id === created.data.id, "own id");

    // cancel → allows recreate
    const cancelled = await service.cancel(USER, created.data.id);
    assert(cancelled.data.status === "CANCELLED", "cancelled");

    const recreated = await service.create(USER, {
      kitPickupServiceId: "kps_01_own_event",
      registrationId: "reg_ok",
    });
    assert(recreated.data.id !== created.data.id, "new request after cancel");
  }

  // --- External create ---
  {
    const externalService = baseService({
      id: "kps_02_third_party",
      eventId: "evt_03_5k_ini",
      feeAmount: new Decimal("10.00"),
      feeCurrency: "BRL",
      event: baseEvent({
        id: "evt_03_5k_ini",
        slug: "5k-iniciantes",
        name: "5K Iniciantes",
        registrationMode: EventRegistrationMode.external,
      }),
    });
    const store: Store = {
      services: new Map([["kps_02_third_party", externalService]]),
      registrations: new Map(),
      requests: new Map(),
      payments: new Map(),
    };
    const prisma = createPrismaMock(store);
    const service = new KitPickupRequestsService(prisma as never);

    await expectHttpError(
      () =>
        service.create(USER, {
          kitPickupServiceId: "kps_02_third_party",
          registrationId: "reg_x",
        }),
      400,
      "REGISTRATION_NOT_ALLOWED",
    );

    await expectHttpError(
      () =>
        service.create(USER, {
          kitPickupServiceId: "kps_02_third_party",
        } as CreateKitPickupRequestDto),
      400,
      "PARTICIPANT_REQUIRED",
    );

    const created = await service.create(USER, {
      kitPickupServiceId: "kps_02_third_party",
      participant: {
        fullName: "Participante Teste",
        email: "part@example.com",
        phone: "61999999999",
        externalRegistrationCode: "INS-123",
      },
    });
    assert(created.data.registrationMode === "external", "external mode");
    assert(created.data.feeAmount === "10.00", "fee snapshot frozen");
    assert(created.data.feeCurrency === "BRL", "currency snapshot");
    assert(
      created.data.participant?.externalRegistrationCode === "INS-123",
      "snapshot stored",
    );
    assert(store.registrations.size === 0, "no EventRegistration created");

    const afterTerm = await service.acceptTerm(USER, created.data.id);
    assert(afterTerm.data.status === "PAYMENT_PENDING", "fee → PAYMENT_PENDING");
    assert(afterTerm.data.paymentStatus === "PENDING", "payment pending");

    // Payment checkout + webhook
    const gateway = new MockPaymentGateway({
      webhookSecret: "whsec_test",
      publicApiBaseUrl: "http://localhost:3001",
    });
    const payments = new PaymentsService(prisma as never, gateway);

    const checkout = await payments.createCheckoutForRequest({
      userId: USER,
      requestId: created.data.id,
      successUrl: "http://localhost:3000/ok",
      cancelUrl: "http://localhost:3000/cancel",
    });
    assert(checkout.checkoutUrl.includes("mock-checkout"), "mock checkout url");

    const payment = [...store.payments.values()][0]!;
    const signed = gateway.signPaidEvent({
      paymentId: payment.id,
      providerPaymentId: checkout.paymentId === payment.id
        ? payment.providerPaymentId
        : payment.providerPaymentId,
      kitPickupRequestId: created.data.id,
      amount: "10.00",
      currency: "BRL",
    });

    // Fix: after checkout, providerPaymentId was updated — re-read
    const paymentAfter = store.payments.get(payment.id)!;
    const signed2 = gateway.signPaidEvent({
      paymentId: paymentAfter.id,
      providerPaymentId: paymentAfter.providerPaymentId,
      kitPickupRequestId: created.data.id,
      amount: "10.00",
      currency: "BRL",
    });

    const event = await gateway.verifyAndParseWebhook({
      rawBody: Buffer.from(signed2.body, "utf8"),
      signatureHeader: signed2.signature,
    });
    assert(event?.type === "payment.paid", "webhook parses paid");
    await payments.handleVerifiedEvent(event!);

    const paidRow = store.requests.get(created.data.id)!;
    assert(paidRow.status === "PICKUP_PENDING", "request PICKUP_PENDING via webhook");
    assert(paidRow.paymentStatus === "PAID", "paymentStatus PAID");

    // idempotent webhook
    await payments.handleVerifiedEvent(event!);
    assert(
      store.requests.get(created.data.id)!.status === "PICKUP_PENDING",
      "idempotent",
    );

    // invalid signature
    try {
      await gateway.verifyAndParseWebhook({
        rawBody: Buffer.from(signed2.body, "utf8"),
        signatureHeader: "sha256=deadbeef",
      });
      throw new Error("should reject bad signature");
    } catch (error: unknown) {
      assert(
        error instanceof Error && error.message === "INVALID_SIGNATURE",
        "invalid signature rejected",
      );
    }

    // amount mismatch
    const badAmount = gateway.signPaidEvent({
      paymentId: paymentAfter.id,
      providerPaymentId: paymentAfter.providerPaymentId,
      kitPickupRequestId: created.data.id,
      amount: "99.00",
      currency: "BRL",
    });
    // Reset payment to PENDING to test mismatch path on a fresh paid attempt
    paymentAfter.status = KitPickupPaymentRecordStatus.PENDING;
    paidRow.status = KitPickupRequestStatus.PAYMENT_PENDING;
    paidRow.paymentStatus = KitPickupPaymentStatus.PENDING;
    const badEvent = await gateway.verifyAndParseWebhook({
      rawBody: Buffer.from(badAmount.body, "utf8"),
      signatureHeader: badAmount.signature,
    });
    await expectHttpError(
      () => payments.handleVerifiedEvent(badEvent!),
      409,
      "AMOUNT_MISMATCH",
    );

    // unused signed var silence
    assert(typeof signed.body === "string", "signed helper works");
    assert(hashKitPickupTerm().length === 64, "term hash sha256");
  }

  // Client cannot set PAID via service API — no such method; only webhook.
  // Forbidden cancel of other user already covered via getMine 404 pattern:
  {
    const store: Store = {
      services: new Map([["kps_01_own_event", baseService()]]),
      registrations: new Map([
        [
          "reg_ok",
          {
            id: "reg_ok",
            eventId: "evt_01_meia",
            userId: USER,
            createdAt: new Date(),
          },
        ],
      ]),
      requests: new Map(),
      payments: new Map(),
    };
    const service = new KitPickupRequestsService(
      createPrismaMock(store) as never,
    );
    const created = await service.create(USER, {
      kitPickupServiceId: "kps_01_own_event",
      registrationId: "reg_ok",
    });
    await expectHttpError(
      () => service.cancel(OTHER, created.data.id),
      404,
      "NOT_FOUND",
    );
    await expectHttpError(
      () => service.acceptTerm(OTHER, created.data.id),
      404,
      "NOT_FOUND",
    );
    await expectHttpError(
      () => service.cancel(USER, "missing"),
      404,
      "NOT_FOUND",
    );
  }

  // Mock HMAC helper sanity (createHmac)
  {
    const body = '{"type":"payment.paid"}';
    const sig = createHmac("sha256", "secret").update(body).digest("hex");
    assert(sig.length === 64, "hmac length");
  }

  process.env.AUTH_SECRET = previousSecret;
  console.log("kit-pickup-requests.service.test.ts: OK");
}

run().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
