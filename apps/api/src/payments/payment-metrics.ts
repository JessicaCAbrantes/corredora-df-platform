/**
 * FASE 3.5-D1 — Payment metrics foundation (Counters v1.0).
 * FASE 3.5-D2 — Operational histograms + DB-backed gauges.
 * Canonical contract: docs/observability/payment-metrics.md
 *
 * Counters: only from decision-log payloads.
 * Histograms/gauges: separate observe()/set() paths (not via decision-log map).
 * Never use paymentId / requestId / correlationId (or other IDs) as labels.
 */
import type {
  PaymentDecisionEventName,
  PaymentDecisionPayload,
} from "./payment-decision-log";

/** Counter names — Metrics Contract v1.0 (unchanged). */
export type PaymentCounterName =
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

/** Operational names — Metrics Contract D2 (additive). */
export type PaymentOperationalMetricName =
  | "payment_webhook_processing_duration_seconds"
  | "payment_ledger_received_total"
  | "payment_ledger_received_age_seconds";

export type PaymentMetricName =
  | PaymentCounterName
  | PaymentOperationalMetricName;

export type PaymentMetricLabelKey =
  | "provider"
  | "reason"
  | "code"
  | "outcome";

export type PaymentMetricLabels = Partial<
  Record<PaymentMetricLabelKey, string>
> & {
  provider: string;
};

/** Closed outcomes for webhook processing duration (D2). */
export const PAYMENT_WEBHOOK_DURATION_OUTCOMES = [
  "duplicate",
  "applied",
  "retryable",
  "permanent_ack",
  "error",
] as const;

export type PaymentWebhookDurationOutcome =
  (typeof PAYMENT_WEBHOOK_DURATION_OUTCOMES)[number];

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
] as const satisfies readonly PaymentCounterName[];

export const PAYMENT_OPERATIONAL_METRIC_NAMES = [
  "payment_webhook_processing_duration_seconds",
  "payment_ledger_received_total",
  "payment_ledger_received_age_seconds",
] as const satisfies readonly PaymentOperationalMetricName[];

/**
 * Fixed histogram buckets (seconds) for webhook processing duration.
 * Cumulative counts: each observation increments all buckets with le >= value,
 * plus the implicit +Inf via `_count`.
 */
export const PAYMENT_WEBHOOK_DURATION_BUCKETS_SECONDS = [
  0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10,
] as const;

/** Default ledger gauge sample interval (ms). Override via env. */
export const DEFAULT_LEDGER_METRICS_SAMPLE_MS = 30_000;

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
  name: PaymentCounterName;
  labelKeys: readonly PaymentMetricLabelKey[];
};

/**
 * Event → counter mapping (Metrics Contract v1.0).
 * `payment.webhook.received` intentionally omitted.
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
  /** Present for histogram bucket series (`le` label encoded in sample name key). */
  le?: string;
};

export type PaymentHistogramSnapshot = {
  name: PaymentOperationalMetricName;
  labels: PaymentMetricLabels;
  buckets: ReadonlyArray<{ le: number | "+Inf"; count: number }>;
  sum: number;
  count: number;
};

function encodeLabels(labels: PaymentMetricLabels): string {
  const keys = (Object.keys(labels) as PaymentMetricLabelKey[]).sort();
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

function assertAllowedLabels(labels: PaymentMetricLabels): void {
  for (const forbidden of PAYMENT_METRIC_FORBIDDEN_LABELS) {
    if (Object.prototype.hasOwnProperty.call(labels, forbidden)) {
      throw new Error(`forbidden metric label: ${forbidden}`);
    }
  }
}

/**
 * Age of oldest RECEIVED event in seconds.
 * Contract: **0** when there are no RECEIVED events (never null/NaN).
 */
export function ledgerReceivedAgeSeconds(
  oldestReceivedAt: Date | null | undefined,
  now: Date = new Date(),
): number {
  if (oldestReceivedAt == null) return 0;
  const age = (now.getTime() - oldestReceivedAt.getTime()) / 1000;
  return Number.isFinite(age) ? Math.max(0, age) : 0;
}

export class PaymentMetricsRegistry {
  private readonly counters = new Map<string, number>();
  private readonly gauges = new Map<string, number>();
  /** Histogram: `${name}|${labels}` → { bucketCounts, sum, count } */
  private readonly histograms = new Map<
    string,
    { bucketCounts: number[]; sum: number; count: number }
  >();

  private seriesKey(name: string, labels: PaymentMetricLabels): string {
    return `${name}|${encodeLabels(labels)}`;
  }

  private assertLabels(labels: PaymentMetricLabels): void {
    assertAllowedLabels(labels);
  }

  inc(name: PaymentCounterName, labels: PaymentMetricLabels, delta = 1): void {
    this.assertLabels(labels);
    const key = this.seriesKey(name, labels);
    this.counters.set(key, (this.counters.get(key) ?? 0) + delta);
  }

  set(
    name: PaymentOperationalMetricName,
    labels: PaymentMetricLabels,
    value: number,
  ): void {
    this.assertLabels(labels);
    const safe = Number.isFinite(value) ? value : 0;
    this.gauges.set(this.seriesKey(name, labels), safe);
  }

  observe(
    name: "payment_webhook_processing_duration_seconds",
    labels: PaymentMetricLabels,
    seconds: number,
  ): void {
    this.assertLabels(labels);
    if (labels.outcome) {
      const ok = (PAYMENT_WEBHOOK_DURATION_OUTCOMES as readonly string[]).includes(
        labels.outcome,
      );
      if (!ok) {
        throw new Error(`invalid webhook duration outcome: ${labels.outcome}`);
      }
    }
    const duration = Number.isFinite(seconds) && seconds >= 0 ? seconds : 0;
    const key = this.seriesKey(name, labels);
    let hist = this.histograms.get(key);
    if (!hist) {
      hist = {
        bucketCounts: PAYMENT_WEBHOOK_DURATION_BUCKETS_SECONDS.map(() => 0),
        sum: 0,
        count: 0,
      };
      this.histograms.set(key, hist);
    }
    for (let i = 0; i < PAYMENT_WEBHOOK_DURATION_BUCKETS_SECONDS.length; i++) {
      if (duration <= PAYMENT_WEBHOOK_DURATION_BUCKETS_SECONDS[i]) {
        hist.bucketCounts[i] += 1;
      }
    }
    hist.sum += duration;
    hist.count += 1;
  }

  get(name: PaymentMetricName, labels: PaymentMetricLabels): number {
    const key = this.seriesKey(name, labels);
    if (this.gauges.has(key)) return this.gauges.get(key)!;
    return this.counters.get(key) ?? 0;
  }

  getHistogram(
    name: "payment_webhook_processing_duration_seconds",
    labels: PaymentMetricLabels,
  ): PaymentHistogramSnapshot | null {
    const hist = this.histograms.get(this.seriesKey(name, labels));
    if (!hist) return null;
    const buckets: Array<{ le: number | "+Inf"; count: number }> =
      PAYMENT_WEBHOOK_DURATION_BUCKETS_SECONDS.map((le, i) => ({
        le,
        count: hist.bucketCounts[i],
      }));
    buckets.push({ le: "+Inf", count: hist.count });
    return {
      name,
      labels,
      buckets,
      sum: hist.sum,
      count: hist.count,
    };
  }

  listCounterSamples(): PaymentMetricSample[] {
    const samples: PaymentMetricSample[] = [];
    for (const [key, value] of this.counters.entries()) {
      const sep = key.indexOf("|");
      samples.push({
        name: key.slice(0, sep) as PaymentMetricName,
        labels: parseLabels(key.slice(sep + 1)),
        value,
      });
    }
    return samples;
  }

  listGaugeSamples(): PaymentMetricSample[] {
    const samples: PaymentMetricSample[] = [];
    for (const [key, value] of this.gauges.entries()) {
      const sep = key.indexOf("|");
      samples.push({
        name: key.slice(0, sep) as PaymentMetricName,
        labels: parseLabels(key.slice(sep + 1)),
        value,
      });
    }
    return samples;
  }

  listHistogramSnapshots(): PaymentHistogramSnapshot[] {
    const out: PaymentHistogramSnapshot[] = [];
    for (const key of this.histograms.keys()) {
      const sep = key.indexOf("|");
      const name = key.slice(0, sep) as PaymentOperationalMetricName;
      if (name !== "payment_webhook_processing_duration_seconds") continue;
      const labels = parseLabels(key.slice(sep + 1));
      const snap = this.getHistogram(name, labels);
      if (snap) out.push(snap);
    }
    return out;
  }

  snapshot(): PaymentMetricSample[] {
    const samples: PaymentMetricSample[] = [];
    for (const [key, value] of this.counters.entries()) {
      const sep = key.indexOf("|");
      samples.push({
        name: key.slice(0, sep) as PaymentMetricName,
        labels: parseLabels(key.slice(sep + 1)),
        value,
      });
    }
    for (const [key, value] of this.gauges.entries()) {
      const sep = key.indexOf("|");
      samples.push({
        name: key.slice(0, sep) as PaymentMetricName,
        labels: parseLabels(key.slice(sep + 1)),
        value,
      });
    }
    for (const [key, hist] of this.histograms.entries()) {
      const sep = key.indexOf("|");
      const name = key.slice(0, sep) as PaymentOperationalMetricName;
      const labels = parseLabels(key.slice(sep + 1));
      for (let i = 0; i < PAYMENT_WEBHOOK_DURATION_BUCKETS_SECONDS.length; i++) {
        samples.push({
          name,
          labels,
          value: hist.bucketCounts[i],
          le: String(PAYMENT_WEBHOOK_DURATION_BUCKETS_SECONDS[i]),
        });
      }
      samples.push({ name, labels, value: hist.count, le: "+Inf" });
      samples.push({
        name,
        labels: { ...labels, /* sum marker via le */ },
        value: hist.sum,
        le: "sum",
      });
    }
    return samples.sort((a, b) => {
      const byName = a.name.localeCompare(b.name);
      if (byName !== 0) return byName;
      const byLabels = encodeLabels(a.labels).localeCompare(
        encodeLabels(b.labels),
      );
      if (byLabels !== 0) return byLabels;
      return String(a.le ?? "").localeCompare(String(b.le ?? ""));
    });
  }

  reset(): void {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
  }
}

/** Process-local registry. Aggregation / scrape is D3. */
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
 * Single counter emission path — called from `emitPaymentDecisionLog` only.
 * Best-effort: errors are swallowed by the caller.
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

/** Best-effort webhook duration observe. */
export function observeWebhookProcessingDuration(
  provider: string,
  outcome: PaymentWebhookDurationOutcome,
  seconds: number,
  registry: PaymentMetricsRegistry = paymentMetricsRegistry,
): void {
  try {
    registry.observe(
      "payment_webhook_processing_duration_seconds",
      { provider, outcome },
      seconds,
    );
  } catch {
    // Observability must not break payment processing.
  }
}

export type LedgerReceivedRow = {
  provider: string;
  count: number;
  oldestReceivedAt: Date | null;
};

/**
 * Apply DB sample to gauges. Sets **0** count and **0** age when a provider
 * has no RECEIVED rows (including explicit `providers` with empty groups).
 */
export function applyLedgerReceivedSample(
  rows: LedgerReceivedRow[],
  providers: readonly string[],
  now: Date = new Date(),
  registry: PaymentMetricsRegistry = paymentMetricsRegistry,
): void {
  const byProvider = new Map(
    rows.map((r) => [r.provider, r] as const),
  );
  const all = new Set<string>([...providers, ...byProvider.keys()]);
  for (const provider of all) {
    const row = byProvider.get(provider);
    const count = row?.count ?? 0;
    const age =
      count === 0
        ? 0
        : ledgerReceivedAgeSeconds(row?.oldestReceivedAt ?? null, now);
    registry.set("payment_ledger_received_total", { provider }, count);
    registry.set("payment_ledger_received_age_seconds", { provider }, age);
  }
}

/** Test helper — clears process-local series. */
export function resetPaymentMetricsForTests(): void {
  paymentMetricsRegistry.reset();
}
