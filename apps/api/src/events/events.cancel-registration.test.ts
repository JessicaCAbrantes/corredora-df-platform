/**
 * Unit tests for EventsService.cancelRegistration + controller auth gate.
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
import {
  AuthBoundaryService,
  resolveCurrentUserId,
} from "../auth/auth.boundary";
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

type PrismaMock = {
  event: {
    findUnique: (args: unknown) => Promise<Event | null>;
  };
  eventRegistration: {
    deleteMany: (args: {
      where: { eventId: string; userId: string };
    }) => Promise<{ count: number }>;
    create?: (args: {
      data: { eventId: string; userId: string };
    }) => Promise<{ id: string; eventId: string; userId: string }>;
  };
};

function createService(prisma: PrismaMock): EventsService {
  return new EventsService(prisma as never);
}

function createAuthBoundary(
  secret = process.env.AUTH_SECRET ?? "",
): AuthBoundaryService {
  return new AuthBoundaryService({ get: () => secret } as never);
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

const USER_A = "usr_a";
const USER_B = "usr_b";

async function run(): Promise<void> {
  const previousSecret = process.env.AUTH_SECRET;
  process.env.AUTH_SECRET = "test-auth-secret-for-unit-tests";
  const tokenA = createSessionToken(USER_A, process.env.AUTH_SECRET);

  // --- 401 sem sessão ---
  {
    const service = createService({
      event: {
        findUnique: async () => {
          throw new Error("must not run");
        },
      },
      eventRegistration: {
        deleteMany: async () => {
          throw new Error("must not run");
        },
      },
    });
    try {
      await new EventsController(service, createAuthBoundary()).cancelRegistration(
        "evt_01_meia",
        mockRequest(),
      );
      throw new Error("Expected 401");
    } catch (error: unknown) {
      assert(error instanceof HttpException, "HttpException");
      assert(error.getStatus() === HttpStatus.UNAUTHORIZED, "401");
    }
  }

  assert(
    resolveCurrentUserId(mockRequest(`${SESSION_COOKIE_NAME}=${tokenA}`), process.env.AUTH_SECRET ?? "") ===
      USER_A,
    "session → User A",
  );

  // --- 204 autenticado ---
  {
    const capture: {
      where: { eventId: string; userId: string } | null;
    } = { where: null };

    const prisma: PrismaMock = {
      event: {
        findUnique: async () => baseEvent(),
      },
      eventRegistration: {
        deleteMany: async (args) => {
          capture.where = args.where;
          return { count: 1 };
        },
      },
    };

    await new EventsController(
      createService(prisma),
      createAuthBoundary(),
    ).cancelRegistration(
      "evt_01_meia",
      mockRequest(`${SESSION_COOKIE_NAME}=${tokenA}`),
    );

    assert(capture.where?.eventId === "evt_01_meia", "eventId from path");
    assert(capture.where?.userId === USER_A, "userId from session only");
  }

  // --- evento inexistente → 404 ---
  {
    await expectHttpError(
      () =>
        createService({
          event: { findUnique: async () => null },
          eventRegistration: {
            deleteMany: async () => {
              throw new Error("delete must not run");
            },
          },
        }).cancelRegistration("evt_missing", USER_A),
      HttpStatus.NOT_FOUND,
      "EVENT_NOT_FOUND",
    );
  }

  // --- sem inscrição → 404 ---
  {
    await expectHttpError(
      () =>
        createService({
          event: { findUnique: async () => baseEvent() },
          eventRegistration: {
            deleteMany: async () => ({ count: 0 }),
          },
        }).cancelRegistration("evt_01_meia", USER_A),
      HttpStatus.NOT_FOUND,
      "REGISTRATION_NOT_FOUND",
    );
  }

  // --- ownership A ≠ B: sessão A não deleta user B ---
  {
    const capture: { userId: string | null } = { userId: null };
    const prisma: PrismaMock = {
      event: { findUnique: async () => baseEvent() },
      eventRegistration: {
        deleteMany: async (args) => {
          capture.userId = args.where.userId;
          // Simulate DB: only rows for USER_A exist for this filter
          return { count: args.where.userId === USER_A ? 1 : 0 };
        },
      },
    };

    await createService(prisma).cancelRegistration("evt_01_meia", USER_A);
    assert(capture.userId === USER_A, "delete filters USER_A");

    await expectHttpError(
      () => createService(prisma).cancelRegistration("evt_01_meia", USER_B),
      HttpStatus.NOT_FOUND,
      "REGISTRATION_NOT_FOUND",
    );
  }

  // --- DELETE duas vezes → 404 ---
  {
    let calls = 0;
    const prisma: PrismaMock = {
      event: { findUnique: async () => baseEvent() },
      eventRegistration: {
        deleteMany: async () => {
          calls += 1;
          return { count: calls === 1 ? 1 : 0 };
        },
      },
    };
    const service = createService(prisma);
    await service.cancelRegistration("evt_01_meia", USER_A);
    await expectHttpError(
      () => service.cancelRegistration("evt_01_meia", USER_A),
      HttpStatus.NOT_FOUND,
      "REGISTRATION_NOT_FOUND",
    );
  }

  // --- client userId ignored ---
  {
    const filterCapture: { userId: string | null } = { userId: null };
    const prisma: PrismaMock = {
      event: { findUnique: async () => baseEvent() },
      eventRegistration: {
        deleteMany: async (args) => {
          filterCapture.userId = args.where.userId;
          return { count: 1 };
        },
      },
    };
    const req = mockRequest(`${SESSION_COOKIE_NAME}=${tokenA}`) as Request & {
      body?: { userId?: string };
      query?: { userId?: string };
    };
    req.body = { userId: USER_B };
    req.query = { userId: USER_B };

    await new EventsController(
      createService(prisma),
      createAuthBoundary(),
    ).cancelRegistration(
      "evt_01_meia",
      req,
    );
    assert(filterCapture.userId === USER_A, "body/query userId ignored");
  }

  // --- POST novamente após DELETE (unique liberado) ---
  {
    let registered = true;
    const prisma: PrismaMock = {
      event: { findUnique: async () => baseEvent() },
      eventRegistration: {
        deleteMany: async () => {
          registered = false;
          return { count: 1 };
        },
        create: async ({ data }) => {
          assert(!registered, "create only after cancel");
          registered = true;
          return {
            id: "reg_after_cancel",
            eventId: data.eventId,
            userId: data.userId,
          };
        },
      },
    };
    const service = createService(prisma);
    await service.cancelRegistration("evt_01_meia", USER_A);
    const result = await service.register("evt_01_meia", USER_A);
    assert(
      result.data.registrationId === "reg_after_cancel",
      "re-register after cancel → 201 path",
    );
  }

  // Static path metadata
  {
    const cancelPath = Reflect.getMetadata(
      "path",
      EventsController.prototype.cancelRegistration,
    ) as string | undefined;
    assert(
      cancelPath === ":id/register",
      `cancel path :id/register, got ${String(cancelPath)}`,
    );
  }

  process.env.AUTH_SECRET = previousSecret;
  console.log("events.cancel-registration.test.ts: all assertions passed");
}

run().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
