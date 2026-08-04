/**
 * FASE 3.5-B — Payment decision structured logs.
 * Canonical contract: docs/observability/payment-events.md
 */

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

export type PaymentDecisionEvent = PaymentCheckoutEvent | (string & {});

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
  result: PaymentDecisionResult;
  code: string | null;
  reason: PaymentDecisionReason | null;
};

export type PaymentDecisionLogInput = {
  environment: string;
  event: PaymentCheckoutEvent;
  category: PaymentDecisionCategory;
  provider: string;
  paymentId?: string | null;
  requestId?: string | null;
  userId?: string | null;
  providerPaymentId?: string | null;
  providerEventId?: string | null;
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
