/**
 * Unit tests for seed fail-closed guard (FASE 3.3-C).
 * Run via: pnpm --filter api test
 */
import { assertSeedAllowed } from "../../prisma/assert-seed-allowed";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function run(): void {
  assertSeedAllowed({ NODE_ENV: "development" });
  assertSeedAllowed({ NODE_ENV: "test" });
  assertSeedAllowed({});
  assertSeedAllowed({
    NODE_ENV: "production",
    ALLOW_DB_SEED: "true",
  });

  let blocked = false;
  try {
    assertSeedAllowed({ NODE_ENV: "production" });
  } catch (error: unknown) {
    blocked = true;
    const message = error instanceof Error ? error.message : String(error);
    assert(
      message.includes("Database seed is disabled in production"),
      "explicit production error",
    );
    assert(message.includes("ALLOW_DB_SEED=true"), "mentions override");
  }
  assert(blocked, "production without override throws");

  let blockedEmpty = false;
  try {
    assertSeedAllowed({ NODE_ENV: "production", ALLOW_DB_SEED: "" });
  } catch {
    blockedEmpty = true;
  }
  assert(blockedEmpty, "empty ALLOW_DB_SEED still blocked");

  console.log("assert-seed-allowed.test.ts: OK");
}

run();
