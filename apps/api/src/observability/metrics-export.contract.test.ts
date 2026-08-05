/**
 * Contract tests — FASE 3.5-D3-B Prometheus export + /metrics auth matrix.
 */
import { HttpException } from "@nestjs/common";
import {
  PaymentMetricsRegistry,
  observeWebhookProcessingDuration,
  paymentMetricsRegistry,
  resetPaymentMetricsForTests,
} from "../payments/payment-metrics";
import { MetricsController } from "./metrics.controller";
import { renderPrometheusText } from "./prometheus-text";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function mockConfig(values: {
  METRICS_ENABLED: boolean;
  METRICS_BEARER_TOKEN: string | null;
}) {
  return {
    get(key: "METRICS_ENABLED" | "METRICS_BEARER_TOKEN") {
      return values[key];
    },
  };
}

function main(): void {
  resetPaymentMetricsForTests();

  // --- Prometheus text shape ---
  paymentMetricsRegistry.inc("payment_confirmed_total", { provider: "mock" }, 2);
  paymentMetricsRegistry.set(
    "payment_ledger_received_total",
    { provider: "mock" },
    0,
  );
  paymentMetricsRegistry.set(
    "payment_ledger_received_age_seconds",
    { provider: "mock" },
    0,
  );
  observeWebhookProcessingDuration("mock", "applied", 0.04);

  const text = renderPrometheusText(paymentMetricsRegistry);
  assert(text.includes("# TYPE payment_confirmed_total counter"), "counter type");
  assert(
    text.includes('payment_confirmed_total{provider="mock"} 2'),
    "counter sample",
  );
  assert(
    text.includes("# TYPE payment_ledger_received_total gauge"),
    "gauge type",
  );
  assert(
    text.includes('payment_ledger_received_total{provider="mock"} 0'),
    "gauge zero",
  );
  assert(
    text.includes(
      "# TYPE payment_webhook_processing_duration_seconds histogram",
    ),
    "histogram type",
  );
  assert(
    text.includes(
      'payment_webhook_processing_duration_seconds_bucket{le="0.05",outcome="applied",provider="mock"}',
    ) ||
      text.includes(
        'payment_webhook_processing_duration_seconds_bucket{outcome="applied",provider="mock",le="0.05"}',
      ),
    "histogram bucket with le",
  );
  // Labels are sorted alphabetically: le, outcome, provider
  assert(
    text.includes(
      'payment_webhook_processing_duration_seconds_bucket{le="0.05",outcome="applied",provider="mock"} 1',
    ),
    "bucket count for 0.05",
  );
  assert(
    text.includes(
      'payment_webhook_processing_duration_seconds_count{outcome="applied",provider="mock"} 1',
    ),
    "histogram count",
  );
  assert(!text.includes("paymentId"), "no paymentId in export");
  assert(!text.includes("correlationId"), "no correlationId in export");

  // Isolated registry empty → still valid trailing newline
  const empty = renderPrometheusText(new PaymentMetricsRegistry());
  assert(empty.endsWith("\n") || empty === "\n" || empty === "", "empty ok");

  // --- HTTP auth matrix ---
  {
    const controller = new MetricsController(
      mockConfig({
        METRICS_ENABLED: false,
        METRICS_BEARER_TOKEN: null,
      }) as never,
    );
    let status = 0;
    try {
      controller.metrics(undefined);
    } catch (error: unknown) {
      assert(error instanceof HttpException, "disabled → HttpException");
      status = error.getStatus();
    }
    assert(status === 404, "METRICS_ENABLED=false → 404");
  }

  {
    const controller = new MetricsController(
      mockConfig({
        METRICS_ENABLED: true,
        METRICS_BEARER_TOKEN: "secret-token",
      }) as never,
    );
    let status = 0;
    try {
      controller.metrics(undefined);
    } catch (error: unknown) {
      assert(error instanceof HttpException, "no auth → HttpException");
      status = error.getStatus();
    }
    assert(status === 401, "enabled without token → 401");

    status = 0;
    try {
      controller.metrics("Bearer wrong");
    } catch (error: unknown) {
      assert(error instanceof HttpException, "bad token → HttpException");
      status = error.getStatus();
    }
    assert(status === 401, "wrong token → 401");

    const body = controller.metrics("Bearer secret-token");
    assert(
      typeof body === "string" &&
        body.includes("# TYPE payment_confirmed_total counter"),
      "correct token → 200 body (prometheus text)",
    );
  }

  resetPaymentMetricsForTests();
  console.log("metrics-export.contract.test.ts: ok");
}

main();
