/**
 * FASE 3.5-B — Payment decision structured logs.
 * Canonical contract: docs/observability/payment-events.md (v1.1 adds correlationId)
 * Metrics (3.5-D1): emit also records counters — docs/observability/payment-metrics.md
 */
import { getCorrelationId } from "../observability/correlation-context";
import { recordPaymentDecisionMetric } from "./payment-metrics";

export type PaymentDecisionCategory = "trace" | "audit" | "warn" | "error";

export type PaymentDecisionResult = "success" | "rejected" | "noop" | "error";

export type PaymentDecisionReason =
  | "existing_pending"
  | "race_detected"
  | "stale_session"
  | "duplicate_event"
  | "already_processed"
  | "crash_recovery"
  | "ignored_unmapped"
  | "permanent_domain_conflict"
  | "payment_not_found"
  | "request_not_found"
  | "invalid_signature"
  | "invalid_transition"
  | "request_cancelled"
  | "term_required"
  | "payment_not_required"
  | "already_paid"
  | "payment_waived"
  | "gateway_failure"
  | "expired"
  | "declined"
  | "cancelled_by_provider"
  | "verify_failure"
  | "processing_failure";

export type PaymentCheckoutEvent =
  | "payment.checkout.created"
  | "payment.checkout.reused"
  | "payment.checkout.rejected"
  | "payment.checkout.gateway_error";

export type PaymentWebhookEventName =
  | "payment.webhook.received"
  | "payment.webhook.duplicate"
  | "payment.webhook.stale"
  | "payment.webhook.payment_confirmed"
  | "payment.webhook.payment_failed"
  | "payment.webhook.retryable"
  | "payment.webhook.acknowledged_permanent"
  | "payment.webhook.signature_rejected"
  | "payment.webhook.ignored_unmapped"
  | "payment.webhook.verify_error"
  | "payment.webhook.processing_error";

export type PaymentDecisionEventName =
  | PaymentCheckoutEvent
  | PaymentWebhookEventName;

/** Contract keys — must match docs/observability/payment-events.md (v1.1+) */
export const PAYMENT_DECISION_PAYLOAD_KEYS = [
  "timestamp",
  "service",
  "environment",
  "event",
  "category",
  "provider",
  "paymentId",
  "requestId",
  "userId",
  "providerPaymentId",
  "providerEventId",
  "correlationId",
  "result",
  "code",
  "reason",
] as const;

export const PAYMENT_DECISION_RESULTS = [
  "success",
  "rejected",
  "noop",
  "error",
] as const;

export const PAYMENT_DECISION_CATEGORIES = [
  "trace",
  "audit",
  "warn",
  "error",
] as const;

export const PAYMENT_DECISION_REASONS = [
  "existing_pending",
  "race_detected",
  "stale_session",
  "duplicate_event",
  "already_processed",
  "crash_recovery",
  "ignored_unmapped",
  "permanent_domain_conflict",
  "payment_not_found",
  "request_not_found",
  "invalid_signature",
  "invalid_transition",
  "request_cancelled",
  "term_required",
  "payment_not_required",
  "already_paid",
  "payment_waived",
  "gateway_failure",
  "expired",
  "declined",
  "cancelled_by_provider",
  "verify_failure",
  "processing_failure",
] as const;

export const PAYMENT_DECISION_EVENT_NAMES = [
  "payment.checkout.created",
  "payment.checkout.reused",
  "payment.checkout.rejected",
  "payment.checkout.gateway_error",
  "payment.webhook.received",
  "payment.webhook.duplicate",
  "payment.webhook.stale",
  "payment.webhook.payment_confirmed",
  "payment.webhook.payment_failed",
  "payment.webhook.retryable",
  "payment.webhook.acknowledged_permanent",
  "payment.webhook.signature_rejected",
  "payment.webhook.ignored_unmapped",
  "payment.webhook.verify_error",
  "payment.webhook.processing_error",
] as const;

/** Must never appear on a decision log payload (leak / noise protection). */
export const PAYMENT_DECISION_FORBIDDEN_KEYS = [
  "rawBody",
  "signature",
  "cookie",
  "cookies",
  "payloadHash",
  "customerEmail",
  "successUrl",
  "cancelUrl",
  "stack",
  "password",
  "authorization",
  "stripe-signature",
] as const;

export type PaymentDecisionPayload = {
  timestamp: string;
  service: "api";
  environment: string;
  event: string;
  category: PaymentDecisionCategory;
  provider: string;
  paymentId: string | null;
  requestId: string | null;
  userId: string | null;
  providerPaymentId: string | null;
  providerEventId: string | null;
  correlationId: string | null;
  result: PaymentDecisionResult;
  code: string | null;
  reason: PaymentDecisionReason | null;
};

export type PaymentDecisionLogInput = {
  environment: string;
  event: PaymentDecisionEventName;
  category: PaymentDecisionCategory;
  provider: string;
  paymentId?: string | null;
  requestId?: string | null;
  userId?: string | null;
  providerPaymentId?: string | null;
  providerEventId?: string | null;
  correlationId?: string | null;
  result: PaymentDecisionResult;
  code?: string | null;
  reason?: PaymentDecisionReason | null;
};

export type PaymentDecisionLogSink = (payload: PaymentDecisionPayload) => void;

const CATEGORY_TO_CONSOLE: Record<
  PaymentDecisionCategory,
  "debug" | "info" | "warn" | "error"
> = {
  trace: "debug",
  audit: "info",
  warn: "warn",
  error: "error",
};

export function buildPaymentDecisionPayload(
  input: PaymentDecisionLogInput,
  now: () => Date = () => new Date(),
): PaymentDecisionPayload {
  return {
    timestamp: now().toISOString(),
    service: "api",
    environment: input.environment,
    event: input.event,
    category: input.category,
    provider: input.provider,
    paymentId: input.paymentId ?? null,
    requestId: input.requestId ?? null,
    userId: input.userId ?? null,
    providerPaymentId: input.providerPaymentId ?? null,
    providerEventId: input.providerEventId ?? null,
    correlationId:
      input.correlationId !== undefined
        ? input.correlationId
        : (getCorrelationId() ?? null),
    result: input.result,
    code: input.code ?? null,
    reason: input.reason ?? null,
  };
}

export function defaultPaymentDecisionLogSink(
  payload: PaymentDecisionPayload,
): void {
  const level = CATEGORY_TO_CONSOLE[payload.category];
  const line = JSON.stringify(payload);
  // Single JSON object per line — no secrets, no free-text messages.
  console[level](line);
}

export function emitPaymentDecisionLog(
  input: PaymentDecisionLogInput,
  sink: PaymentDecisionLogSink = defaultPaymentDecisionLogSink,
): PaymentDecisionPayload {
  const payload = buildPaymentDecisionPayload(input);
  sink(payload);
  // Best-effort: metrics must never break the payment path.
  try {
    recordPaymentDecisionMetric(payload);
  } catch {
    // Swallow — registry/mapping failures are observability-only.
  }
  return payload;
}

/** Map checkout domain error codes → closed reason constants. */
export function checkoutRejectReason(
  code: string,
): PaymentDecisionReason {
  switch (code) {
    case "NOT_FOUND":
      return "request_not_found";
    case "REQUEST_CANCELLED":
      return "request_cancelled";
    case "TERM_REQUIRED":
      return "term_required";
    case "PAYMENT_NOT_REQUIRED":
      return "payment_not_required";
    case "ALREADY_PAID":
      return "already_paid";
    case "PAYMENT_WAIVED":
      return "payment_waived";
    case "INVALID_STATUS":
      return "invalid_transition";
    default:
      return "invalid_transition";
  }
}
