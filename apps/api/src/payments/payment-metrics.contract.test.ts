/**
 * Contract tests — FASE 3.5-D1 payment metrics foundation.
 * Asserts event → counter mapping and label rules (Metrics Contract v1.0).
 * Run via: pnpm --filter api test
 */
import { emitPaymentDecisionLog } from "./payment-decision-log";
import {
  PAYMENT_EVENT_TO_METRIC,
  PAYMENT_METRIC_FORBIDDEN_LABELS,
  PAYMENT_METRIC_NAMES,
  PaymentMetricsRegistry,
  recordPaymentDecisionMetric,
  resetPaymentMetricsForTests,
  paymentMetricsRegistry,
} from "./payment-metrics";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function main(): void {
  assert(PAYMENT_METRIC_NAMES.length === 14, "v1.0 counter catalog size");
  assert(
    Object.keys(PAYMENT_EVENT_TO_METRIC).length === 14,
    "mapped decision events",
  );
  assert(
    !("payment.webhook.received" in PAYMENT_EVENT_TO_METRIC),
    "webhook.received deferred to D2",
  );

  // --- catalog ↔ mapping 1:1 (no doc/code drift for names) ---
  const mappedNames = Object.values(PAYMENT_EVENT_TO_METRIC).map((s) => s.name);
  assert(
    new Set(mappedNames).size === mappedNames.length,
    "each metric mapped from exactly one event",
  );
  for (const name of PAYMENT_METRIC_NAMES) {
    assert(mappedNames.includes(name), `metric ${name} has an event mapping`);
  }
  for (const name of mappedNames) {
    assert(
      (PAYMENT_METRIC_NAMES as readonly string[]).includes(name),
      `mapped metric ${name} is in PAYMENT_METRIC_NAMES`,
    );
    assert(name.startsWith("payment_") && name.endsWith("_total"), name);
  }

  resetPaymentMetricsForTests();

  // --- event X → counter Y via emitPaymentDecisionLog (single path) ---
  emitPaymentDecisionLog({
    environment: "test",
    event: "payment.checkout.created",
    category: "audit",
    provider: "mock",
    paymentId: "pay_1",
    requestId: "req_1",
    correlationId: "corr_1",
    result: "success",
  });

  assert(
    paymentMetricsRegistry.get("payment_checkout_created_total", {
      provider: "mock",
    }) === 1,
    "checkout.created → payment_checkout_created_total",
  );

  emitPaymentDecisionLog({
    environment: "test",
    event: "payment.checkout.reused",
    category: "audit",
    provider: "stripe",
    result: "success",
    reason: "existing_pending",
  });
  assert(
    paymentMetricsRegistry.get("payment_checkout_reused_total", {
      provider: "stripe",
      reason: "existing_pending",
    }) === 1,
    "checkout.reused labels include reason",
  );

  emitPaymentDecisionLog({
    environment: "test",
    event: "payment.webhook.payment_confirmed",
    category: "audit",
    provider: "stripe",
    result: "success",
  });
  assert(
    paymentMetricsRegistry.get("payment_confirmed_total", {
      provider: "stripe",
    }) === 1,
    "webhook.payment_confirmed → payment_confirmed_total",
  );

  emitPaymentDecisionLog({
    environment: "test",
    event: "payment.webhook.retryable",
    category: "warn",
    provider: "stripe",
    result: "error",
    code: "LEDGER_WRITE_FAILED",
  });
  assert(
    paymentMetricsRegistry.get("payment_retryable_total", {
      provider: "stripe",
      code: "LEDGER_WRITE_FAILED",
    }) === 1,
    "retryable labels include code",
  );

  emitPaymentDecisionLog({
    environment: "test",
    event: "payment.webhook.acknowledged_permanent",
    category: "warn",
    provider: "mock",
    result: "noop",
    code: "PAYMENT_NOT_FOUND",
    reason: "payment_not_found",
  });
  assert(
    paymentMetricsRegistry.get("payment_permanent_ack_total", {
      provider: "mock",
      code: "PAYMENT_NOT_FOUND",
    }) === 1,
    "permanent ack → payment_permanent_ack_total",
  );

  // --- webhook.received must not increment any v1.0 counter ---
  const beforeReceived = paymentMetricsRegistry.snapshot().length;
  emitPaymentDecisionLog({
    environment: "test",
    event: "payment.webhook.received",
    category: "trace",
    provider: "mock",
    result: "success",
  });
  assert(
    paymentMetricsRegistry.snapshot().length === beforeReceived,
    "webhook.received does not create counters",
  );

  // --- missing reason/code → stable "unknown" sentinel ---
  const isolated = new PaymentMetricsRegistry();
  recordPaymentDecisionMetric(
    {
      timestamp: new Date().toISOString(),
      service: "api",
      environment: "test",
      event: "payment.checkout.rejected",
      category: "warn",
      provider: "mock",
      paymentId: null,
      requestId: null,
      userId: null,
      providerPaymentId: null,
      providerEventId: null,
      correlationId: null,
      result: "rejected",
      code: null,
      reason: null,
    },
    isolated,
  );
  assert(
    isolated.get("payment_checkout_rejected_total", {
      provider: "mock",
      reason: "unknown",
    }) === 1,
    "missing reason → unknown",
  );

  // --- forbidden ID labels ---
  let threw = false;
  try {
    isolated.inc(
      "payment_confirmed_total",
      // @ts-expect-error intentional forbidden label probe
      { provider: "mock", paymentId: "pay_x" },
    );
  } catch {
    threw = true;
  }
  assert(threw, "inc must reject paymentId label");
  assert(
    PAYMENT_METRIC_FORBIDDEN_LABELS.includes("correlationId"),
    "correlationId forbidden as label",
  );

  // --- snapshot never exposes ID label keys ---
  for (const sample of paymentMetricsRegistry.snapshot()) {
    for (const forbidden of PAYMENT_METRIC_FORBIDDEN_LABELS) {
      assert(
        !Object.prototype.hasOwnProperty.call(sample.labels, forbidden),
        `snapshot must not include ${forbidden}`,
      );
    }
  }

  // --- best-effort: metrics failure must not break emit ---
  const originalInc = paymentMetricsRegistry.inc;
  paymentMetricsRegistry.inc = () => {
    throw new Error("simulated metrics failure");
  };
  try {
    const ok = emitPaymentDecisionLog(
      {
        environment: "test",
        event: "payment.webhook.signature_rejected",
        category: "warn",
        provider: "mock",
        result: "rejected",
        reason: "invalid_signature",
      },
      () => undefined,
    );
    assert(
      ok.event === "payment.webhook.signature_rejected",
      "emit returns despite metrics throw",
    );
  } finally {
    paymentMetricsRegistry.inc = originalInc;
  }

  resetPaymentMetricsForTests();
  console.log("payment-metrics.contract.test.ts: ok");
}

main();
