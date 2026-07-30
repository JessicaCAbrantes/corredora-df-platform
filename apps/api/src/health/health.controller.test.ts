/**
 * Unit tests for health probes and UnhandledExceptionFilter.
 */
import { HttpException, HttpStatus } from "@nestjs/common";
import { UnhandledExceptionFilter } from "../filters/unhandled-exception.filter";
import { HealthController } from "./health.controller";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function run(): Promise<void> {
  {
    const prismaUp = {
      isDatabaseHealthy: async () => true,
    };
    const controllerUp = new HealthController(prismaUp as never);
    assert(controllerUp.live().status === "ok", "live always ok");

    const readyRes = {
      statusCode: 200,
      status(code: number) {
        this.statusCode = code;
        return this;
      },
    };
    const bodyUp = await controllerUp.ready(readyRes as never);
    assert(bodyUp.status === "ready", "ready when DB up");
    assert(bodyUp.database === "up", "database up");
    assert(readyRes.statusCode === 200, "ready keeps 200");
  }

  {
    const prismaDown = {
      isDatabaseHealthy: async () => false,
    };
    const controllerDown = new HealthController(prismaDown as never);
    const readyRes = {
      statusCode: 200,
      status(code: number) {
        this.statusCode = code;
        return this;
      },
    };
    const bodyDown = await controllerDown.ready(readyRes as never);
    assert(bodyDown.status === "not_ready", "not_ready when DB down");
    assert(bodyDown.database === "down", "database down");
    assert(
      readyRes.statusCode === HttpStatus.SERVICE_UNAVAILABLE,
      "ready returns 503 when DB down",
    );
  }

  {
    const filter = new UnhandledExceptionFilter();
    const jsonBodies: unknown[] = [];
    const statuses: number[] = [];
    const res = {
      status(code: number) {
        statuses.push(code);
        return this;
      },
      json(body: unknown) {
        jsonBodies.push(body);
        return this;
      },
    };
    const host = {
      switchToHttp: () => ({
        getResponse: () => res,
      }),
    };

    filter.catch(
      new HttpException(
        {
          status: "error",
          error: { code: "FORBIDDEN", message: "nope", status: 403 },
        },
        HttpStatus.FORBIDDEN,
      ),
      host as never,
    );
    assert(statuses[0] === 403, "preserves HttpException status");
    assert(
      (jsonBodies[0] as { error?: { code?: string } }).error?.code ===
        "FORBIDDEN",
      "preserves domain envelope",
    );

    filter.catch(new Error("secret DATABASE_URL=postgresql://x"), host as never);
    assert(statuses[1] === 500, "unexpected → 500");
    const unexpected = jsonBodies[1] as {
      error?: { code?: string; message?: string };
    };
    assert(
      unexpected.error?.code === "INTERNAL_SERVER_ERROR",
      "generic code",
    );
    assert(
      unexpected.error?.message === "Erro interno do servidor",
      "generic message",
    );
    assert(
      !JSON.stringify(unexpected).includes("DATABASE_URL"),
      "no secret leak in body",
    );
    assert(
      !JSON.stringify(unexpected).includes("postgresql://"),
      "no connection string in body",
    );
  }

  console.log("health.controller.test.ts: OK");
}

void run().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
