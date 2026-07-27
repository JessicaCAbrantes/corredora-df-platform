/**
 * Unit tests for env validation (AUTH_SECRET fail-fast).
 * Run via: pnpm --filter api test
 */
import { validateEnv } from "./env.validation";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function run(): void {
  const base = {
    PORT: "3001",
    NODE_ENV: "production",
    DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
    CORS_ORIGIN: "https://example.com",
    AUTH_SECRET: "unit-test-secret-not-for-production",
  };

  {
    const env = validateEnv(base);
    assert(env.AUTH_SECRET === base.AUTH_SECRET, "valid env keeps AUTH_SECRET");
    assert(env.NODE_ENV === "production", "valid production NODE_ENV");
  }

  {
    let threw = false;
    try {
      validateEnv({ ...base, AUTH_SECRET: undefined });
    } catch (error: unknown) {
      threw = true;
      assert(
        error instanceof Error &&
          error.message.includes("AUTH_SECRET"),
        "missing AUTH_SECRET message",
      );
    }
    assert(threw, "production/boot without AUTH_SECRET fails fast");
  }

  {
    let threw = false;
    try {
      validateEnv({ ...base, AUTH_SECRET: "   " });
    } catch (error: unknown) {
      threw = true;
      assert(
        error instanceof Error &&
          error.message.includes("AUTH_SECRET"),
        "blank AUTH_SECRET message",
      );
    }
    assert(threw, "blank AUTH_SECRET fails fast");
  }

  console.log("env.validation.test.ts: OK");
}

run();
