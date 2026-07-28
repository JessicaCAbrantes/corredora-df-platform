/**
 * Unit tests for EventsService.listMyRegistrations + controller auth gate.
 * Run: pnpm --filter api test
 */
import "reflect-metadata";
import { HttpException, HttpStatus } from "@nestjs/common";
import {
  EventCategory,
  EventLifecycleStatus,
  EventRegistrationMode,
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
    registrationMode: EventRegistrationMode.internal,
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

type RegistrationRow = {
  id: string;
  eventId: string;
  userId: string;
  createdAt: Date;
  event: Event;
};

type PrismaMock = {
  eventRegistration: {
    findMany: (args: {
      where: { userId: string };
      include: { event: true };
      orderBy: { createdAt: "desc" };
    }) => Promise<RegistrationRow[]>;
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

  // --- Caso 3: sem sessão → 401 via controller ---
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
      await controller.listMyRegistrations(mockRequest());
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

  // Boundary: identity from cookie only
  assert(
    resolveCurrentUserId(mockRequest(`${SESSION_COOKIE_NAME}=${tokenA}`)) ===
      USER_A,
    "session → User A",
  );

  // --- Caso 1 + 4 + 5: autenticado, isolamento, ordenação DESC ---
  {
    const eventA = baseEvent({ id: "evt_a", slug: "evento-a", name: "Evento A" });
    const eventB = baseEvent({ id: "evt_b", slug: "evento-b", name: "Evento B" });
    const older = new Date("2026-07-01T10:00:00.000Z");
    const newer = new Date("2026-07-20T10:00:00.000Z");

    // Object box avoids TS control-flow treating let+callback as always-null.
    const capture: {
      where: { userId: string } | null;
      order: { createdAt: string } | null;
    } = { where: null, order: null };

    const prisma: PrismaMock = {
      eventRegistration: {
        findMany: async (args) => {
          capture.where = args.where;
          capture.order = args.orderBy;
          assert(args.where.userId === USER_A, "filter must use session userId");
          return [
            {
              id: "reg_newer",
              eventId: eventB.id,
              userId: USER_A,
              createdAt: newer,
              event: eventB,
            },
            {
              id: "reg_older",
              eventId: eventA.id,
              userId: USER_A,
              createdAt: older,
              event: eventA,
            },
          ];
        },
      },
    };

    const service = createService(prisma);
    const controller = new EventsController(service);
    const result = await controller.listMyRegistrations(
      mockRequest(`${SESSION_COOKIE_NAME}=${tokenA}`),
    );

    assert(
      capture.where !== null && capture.where.userId === USER_A,
      "where.userId === User A",
    );
    assert(
      capture.order !== null && capture.order.createdAt === "desc",
      "orderBy createdAt desc",
    );
    assert(result.data.length === 2, "two registrations for User A");
    assert(result.data[0]!.registrationId === "reg_newer", "newest first");
    assert(result.data[1]!.registrationId === "reg_older", "oldest second");
    assert(result.data[0]!.registeredAt === newer.toISOString(), "registeredAt ISO");
    assert(result.data[0]!.event.slug === "evento-b", "event.slug mapped");
    assert(result.data[0]!.event.name === "Evento B", "event.name mapped");
    assert(
      result.data.every((item) => !("passwordHash" in item) && !("userId" in item)),
      "no userId/passwordHash in response items",
    );
  }

  // Explicit isolation: User B rows are not returned when filtering User A
  {
    const eventShared = baseEvent({ id: "evt_shared", name: "Shared Event" });
    const prisma: PrismaMock = {
      eventRegistration: {
        findMany: async (args) => {
          const allRows: RegistrationRow[] = [
            {
              id: "reg_a",
              eventId: eventShared.id,
              userId: USER_A,
              createdAt: new Date("2026-07-10T00:00:00.000Z"),
              event: eventShared,
            },
            {
              id: "reg_b",
              eventId: eventShared.id,
              userId: USER_B,
              createdAt: new Date("2026-07-11T00:00:00.000Z"),
              event: eventShared,
            },
          ];
          return allRows.filter((row) => row.userId === args.where.userId);
        },
      },
    };

    const result = await createService(prisma).listMyRegistrations(USER_A);
    assert(result.data.length === 1, "User A sees only own registration");
    assert(result.data[0]!.registrationId === "reg_a", "only reg_a");
    assert(
      !result.data.some((item) => item.registrationId === "reg_b"),
      "User A must not see User B registration",
    );
  }

  // --- Caso 2: autenticado sem inscrição → 200 [] ---
  {
    const prisma: PrismaMock = {
      eventRegistration: {
        findMany: async () => [],
      },
    };
    const result = await createService(prisma).listMyRegistrations(USER_A);
    assert(Array.isArray(result.data), "data is array");
    assert(result.data.length === 0, "empty list");
  }

  // --- Caso 6: rota estática me/registrations (não captura como :id) ---
  {
    const proto = EventsController.prototype as unknown as Record<
      string,
      unknown
    >;
    assert(
      typeof proto.listMyRegistrations === "function",
      "listMyRegistrations handler exists",
    );
    assert(typeof proto.register === "function", "register handler preserved");

    const myRegsPath = Reflect.getMetadata(
      "path",
      EventsController.prototype.listMyRegistrations,
    ) as string | undefined;
    assert(
      myRegsPath === "me/registrations",
      `static path me/registrations, got ${String(myRegsPath)}`,
    );

    const registerPath = Reflect.getMetadata(
      "path",
      EventsController.prototype.register,
    ) as string | undefined;
    assert(
      registerPath === ":id/register",
      `register stays :id/register, got ${String(registerPath)}`,
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
    await new EventsController(createService(prisma)).listMyRegistrations(req);
    assert(
      filterCapture.userId === USER_A,
      "client userId (body/query/params) ignored — session User A only",
    );
  }

  process.env.AUTH_SECRET = previousSecret;
  console.log("events.my-registrations.test.ts: all assertions passed");
}

run().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
