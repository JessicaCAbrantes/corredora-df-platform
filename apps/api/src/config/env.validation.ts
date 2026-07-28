import { createHash } from "node:crypto";

export type PaymentProviderName = "stripe" | "mock";

export type Env = {
  PORT: number;
  NODE_ENV: string;
  DATABASE_URL: string;
  CORS_ORIGIN: string;
  AUTH_SECRET: string;
  PAYMENT_PROVIDER: PaymentProviderName;
  /** Public API origin used by mock checkout links (e.g. http://localhost:3001). */
  PUBLIC_API_BASE_URL: string;
  PAYMENT_SUCCESS_URL: string;
  PAYMENT_CANCEL_URL: string;
  /** Required when PAYMENT_PROVIDER=mock */
  PAYMENT_WEBHOOK_SECRET: string | null;
  /** Required when PAYMENT_PROVIDER=stripe */
  STRIPE_SECRET_KEY: string | null;
  /** Required when PAYMENT_PROVIDER=stripe */
  STRIPE_WEBHOOK_SECRET: string | null;
};

function requireString(value: unknown, key: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing or invalid environment variable: ${key}`);
  }
  return value;
}

function optionalString(value: unknown): string | null {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }
  return value.trim();
}

function defaultWebhookSecretForMock(authSecret: string): string {
  return createHash("sha256")
    .update(`corredora-mock-payment:${authSecret}`)
    .digest("hex");
}

/**
 * Minimal env validation for Backend Foundation + Auth + Payments MVP.
 */
export function validateEnv(config: Record<string, unknown>): Env {
  const portRaw = config.PORT ?? "3001";
  const port = Number(portRaw);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("PORT must be a positive integer");
  }

  const authSecret = requireString(config.AUTH_SECRET, "AUTH_SECRET");
  const nodeEnv = requireString(config.NODE_ENV ?? "development", "NODE_ENV");
  const corsOrigin = requireString(
    config.CORS_ORIGIN ?? "http://localhost:3000",
    "CORS_ORIGIN",
  );

  const providerRaw = (
    optionalString(config.PAYMENT_PROVIDER) ?? "mock"
  ).toLowerCase();
  if (providerRaw !== "stripe" && providerRaw !== "mock") {
    throw new Error("PAYMENT_PROVIDER must be 'stripe' or 'mock'");
  }
  const paymentProvider = providerRaw as PaymentProviderName;

  const publicApiBaseUrl = requireString(
    config.PUBLIC_API_BASE_URL ?? `http://localhost:${port}`,
    "PUBLIC_API_BASE_URL",
  );
  const paymentSuccessUrl = requireString(
    config.PAYMENT_SUCCESS_URL ??
      `${corsOrigin.replace(/\/$/, "")}/kit-pickup-requests/payment/success`,
    "PAYMENT_SUCCESS_URL",
  );
  const paymentCancelUrl = requireString(
    config.PAYMENT_CANCEL_URL ??
      `${corsOrigin.replace(/\/$/, "")}/kit-pickup-requests/payment/cancel`,
    "PAYMENT_CANCEL_URL",
  );

  let stripeSecretKey: string | null = optionalString(config.STRIPE_SECRET_KEY);
  let stripeWebhookSecret: string | null = optionalString(
    config.STRIPE_WEBHOOK_SECRET,
  );
  let paymentWebhookSecret: string | null = optionalString(
    config.PAYMENT_WEBHOOK_SECRET,
  );

  if (paymentProvider === "stripe") {
    stripeSecretKey = requireString(config.STRIPE_SECRET_KEY, "STRIPE_SECRET_KEY");
    stripeWebhookSecret = requireString(
      config.STRIPE_WEBHOOK_SECRET,
      "STRIPE_WEBHOOK_SECRET",
    );
  } else {
    paymentWebhookSecret =
      paymentWebhookSecret ?? defaultWebhookSecretForMock(authSecret);
  }

  return {
    PORT: port,
    NODE_ENV: nodeEnv,
    DATABASE_URL: requireString(config.DATABASE_URL, "DATABASE_URL"),
    CORS_ORIGIN: corsOrigin,
    AUTH_SECRET: authSecret,
    PAYMENT_PROVIDER: paymentProvider,
    PUBLIC_API_BASE_URL: publicApiBaseUrl,
    PAYMENT_SUCCESS_URL: paymentSuccessUrl,
    PAYMENT_CANCEL_URL: paymentCancelUrl,
    PAYMENT_WEBHOOK_SECRET: paymentWebhookSecret,
    STRIPE_SECRET_KEY: stripeSecretKey,
    STRIPE_WEBHOOK_SECRET: stripeWebhookSecret,
  };
}
