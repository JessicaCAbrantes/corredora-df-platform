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
  /** Set when PAYMENT_PROVIDER=mock (explicit or derived from AUTH_SECRET) */
  PAYMENT_WEBHOOK_SECRET: string | null;
  /** Required when PAYMENT_PROVIDER=stripe */
  STRIPE_SECRET_KEY: string | null;
  /** Required when PAYMENT_PROVIDER=stripe */
  STRIPE_WEBHOOK_SECRET: string | null;
  /**
   * Comma-separated User.id allowlist for Kit Pickup Operations (Phase 2.1).
   * MVP only — not a full RBAC.
   */
  KIT_PICKUP_OPERATOR_USER_IDS: string[];
  /**
   * FASE 3.5-D3-B — expose GET /metrics.
   * Default false → endpoint returns 404.
   * When true, METRICS_BEARER_TOKEN is required (fail-closed).
   */
  METRICS_ENABLED: boolean;
  /** Required non-empty when METRICS_ENABLED=true */
  METRICS_BEARER_TOKEN: string | null;
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

function parseBoolFlag(value: unknown, defaultValue: boolean): boolean {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }
  if (typeof value === "boolean") return value;
  const raw = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(raw)) return true;
  if (["0", "false", "no", "off"].includes(raw)) return false;
  throw new Error(
    `Invalid boolean environment variable value: ${String(value)}`,
  );
}

function defaultWebhookSecretForMock(authSecret: string): string {
  return createHash("sha256")
    .update(`corredora-mock-payment:${authSecret}`)
    .digest("hex");
}

/**
 * Minimal env validation for Backend Foundation + Auth + Payments MVP.
 * FASE 3.4-B: fail-closed payment configuration (especially production).
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

  const stripeSecretKey: string | null = optionalString(config.STRIPE_SECRET_KEY);
  const stripeWebhookSecret: string | null = optionalString(
    config.STRIPE_WEBHOOK_SECRET,
  );
  let paymentWebhookSecret: string | null = optionalString(
    config.PAYMENT_WEBHOOK_SECRET,
  );

  // --- FASE 3.4-B: payment provider fail-closed / consistency ---
  if (nodeEnv === "production" && paymentProvider === "mock") {
    throw new Error(
      [
        "PAYMENT_PROVIDER=mock is not allowed when NODE_ENV=production.",
        "Set PAYMENT_PROVIDER=stripe and provide STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.",
      ].join(" "),
    );
  }

  if (paymentProvider === "stripe") {
    if (stripeSecretKey == null) {
      throw new Error(
        "Missing or invalid environment variable: STRIPE_SECRET_KEY (required when PAYMENT_PROVIDER=stripe)",
      );
    }
    if (stripeWebhookSecret == null) {
      throw new Error(
        "Missing or invalid environment variable: STRIPE_WEBHOOK_SECRET (required when PAYMENT_PROVIDER=stripe)",
      );
    }
  } else {
    // mock: Stripe keys must not be set (ambiguous / inconsistent config)
    if (stripeSecretKey != null || stripeWebhookSecret != null) {
      throw new Error(
        [
          "Inconsistent payment configuration: PAYMENT_PROVIDER=mock but Stripe secrets are set",
          "(STRIPE_SECRET_KEY and/or STRIPE_WEBHOOK_SECRET).",
          "Remove the Stripe secrets or set PAYMENT_PROVIDER=stripe.",
        ].join(" "),
      );
    }
    // Local/CI: allow derived HMAC secret; optional explicit PAYMENT_WEBHOOK_SECRET.
    paymentWebhookSecret =
      paymentWebhookSecret ?? defaultWebhookSecretForMock(authSecret);
  }

  const operatorIdsRaw = optionalString(config.KIT_PICKUP_OPERATOR_USER_IDS) ?? "";
  const operatorIds = operatorIdsRaw
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0);

  // --- FASE 3.5-D3-B: metrics export fail-closed ---
  const metricsEnabled = parseBoolFlag(config.METRICS_ENABLED, false);
  const metricsBearerToken = optionalString(config.METRICS_BEARER_TOKEN);
  if (metricsEnabled && metricsBearerToken == null) {
    throw new Error(
      [
        "METRICS_ENABLED=true requires a non-empty METRICS_BEARER_TOKEN.",
        "Set METRICS_BEARER_TOKEN or disable metrics with METRICS_ENABLED=false.",
      ].join(" "),
    );
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
    KIT_PICKUP_OPERATOR_USER_IDS: operatorIds,
    METRICS_ENABLED: metricsEnabled,
    METRICS_BEARER_TOKEN: metricsEnabled ? metricsBearerToken : null,
  };
}
