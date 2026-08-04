/**
 * Contract tests — FASE 3.5-D2 operational metrics.
 * Histogram buckets, gauge age semantics, sampler apply, best-effort, no ID labels.
 */
import {
  PAYMENT_OPERATIONAL_METRIC_NAMES,
  PAYMENT_WEBHOOK_DURATION_BUCKETS_SECONDS,
  PAYMENT_WEBHOOK_DURATION_OUTCOMES,
  PaymentMetricsRegistry,
  applyLedgerReceivedSample,
  ledgerReceivedAgeSeconds,
  observeWebhookProcessingDuration,
  paymentMetricsRegistry,
  resetPaymentMetricsForTests,
} from "./payment-metrics";
import { sampleLedgerReceivedMetrics } from "./payment-ledger-metrics-sampler";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function main(): Promise<void> {
  assert(PAYMENT_OPERATIONAL_METRIC_NAMES.length === 3, "D2 catalog size");
  assert(PAYMENT_WEBHOOK_DURATION_OUTCOMES.length === 5, "outcome enum");
  assert(
    PAYMENT_WEBHOOK_DURATION_BUCKETS_SECONDS.length === 11,
    "fixed bucket count",
  );

  resetPaymentMetricsForTests();

  // --- age: zero RECEIVED → 0 (never null/NaN) ---
  assert(ledgerReceivedAgeSeconds(null) === 0, "null → 0");
  assert(ledgerReceivedAgeSeconds(undefined) === 0, "undefined → 0");
  const now = new Date("2026-08-04T12:00:00.000Z");
  const oldest = new Date("2026-08-04T11:59:00.000Z");
  assert(
    ledgerReceivedAgeSeconds(oldest, now) === 60,
    "60s age",
  );

  // --- apply sample: empty hint provider gets zeros ---
  const isolated = new PaymentMetricsRegistry();
  applyLedgerReceivedSample([], ["mock"], now, isolated);
  assert(
    isolated.get("payment_ledger_received_total", { provider: "mock" }) === 0,
    "empty backlog count 0",
  );
  assert(
    isolated.get("payment_ledger_received_age_seconds", {
      provider: "mock",
    }) === 0,
    "empty backlog age 0",
  );

  applyLedgerReceivedSample(
    [
      {
        provider: "stripe",
        count: 2,
        oldestReceivedAt: oldest,
      },
    ],
    ["stripe", "mock"],
    now,
    isolated,
  );
  assert(
    isolated.get("payment_ledger_received_total", { provider: "stripe" }) === 2,
    "stripe count",
  );
  assert(
    isolated.get("payment_ledger_received_age_seconds", {
      provider: "stripe",
    }) === 60,
    "stripe age",
  );
  assert(
    isolated.get("payment_ledger_received_total", { provider: "mock" }) === 0,
    "mock still 0 when absent from rows",
  );
  assert(
    isolated.get("payment_ledger_received_age_seconds", {
      provider: "mock",
    }) === 0,
    "mock age 0",
  );

  // --- histogram observe + buckets ---
  resetPaymentMetricsForTests();
  observeWebhookProcessingDuration("mock", "applied", 0.04);
  observeWebhookProcessingDuration("mock", "applied", 0.2);
  const hist = paymentMetricsRegistry.getHistogram(
    "payment_webhook_processing_duration_seconds",
    { provider: "mock", outcome: "applied" },
  );
  assert(hist != null, "histogram exists");
  assert(hist!.count === 2, "two observations");
  assert(Math.abs(hist!.sum - 0.24) < 1e-9, "sum durations");
  const le005 = hist!.buckets.find((b) => b.le === 0.005)?.count;
  const le05 = hist!.buckets.find((b) => b.le === 0.05)?.count;
  const le025 = hist!.buckets.find((b) => b.le === 0.25)?.count;
  const leInf = hist!.buckets.find((b) => b.le === "+Inf")?.count;
  assert(le005 === 0, "both observations > 0.005");
  assert(le05 === 1, "only 0.04 <= 0.05");
  assert(le025 === 2, "both <= 0.25");
  assert(leInf === 2, "+Inf == count");

  // --- invalid outcome does not throw through observe helper ---
  const before = paymentMetricsRegistry.getHistogram(
    "payment_webhook_processing_duration_seconds",
    { provider: "mock", outcome: "error" },
  );
  observeWebhookProcessingDuration(
    "mock",
    "not_a_real_outcome" as "error",
    0.01,
  );
  const after = paymentMetricsRegistry.getHistogram(
    "payment_webhook_processing_duration_seconds",
    { provider: "mock", outcome: "error" },
  );
  assert(
    (before?.count ?? 0) === (after?.count ?? 0),
    "best-effort swallows invalid outcome",
  );

  // --- forbidden ID labels on set/observe ---
  let threw = false;
  try {
    isolated.set(
      "payment_ledger_received_total",
      // @ts-expect-error intentional
      { provider: "mock", paymentId: "x" },
      1,
    );
  } catch {
    threw = true;
  }
  assert(threw, "set rejects paymentId");

  threw = false;
  try {
    isolated.observe(
      "payment_webhook_processing_duration_seconds",
      // @ts-expect-error intentional
      { provider: "mock", outcome: "applied", correlationId: "c" },
      0.01,
    );
  } catch {
    threw = true;
  }
  assert(threw, "observe rejects correlationId");

  for (const sample of isolated.snapshot()) {
    assert(
      !Object.prototype.hasOwnProperty.call(sample.labels, "paymentId"),
      "no paymentId in snapshot",
    );
    assert(
      !Object.prototype.hasOwnProperty.call(sample.labels, "correlationId"),
      "no correlationId in snapshot",
    );
  }

  // --- sampler with fake Prisma groupBy ---
  resetPaymentMetricsForTests();
  const fakePrisma = {
    paymentWebhookEvent: {
      groupBy: async () => [
        {
          provider: "mock",
          _count: { _all: 3 },
          _min: { receivedAt: oldest },
        },
      ],
    },
  };
  await sampleLedgerReceivedMetrics(fakePrisma as never, ["mock"], now);
  assert(
    paymentMetricsRegistry.get("payment_ledger_received_total", {
      provider: "mock",
    }) === 3,
    "sampler sets count",
  );
  assert(
    paymentMetricsRegistry.get("payment_ledger_received_age_seconds", {
      provider: "mock",
    }) === 60,
    "sampler sets age",
  );

  resetPaymentMetricsForTests();
  console.log("payment-metrics-operational.contract.test.ts: ok");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
