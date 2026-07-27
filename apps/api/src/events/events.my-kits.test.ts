/**
 * Unit tests for EventsService.listMyKits + controller auth gate.
 * Run: pnpm --filter api test
 */
import "reflect-metadata";
import { HttpException, HttpStatus } from "@nestjs/common";
import {
  EventCategory,
  EventLifecycleStatus,
  EventRegistrationStatus,
  type Event,
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import type { Request } from "express";
import { resolveCurrentUserId } from "../auth/auth.boundary";
import { createSessionToken, SESSION_COOKIE_NAME } from "../auth/session-cookie";
import { EventsController } from "./events.controller";
import { EventsService } from "./events.service";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function baseEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: "evt_01_meia",
    name: "Meia Maratona de Brasília",
    slug: "meia-maratona-brasilia",
    date: new Date("2026-08-16T10:00:00.000Z"),
    city: "Brasília",
    category: EventCategory.half_marathon,
    distance: "21K",
    status: EventLifecycleStatus.active,
    registrationStatus: EventRegistrationStatus.open,
    coverImage: "https://example.com/events/meia.jpg",
    priceAmount: new Decimal(149),
    priceCurrency: "BRL",
    createdAt: new Date("2026-01-10T10:00:00.000Z"),
    ...overrides,
  };
}

function mockRequest(cookie?: string): Request {
  return {
    headers: cookie ? { cookie } : {},
  } as Request;
}

type KitRow = { id: string; eventId: string };

type RegistrationWithKit = {
  id: string;
  eventId: string;
  userId: string;
  createdAt: Date;
  event: Event & { kit: KitRow | null };
};

type PrismaMock = {
  eventRegistration: {
    findMany: (args: {
      where: { userId: string };
      include: { event: { include: { kit: true } } };
      orderBy: { createdAt: "desc" };
    }) => Promise<RegistrationWithKit[]>;
  };
};

function createService(prisma: PrismaMock): EventsService {
  return new EventsService(prisma as never);
}

const USER_A = "usr_a";
const USER_B = "usr_b";

async function run(): Promise<void> {
  const previousSecret = process.env.AUTH_SECRET;
  process.env.AUTH_SECRET = "test-auth-secret-for-unit-tests";
  const tokenA = createSessionToken(USER_A, process.env.AUTH_SECRET);

  // --- Sem sessão → 401 ---
  {
    const service = createService({
      eventRegistration: {
        findMany: async () => {
          throw new Error("findMany must not run without auth");
        },
      },
    });
    const controller = new EventsController(service);

    try {
      await controller.listMyKits(mockRequest());
      throw new Error("Expected 401 UNAUTHORIZED");
    } catch (error: unknown) {
      assert(error instanceof HttpException, "Expected HttpException");
      assert(
        error.getStatus() === HttpStatus.UNAUTHORIZED,
        `Expected 401, got ${error.getStatus()}`,
      );
      const body = error.getResponse() as { error?: { code?: string } };
      assert(
        body.error?.code === "UNAUTHORIZED",
        `Expected UNAUTHORIZED, got ${body.error?.code}`,
      );
    }
  }

  assert(
    resolveCurrentUserId(mockRequest(`${SESSION_COOKIE_NAME}=${tokenA}`)) ===
      USER_A,
    "session → User A",
  );

  // --- Autenticado com kits + isolamento + ordenação ---
  {
    const eventA = baseEvent({
      id: "evt_a",
      slug: "evento-a",
      name: "Evento A",
    });
    const eventB = baseEvent({
      id: "evt_b",
      slug: "evento-b",
      name: "Evento B",
    });
    const older = new Date("2026-07-01T10:00:00.000Z");
    const newer = new Date("2026-07-20T10:00:00.000Z");

    const capture: { where: { userId: string } | null } = { where: null };

    const prisma: PrismaMock = {
      eventRegistration: {
        findMany: async (args) => {
          capture.where = args.where;
          assert(args.orderBy.createdAt === "desc", "orderBy createdAt desc");
          assert(args.where.userId === USER_A, "filter session userId");
          return [
            {
              id: "reg_newer",
              eventId: eventB.id,
              userId: USER_A,
              createdAt: newer,
              event: {
                ...eventB,
                kit: { id: "kit_b", eventId: eventB.id },
              },
            },
            {
              id: "reg_older",
              eventId: eventA.id,
              userId: USER_A,
              createdAt: older,
              event: {
                ...eventA,
                kit: { id: "kit_a", eventId: eventA.id },
              },
            },
          ];
        },
      },
    };

    const result = await new EventsController(
      createService(prisma),
    ).listMyKits(mockRequest(`${SESSION_COOKIE_NAME}=${tokenA}`));

    assert(capture.where?.userId === USER_A, "where.userId === User A");
    assert(result.data.length === 2, "two kits");
    assert(result.data[0]!.kitId === "kit_b", "newest registration kit first");
    assert(result.data[1]!.kitId === "kit_a", "oldest second");
    assert(result.data[0]!.status === "available", "status available");
    assert(result.data[0]!.event.slug === "evento-b", "event.slug");
    assert(result.data[0]!.event.name === "Evento B", "event.name");
    assert(
      result.data.every(
        (item) =>
          !("passwordHash" in item) &&
          !("userId" in item) &&
          !("passwordHash" in item.event),
      ),
      "no passwordHash/userId in DTO",
    );
  }

  // Explicit isolation A ≠ B
  {
    const eventShared = baseEvent({ id: "evt_shared", name: "Shared" });
    const prisma: PrismaMock = {
      eventRegistration: {
        findMany: async (args) => {
          const all: RegistrationWithKit[] = [
            {
              id: "reg_a",
              eventId: eventShared.id,
              userId: USER_A,
              createdAt: new Date("2026-07-10T00:00:00.000Z"),
              event: {
                ...eventShared,
                kit: { id: "kit_shared", eventId: eventShared.id },
              },
            },
            {
              id: "reg_b",
              eventId: eventShared.id,
              userId: USER_B,
              createdAt: new Date("2026-07-11T00:00:00.000Z"),
              event: {
                ...eventShared,
                kit: { id: "kit_shared", eventId: eventShared.id },
              },
            },
          ];
          return all.filter((row) => row.userId === args.where.userId);
        },
      },
    };

    const result = await createService(prisma).listMyKits(USER_A);
    assert(result.data.length === 1, "User A sees one kit");
    assert(result.data[0]!.kitId === "kit_shared", "kit mapped");
  }

  // Registration without kit is omitted
  {
    const eventNoKit = baseEvent({ id: "evt_nokit", name: "No Kit Event" });
    const prisma: PrismaMock = {
      eventRegistration: {
        findMany: async () => [
          {
            id: "reg_nokit",
            eventId: eventNoKit.id,
            userId: USER_A,
            createdAt: new Date(),
            event: { ...eventNoKit, kit: null },
          },
        ],
      },
    };
    const result = await createService(prisma).listMyKits(USER_A);
    assert(result.data.length === 0, "no kit → omitted from list");
  }

  // Empty list
  {
    const prisma: PrismaMock = {
      eventRegistration: {
        findMany: async () => [],
      },
    };
    const result = await createService(prisma).listMyKits(USER_A);
    assert(result.data.length === 0, "empty data array");
  }

  // Static route metadata + client userId ignored
  {
    const myKitsPath = Reflect.getMetadata(
      "path",
      EventsController.prototype.listMyKits,
    ) as string | undefined;
    assert(
      myKitsPath === "me/kits",
      `static path me/kits, got ${String(myKitsPath)}`,
    );

    const req = mockRequest(`${SESSION_COOKIE_NAME}=${tokenA}`) as Request & {
      body?: { userId?: string };
      query?: { userId?: string };
      params?: { userId?: string };
    };
    req.body = { userId: USER_B };
    req.query = { userId: USER_B };
    req.params = { userId: USER_B };

    const filterCapture: { userId: string | null } = { userId: null };
    const prisma: PrismaMock = {
      eventRegistration: {
        findMany: async (args) => {
          filterCapture.userId = args.where.userId;
          return [];
        },
      },
    };
    await new EventsController(createService(prisma)).listMyKits(req);
    assert(
      filterCapture.userId === USER_A,
      "client userId ignored — session User A only",
    );
  }

  process.env.AUTH_SECRET = previousSecret;
  console.log("events.my-kits.test.ts: all assertions passed");
}

run().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
