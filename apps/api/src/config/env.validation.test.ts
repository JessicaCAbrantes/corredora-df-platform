/**
 * Unit tests for env validation (AUTH_SECRET + payments fail-closed FASE 3.4-B).
 * Run via: pnpm --filter api test
 */
import { validateEnv } from "./env.validation";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function expectThrow(
  config: Record<string, unknown>,
  includes: string,
  label: string,
): void {
  let threw = false;
  try {
    validateEnv(config);
  } catch (error: unknown) {
    threw = true;
    assert(
      error instanceof Error && error.message.includes(includes),
      `${label}: expected message to include "${includes}", got: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
  assert(threw, `${label}: expected throw`);
}

function run(): void {
  const baseDev = {
    PORT: "3001",
    NODE_ENV: "development",
    DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
    CORS_ORIGIN: "http://localhost:3000",
    AUTH_SECRET: "unit-test-secret-not-for-production",
  };

  const baseProdStripe = {
    PORT: "3001",
    NODE_ENV: "production",
    DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
    CORS_ORIGIN: "https://example.com",
    AUTH_SECRET: "unit-test-secret-not-for-production",
    PAYMENT_PROVIDER: "stripe",
    STRIPE_SECRET_KEY: "sk_test_x",
    STRIPE_WEBHOOK_SECRET: "whsec_x",
  };

  {
    const env = validateEnv(baseDev);
    assert(env.AUTH_SECRET === baseDev.AUTH_SECRET, "valid env keeps AUTH_SECRET");
    assert(env.NODE_ENV === "development", "development NODE_ENV");
    assert(env.PAYMENT_PROVIDER === "mock", "default payment provider is mock");
    assert(
      typeof env.PAYMENT_WEBHOOK_SECRET === "string" &&
        env.PAYMENT_WEBHOOK_SECRET.length > 0,
      "mock derives PAYMENT_WEBHOOK_SECRET",
    );
    assert(
      Array.isArray(env.KIT_PICKUP_OPERATOR_USER_IDS) &&
        env.KIT_PICKUP_OPERATOR_USER_IDS.length === 0,
      "default operator allowlist empty",
    );
  }

  {
    const env = validateEnv({
      ...baseDev,
      KIT_PICKUP_OPERATOR_USER_IDS: "usr_a, usr_b",
    });
    assert(
      env.KIT_PICKUP_OPERATOR_USER_IDS.join(",") === "usr_a,usr_b",
      "operator allowlist parsed",
    );
  }

  {
    const env = validateEnv(baseProdStripe);
    assert(env.PAYMENT_PROVIDER === "stripe", "stripe provider accepted in production");
    assert(env.STRIPE_SECRET_KEY === "sk_test_x", "stripe secret kept");
    assert(env.STRIPE_WEBHOOK_SECRET === "whsec_x", "stripe webhook secret kept");
  }

  {
    const env = validateEnv({
      ...baseDev,
      NODE_ENV: "test",
      PAYMENT_PROVIDER: "mock",
      PAYMENT_WEBHOOK_SECRET: "explicit-mock-secret",
    });
    assert(env.PAYMENT_WEBHOOK_SECRET === "explicit-mock-secret", "explicit mock secret");
  }

  // --- FASE 3.4-B fail-closed ---
  expectThrow(
    {
      ...baseDev,
      NODE_ENV: "production",
      PAYMENT_PROVIDER: "mock",
    },
    "PAYMENT_PROVIDER=mock is not allowed when NODE_ENV=production",
    "production + mock",
  );

  expectThrow(
    {
      ...baseDev,
      NODE_ENV: "production",
    },
    "PAYMENT_PROVIDER=mock is not allowed when NODE_ENV=production",
    "production + default mock",
  );

  expectThrow(
    {
      ...baseDev,
      PAYMENT_PROVIDER: "stripe",
    },
    "STRIPE_SECRET_KEY",
    "stripe without secrets",
  );

  expectThrow(
    {
      ...baseDev,
      PAYMENT_PROVIDER: "stripe",
      STRIPE_SECRET_KEY: "sk_test_x",
    },
    "STRIPE_WEBHOOK_SECRET",
    "stripe without webhook secret",
  );

  expectThrow(
    {
      ...baseDev,
      PAYMENT_PROVIDER: "stripe",
      STRIPE_SECRET_KEY: "",
      STRIPE_WEBHOOK_SECRET: "whsec_x",
    },
    "STRIPE_SECRET_KEY",
    "stripe with empty STRIPE_SECRET_KEY",
  );

  expectThrow(
    {
      ...baseDev,
      PAYMENT_PROVIDER: "mock",
      STRIPE_SECRET_KEY: "sk_test_x",
    },
    "Inconsistent payment configuration",
    "mock + STRIPE_SECRET_KEY",
  );

  expectThrow(
    {
      ...baseDev,
      PAYMENT_PROVIDER: "mock",
      STRIPE_WEBHOOK_SECRET: "whsec_x",
    },
    "Inconsistent payment configuration",
    "mock + STRIPE_WEBHOOK_SECRET",
  );

  expectThrow(
    { ...baseDev, AUTH_SECRET: undefined },
    "AUTH_SECRET",
    "missing AUTH_SECRET",
  );

  expectThrow(
    { ...baseDev, AUTH_SECRET: "   " },
    "AUTH_SECRET",
    "blank AUTH_SECRET",
  );

  console.log("env.validation.test.ts: OK");
}

run();
