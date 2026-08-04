/**
 * FASE 3.5-D1 — Payment metrics foundation.
 * Canonical contract: docs/observability/payment-metrics.md (v1.0)
 *
 * Counters are derived only from decision-log payloads (single emission path).
 * Never use paymentId / requestId / correlationId (or other IDs) as labels.
 */
import type {
  PaymentDecisionEventName,
  PaymentDecisionPayload,
} from "./payment-decision-log";

export type PaymentMetricName =
  | "payment_checkout_created_total"
  | "payment_checkout_reused_total"
  | "payment_checkout_rejected_total"
  | "payment_checkout_gateway_error_total"
  | "payment_confirmed_total"
  | "payment_failed_total"
  | "payment_retryable_total"
  | "payment_signature_rejected_total"
  | "payment_permanent_ack_total"
  | "payment_webhook_duplicate_total"
  | "payment_webhook_stale_total"
  | "payment_webhook_ignored_unmapped_total"
  | "payment_webhook_verify_error_total"
  | "payment_webhook_processing_error_total";

export type PaymentMetricLabelKey = "provider" | "reason" | "code";

export type PaymentMetricLabels = Partial<
  Record<PaymentMetricLabelKey, string>
> & {
  provider: string;
};

export const PAYMENT_METRIC_NAMES = [
  "payment_checkout_created_total",
  "payment_checkout_reused_total",
  "payment_checkout_rejected_total",
  "payment_checkout_gateway_error_total",
  "payment_confirmed_total",
  "payment_failed_total",
  "payment_retryable_total",
  "payment_signature_rejected_total",
  "payment_permanent_ack_total",
  "payment_webhook_duplicate_total",
  "payment_webhook_stale_total",
  "payment_webhook_ignored_unmapped_total",
  "payment_webhook_verify_error_total",
  "payment_webhook_processing_error_total",
] as const satisfies readonly PaymentMetricName[];

/** Labels that must never appear on metrics (cardinality / PII / join keys). */
export const PAYMENT_METRIC_FORBIDDEN_LABELS = [
  "paymentId",
  "requestId",
  "correlationId",
  "userId",
  "providerPaymentId",
  "providerEventId",
] as const;

type CounterSpec = {
  name: PaymentMetricName;
  labelKeys: readonly PaymentMetricLabelKey[];
};

/**
 * Event → counter mapping (Metrics Contract v1.0).
 * `payment.webhook.received` intentionally omitted (D2).
 */
export const PAYMENT_EVENT_TO_METRIC: Partial<
  Record<PaymentDecisionEventName, CounterSpec>
> = {
  "payment.checkout.created": {
    name: "payment_checkout_created_total",
    labelKeys: ["provider"],
  },
  "payment.checkout.reused": {
    name: "payment_checkout_reused_total",
    labelKeys: ["provider", "reason"],
  },
  "payment.checkout.rejected": {
    name: "payment_checkout_rejected_total",
    labelKeys: ["provider", "reason"],
  },
  "payment.checkout.gateway_error": {
    name: "payment_checkout_gateway_error_total",
    labelKeys: ["provider"],
  },
  "payment.webhook.payment_confirmed": {
    name: "payment_confirmed_total",
    labelKeys: ["provider"],
  },
  "payment.webhook.payment_failed": {
    name: "payment_failed_total",
    labelKeys: ["provider", "reason"],
  },
  "payment.webhook.retryable": {
    name: "payment_retryable_total",
    labelKeys: ["provider", "code"],
  },
  "payment.webhook.signature_rejected": {
    name: "payment_signature_rejected_total",
    labelKeys: ["provider"],
  },
  "payment.webhook.acknowledged_permanent": {
    name: "payment_permanent_ack_total",
    labelKeys: ["provider", "code"],
  },
  "payment.webhook.duplicate": {
    name: "payment_webhook_duplicate_total",
    labelKeys: ["provider"],
  },
  "payment.webhook.stale": {
    name: "payment_webhook_stale_total",
    labelKeys: ["provider"],
  },
  "payment.webhook.ignored_unmapped": {
    name: "payment_webhook_ignored_unmapped_total",
    labelKeys: ["provider"],
  },
  "payment.webhook.verify_error": {
    name: "payment_webhook_verify_error_total",
    labelKeys: ["provider"],
  },
  "payment.webhook.processing_error": {
    name: "payment_webhook_processing_error_total",
    labelKeys: ["provider"],
  },
};

export type PaymentMetricSample = {
  name: PaymentMetricName;
  labels: PaymentMetricLabels;
  value: number;
};

function encodeLabels(labels: PaymentMetricLabels): string {
  const keys = Object.keys(labels).sort() as PaymentMetricLabelKey[];
  return keys.map((k) => `${k}=${labels[k]}`).join(",");
}

function parseLabels(encoded: string): PaymentMetricLabels {
  const labels: Record<string, string> = {};
  if (!encoded) {
    return { provider: "unknown" };
  }
  for (const part of encoded.split(",")) {
    const eq = part.indexOf("=");
    if (eq <= 0) continue;
    labels[part.slice(0, eq)] = part.slice(eq + 1);
  }
  return labels as PaymentMetricLabels;
}

export class PaymentMetricsRegistry {
  private readonly counters = new Map<string, number>();

  private key(name: PaymentMetricName, labels: PaymentMetricLabels): string {
    return `${name}|${encodeLabels(labels)}`;
  }

  inc(name: PaymentMetricName, labels: PaymentMetricLabels, delta = 1): void {
    for (const forbidden of PAYMENT_METRIC_FORBIDDEN_LABELS) {
      if (Object.prototype.hasOwnProperty.call(labels, forbidden)) {
        throw new Error(`forbidden metric label: ${forbidden}`);
      }
    }
    const key = this.key(name, labels);
    this.counters.set(key, (this.counters.get(key) ?? 0) + delta);
  }

  get(name: PaymentMetricName, labels: PaymentMetricLabels): number {
    return this.counters.get(this.key(name, labels)) ?? 0;
  }

  snapshot(): PaymentMetricSample[] {
    const samples: PaymentMetricSample[] = [];
    for (const [key, value] of this.counters.entries()) {
      const sep = key.indexOf("|");
      const name = key.slice(0, sep) as PaymentMetricName;
      const labels = parseLabels(key.slice(sep + 1));
      samples.push({ name, labels, value });
    }
    return samples.sort((a, b) => {
      const byName = a.name.localeCompare(b.name);
      if (byName !== 0) return byName;
      return encodeLabels(a.labels).localeCompare(encodeLabels(b.labels));
    });
  }

  reset(): void {
    this.counters.clear();
  }
}

/** Process-local registry (v1.0). Aggregation across instances is D3. */
export const paymentMetricsRegistry = new PaymentMetricsRegistry();

function buildLabels(
  spec: CounterSpec,
  payload: PaymentDecisionPayload,
): PaymentMetricLabels {
  const labels: PaymentMetricLabels = { provider: payload.provider };
  for (const key of spec.labelKeys) {
    if (key === "provider") continue;
    if (key === "reason") {
      labels.reason = payload.reason ?? "unknown";
    } else if (key === "code") {
      labels.code = payload.code ?? "unknown";
    }
  }
  return labels;
}

/**
 * Single metrics emission path — called from `emitPaymentDecisionLog` only.
 * Unknown / unmapped events (e.g. webhook.received) are no-ops.
 */
export function recordPaymentDecisionMetric(
  payload: PaymentDecisionPayload,
  registry: PaymentMetricsRegistry = paymentMetricsRegistry,
): void {
  const spec =
    PAYMENT_EVENT_TO_METRIC[payload.event as PaymentDecisionEventName];
  if (!spec) return;
  registry.inc(spec.name, buildLabels(spec, payload));
}

/** Test helper — clears process-local counters. */
export function resetPaymentMetricsForTests(): void {
  paymentMetricsRegistry.reset();
}
