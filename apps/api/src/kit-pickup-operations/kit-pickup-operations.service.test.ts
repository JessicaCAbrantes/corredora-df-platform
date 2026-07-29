/**
 * Unit tests — Kit Pickup Operations Phase 2.1
 */
import { HttpException } from "@nestjs/common";
import {
  EventCategory,
  EventLifecycleStatus,
  EventRegistrationMode,
  EventRegistrationStatus,
  KitPickupPaymentStatus,
  KitPickupRequestStatus,
  type Event,
  type KitPickupRequest,
  type KitPickupService,
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import {
  assertKitPickupOperator,
  isKitPickupOperator,
  parseKitPickupOperatorIds,
} from "./assert-kit-pickup-operator";
import { KitPickupOperationsService } from "./kit-pickup-operations.service";

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
    assert(error.getStatus() === status, `status ${status}`);
    const body = error.getResponse() as { error?: { code?: string } };
    assert(body.error?.code === code, `code ${code}, got ${body.error?.code}`);
  }
}

const OPERATOR = "usr_operator_01";
const OTHER = "usr_other";

function baseEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: "evt_01_meia",
    name: "Meia",
    slug: "meia",
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

type Row = KitPickupRequest & {
  participant: {
    fullName: string;
    email: string;
    phone: string;
    externalRegistrationCode: string;
  } | null;
  termAcceptance: { acceptedAt: Date } | null;
};

function createStore(initial: Partial<Row> & { id: string }) {
  const service: KitPickupService & { event: Event } = {
    id: "kps_01",
    eventId: "evt_01_meia",
    title: "Retirada",
    serviceAvailable: true,
    feeAmount: null,
    feeCurrency: "BRL",
    pickupLocation: null,
    pickupStartAt: null,
    pickupEndAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    event: baseEvent(),
  };

  const now = new Date();
  const { id, ...overrides } = initial;
  const row: Row = {
    id,
    userId: "usr_runner",
    kitPickupServiceId: "kps_01",
    registrationId: "reg_1",
    status: KitPickupRequestStatus.PICKUP_PENDING,
    paymentStatus: KitPickupPaymentStatus.WAIVED,
    feeAmountSnapshot: null,
    feeCurrencySnapshot: null,
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
    participant: null,
    termAcceptance: { acceptedAt: now },
    ...overrides,
  };

  const requests = new Map<string, Row>([[row.id, row]]);

  const prisma = {
    kitPickupRequest: {
      count: async () => requests.size,
      findMany: async () =>
        [...requests.values()].map((r) => ({
          ...r,
          kitPickupService: service,
        })),
      findUnique: async ({ where }: { where: { id: string } }) => {
        const r = requests.get(where.id);
        if (!r) return null;
        return { ...r, kitPickupService: service };
      },
      update: async ({
        where,
        data,
      }: {
        where: { id: string };
        data: Partial<Row>;
      }) => {
        const r = requests.get(where.id);
        if (!r) throw new Error("missing");
        Object.assign(r, data, { updatedAt: new Date() });
        return { ...r, kitPickupService: service };
      },
    },
  };

  return {
    service: new KitPickupOperationsService(prisma as never),
    requests,
  };
}

async function run(): Promise<void> {
  // Allowlist helper
  {
    const ids = parseKitPickupOperatorIds("a, b,,c");
    assert(ids.size === 3, "parse allowlist");
    assert(isKitPickupOperator("a", ids), "operator a");
    assert(!isKitPickupOperator("z", ids), "not operator z");
    try {
      assertKitPickupOperator(OTHER, [OPERATOR]);
      throw new Error("should forbid");
    } catch (error: unknown) {
      assert(error instanceof HttpException, "forbid throws");
      assert(error.getStatus() === 403, "403");
    }
  }

  // Full happy path WAIVED → … → DELIVERED
  {
    const { service, requests } = createStore({
      id: "kpr_ops_01",
      status: KitPickupRequestStatus.PICKUP_PENDING,
      paymentStatus: KitPickupPaymentStatus.WAIVED,
    });

    const listed = await service.list({
      page: 1,
      perPage: 20,
      sort: "createdAt",
      order: "asc",
    });
    assert(listed.data.length === 1, "list operations");
    assert(listed.meta.total === 1, "meta total");

    const picked = await service.pickup(OPERATOR, "kpr_ops_01");
    assert(picked.data.status === "PICKED_UP", "picked up");
    assert(picked.data.pickedUpBy === OPERATOR, "pickedUpBy");

    const again = await service.pickup(OPERATOR, "kpr_ops_01");
    assert(again.data.status === "PICKED_UP", "pickup idempotent");

    const custody = await service.takeIntoCustody(OPERATOR, "kpr_ops_01");
    assert(custody.data.status === "IN_CUSTODY", "custody");
    assert(custody.data.custodyBy === OPERATOR, "custodyBy");

    await expectHttpError(
      () => service.pickup(OPERATOR, "kpr_ops_01"),
      409,
      "INVALID_STATUS",
    );

    const ready = await service.ready(OPERATOR, "kpr_ops_01");
    assert(ready.data.status === "READY_FOR_HANDOVER", "ready");

    await expectHttpError(
      () =>
        service.handover(OPERATOR, "kpr_ops_01", {
          receivedByName: "   ",
        }),
      400,
      "VALIDATION_ERROR",
    );

    const delivered = await service.handover(OPERATOR, "kpr_ops_01", {
      receivedByName: "Maria Silva",
      notes: "Entregue no local",
    });
    assert(delivered.data.status === "DELIVERED", "delivered");
    assert(delivered.data.receivedByName === "Maria Silva", "receivedByName");
    assert(delivered.data.handoverNotes === "Entregue no local", "notes");
    assert(delivered.data.deliveredBy === OPERATOR, "deliveredBy");

    const idemp = await service.handover(OPERATOR, "kpr_ops_01", {
      receivedByName: "Outro",
    });
    assert(idemp.data.receivedByName === "Maria Silva", "handover idempotent");

    assert(
      requests.get("kpr_ops_01")!.status === KitPickupRequestStatus.DELIVERED,
      "store delivered",
    );
  }

  // PAID eligible for pickup
  {
    const { service } = createStore({
      id: "kpr_paid",
      status: KitPickupRequestStatus.PAID,
      paymentStatus: KitPickupPaymentStatus.PAID,
      feeAmountSnapshot: new Decimal("10.00"),
      feeCurrencySnapshot: "BRL",
    });
    const picked = await service.pickup(OPERATOR, "kpr_paid");
    assert(picked.data.status === "PICKED_UP", "PAID → PICKED_UP");
  }

  // Invalid custody
  {
    const { service } = createStore({
      id: "kpr_early",
      status: KitPickupRequestStatus.PICKUP_PENDING,
    });
    await expectHttpError(
      () => service.takeIntoCustody(OPERATOR, "kpr_early"),
      409,
      "INVALID_STATUS",
    );
  }

  // Not found
  {
    const { service } = createStore({ id: "kpr_only" });
    await expectHttpError(
      () => service.pickup(OPERATOR, "missing"),
      404,
      "NOT_FOUND",
    );
  }

  // Cancel block after pickup is covered in requests service — mirror rule here
  {
    const participantCancellable = new Set<KitPickupRequestStatus>([
      KitPickupRequestStatus.TERM_PENDING,
      KitPickupRequestStatus.TERM_ACCEPTED,
      KitPickupRequestStatus.PAYMENT_PENDING,
      KitPickupRequestStatus.PAID,
      KitPickupRequestStatus.WAIVED,
      KitPickupRequestStatus.PICKUP_PENDING,
    ]);
    assert(
      !participantCancellable.has(KitPickupRequestStatus.PICKED_UP),
      "PICKED_UP not cancellable",
    );
    assert(
      !participantCancellable.has(KitPickupRequestStatus.DELIVERED),
      "DELIVERED not cancellable",
    );
  }

  console.log("kit-pickup-operations.service.test.ts: OK");
}

run().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
