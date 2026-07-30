/**
 * Unit tests for EventsService.register + Real Auth Boundary contract.
 * Run: pnpm --filter api test
 */
import { HttpException, HttpStatus } from "@nestjs/common";
import {
  EventCategory,
  EventLifecycleStatus,
  EventRegistrationMode,
  EventRegistrationStatus,
  Prisma,
  type Event,
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import type { Request } from "express";
import { resolveCurrentUserId } from "../auth/auth.boundary";
import { createSessionToken, SESSION_COOKIE_NAME } from "../auth/session-cookie";
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

type PrismaMock = {
  event: {
    findUnique: (args: unknown) => Promise<Event | null>;
  };
  eventRegistration: {
    create: (args: {
      data: { eventId: string; userId: string };
    }) => Promise<{ id: string; eventId: string; userId: string }>;
  };
};

function createService(prisma: PrismaMock): EventsService {
  return new EventsService(prisma as never);
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
    assert(error.getStatus() === status, `Expected status ${status}, got ${error.getStatus()}`);
    const body = error.getResponse() as {
      error?: { code?: string };
    };
    assert(body.error?.code === code, `Expected code ${code}, got ${body.error?.code}`);
  }
}

const AUTH_USER_ID = "usr_seed_01";

async function run(): Promise<void> {
  const previousSecret = process.env.AUTH_SECRET;
  process.env.AUTH_SECRET = "test-auth-secret-for-unit-tests";
  const token = createSessionToken(AUTH_USER_ID, process.env.AUTH_SECRET);

  // --- Real Auth Boundary ---
  assert(
    resolveCurrentUserId(
      mockRequest(`${SESSION_COOKIE_NAME}=${token}`), process.env.AUTH_SECRET ?? "",
    ) === AUTH_USER_ID,
    "valid session → User.id",
  );
  assert(resolveCurrentUserId(mockRequest(), process.env.AUTH_SECRET ?? "") === null, "no cookie → null");
  assert(
    resolveCurrentUserId(
      mockRequest(`${SESSION_COOKIE_NAME}=${token}x`), process.env.AUTH_SECRET ?? "",
    ) === null,
    "tampered → null",
  );

  // body.userId ignored — identity only from cookie
  {
    const req = mockRequest(`${SESSION_COOKIE_NAME}=${token}`) as Request & {
      body?: { userId?: string };
    };
    req.body = { userId: "attacker_user" };
    assert(
      resolveCurrentUserId(req, process.env.AUTH_SECRET ?? "") === AUTH_USER_ID,
      "body.userId is ignored",
    );
  }

  // --- register: success open ---
  {
    const prisma: PrismaMock = {
      event: {
        findUnique: async () => baseEvent(),
      },
      eventRegistration: {
        create: async ({ data }) => {
          assert(data.eventId === "evt_01_meia", "create uses event.id");
          assert(data.userId === AUTH_USER_ID, "create uses auth userId");
          return {
            id: "reg_test_01",
            eventId: data.eventId,
            userId: data.userId,
          };
        },
      },
    };
    const service = createService(prisma);
    const result = await service.register("evt_01_meia", AUTH_USER_ID);
    assert(result.data.registrationId === "reg_test_01", "returns registrationId");
  }

  // --- not found ---
  {
    const service = createService({
      event: { findUnique: async () => null },
      eventRegistration: {
        create: async () => {
          throw new Error("create must not be called");
        },
      },
    });
    await expectHttpError(
      () => service.register("evt_missing", AUTH_USER_ID),
      HttpStatus.NOT_FOUND,
      "EVENT_NOT_FOUND",
    );
  }

  // --- upcoming ---
  {
    const service = createService({
      event: {
        findUnique: async () =>
          baseEvent({
            id: "evt_03_5k_ini",
            registrationStatus: EventRegistrationStatus.upcoming,
    registrationMode: EventRegistrationMode.internal,
          }),
      },
      eventRegistration: {
        create: async () => {
          throw new Error("create must not be called");
        },
      },
    });
    await expectHttpError(
      () => service.register("evt_03_5k_ini", AUTH_USER_ID),
      HttpStatus.UNPROCESSABLE_ENTITY,
      "EVENT_REGISTRATION_CLOSED",
    );
  }

  // --- closed ---
  {
    const service = createService({
      event: {
        findUnique: async () =>
          baseEvent({
            id: "evt_02_noturna",
            registrationStatus: EventRegistrationStatus.closed,
    registrationMode: EventRegistrationMode.internal,
          }),
      },
      eventRegistration: {
        create: async () => {
          throw new Error("create must not be called");
        },
      },
    });
    await expectHttpError(
      () => service.register("evt_02_noturna", AUTH_USER_ID),
      HttpStatus.UNPROCESSABLE_ENTITY,
      "EVENT_REGISTRATION_CLOSED",
    );
  }

  // --- cancelled ---
  {
    const service = createService({
      event: {
        findUnique: async () =>
          baseEvent({
            id: "evt_07_cancelada",
            status: EventLifecycleStatus.cancelled,
            registrationStatus: EventRegistrationStatus.closed,
    registrationMode: EventRegistrationMode.internal,
          }),
      },
      eventRegistration: {
        create: async () => {
          throw new Error("create must not be called");
        },
      },
    });
    await expectHttpError(
      () => service.register("evt_07_cancelada", AUTH_USER_ID),
      HttpStatus.UNPROCESSABLE_ENTITY,
      "EVENT_INACTIVE",
    );
  }

  // --- completed ---
  {
    const service = createService({
      event: {
        findUnique: async () =>
          baseEvent({
            id: "evt_06_taguatinga",
            status: EventLifecycleStatus.completed,
            registrationStatus: EventRegistrationStatus.closed,
    registrationMode: EventRegistrationMode.internal,
          }),
      },
      eventRegistration: {
        create: async () => {
          throw new Error("create must not be called");
        },
      },
    });
    await expectHttpError(
      () => service.register("evt_06_taguatinga", AUTH_USER_ID),
      HttpStatus.UNPROCESSABLE_ENTITY,
      "EVENT_INACTIVE",
    );
  }

  // --- duplicate P2002 ---
  {
    const service = createService({
      event: { findUnique: async () => baseEvent() },
      eventRegistration: {
        create: async () => {
          throw new Prisma.PrismaClientKnownRequestError("Unique constraint", {
            code: "P2002",
            clientVersion: "test",
            meta: { target: ["event_id", "user_id"] },
          });
        },
      },
    });
    await expectHttpError(
      () => service.register("evt_01_meia", AUTH_USER_ID),
      HttpStatus.CONFLICT,
      "ALREADY_REGISTERED",
    );
  }

  // --- lookup is by id, not slug ---
  {
    let queriedId: string | undefined;
    const service = createService({
      event: {
        findUnique: async (args: unknown) => {
          const where = (args as { where: { id?: string; slug?: string } }).where;
          queriedId = where.id;
          assert(where.slug === undefined, "must not query by slug");
          return null;
        },
      },
      eventRegistration: {
        create: async () => {
          throw new Error("create must not be called");
        },
      },
    });
    await expectHttpError(
      () => service.register("meia-maratona-brasilia", AUTH_USER_ID),
      HttpStatus.NOT_FOUND,
      "EVENT_NOT_FOUND",
    );
    assert(
      queriedId === "meia-maratona-brasilia",
      "slug string is treated as id lookup key (no slug resolution)",
    );
  }

  process.env.AUTH_SECRET = previousSecret;
  console.log("events.register.test.ts: OK");
}

void run().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
