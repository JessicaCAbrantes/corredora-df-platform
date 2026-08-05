/**
 * FASE 3.5-D3-B — Prometheus text exposition (0.0.4) for payment metrics only.
 *
 * Aggregation reminder for scrapers (do not change domain meaning here):
 * - Counter → sum / rate across replicas
 * - Histogram → histogram_quantile over summed buckets
 * - Gauge DB-backed (`payment_ledger_received_*`) → max() — never sum replicas
 */
import {
  PAYMENT_WEBHOOK_DURATION_BUCKETS_SECONDS,
  type PaymentMetricsRegistry,
  paymentMetricsRegistry,
} from "../payments/payment-metrics";

function escapeLabelValue(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/"/g, '\\"');
}

function formatLabels(
  labels: Record<string, string>,
  extra?: Record<string, string>,
): string {
  const merged = { ...labels, ...extra };
  const keys = Object.keys(merged).sort();
  if (keys.length === 0) return "";
  const inner = keys
    .map((k) => `${k}="${escapeLabelValue(merged[k])}"`)
    .join(",");
  return `{${inner}}`;
}

function formatFloat(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return String(value);
}

/**
 * Render registry as Prometheus text (content-type:
 * text/plain; version=0.0.4; charset=utf-8).
 */
export function renderPrometheusText(
  registry: PaymentMetricsRegistry = paymentMetricsRegistry,
): string {
  const lines: string[] = [];
  const emittedTypes = new Set<string>();

  const ensureType = (name: string, type: "counter" | "gauge" | "histogram") => {
    if (emittedTypes.has(name)) return;
    emittedTypes.add(name);
    lines.push(`# HELP ${name} Payment metrics contract series`);
    lines.push(`# TYPE ${name} ${type}`);
  };

  const counters = registry
    .listCounterSamples()
    .sort(
      (a, b) =>
        a.name.localeCompare(b.name) ||
        formatLabels(a.labels).localeCompare(formatLabels(b.labels)),
    );
  for (const sample of counters) {
    ensureType(sample.name, "counter");
    lines.push(
      `${sample.name}${formatLabels(sample.labels)} ${formatFloat(sample.value)}`,
    );
  }

  const gauges = registry
    .listGaugeSamples()
    .sort(
      (a, b) =>
        a.name.localeCompare(b.name) ||
        formatLabels(a.labels).localeCompare(formatLabels(b.labels)),
    );
  for (const sample of gauges) {
    ensureType(sample.name, "gauge");
    lines.push(
      `${sample.name}${formatLabels(sample.labels)} ${formatFloat(sample.value)}`,
    );
  }

  const histograms = registry
    .listHistogramSnapshots()
    .sort(
      (a, b) =>
        a.name.localeCompare(b.name) ||
        formatLabels(a.labels).localeCompare(formatLabels(b.labels)),
    );
  for (const hist of histograms) {
    ensureType(hist.name, "histogram");
    for (const le of PAYMENT_WEBHOOK_DURATION_BUCKETS_SECONDS) {
      const bucket = hist.buckets.find((b) => b.le === le);
      const count = bucket?.count ?? 0;
      lines.push(
        `${hist.name}_bucket${formatLabels(hist.labels, { le: String(le) })} ${formatFloat(count)}`,
      );
    }
    lines.push(
      `${hist.name}_bucket${formatLabels(hist.labels, { le: "+Inf" })} ${formatFloat(hist.count)}`,
    );
    lines.push(
      `${hist.name}_sum${formatLabels(hist.labels)} ${formatFloat(hist.sum)}`,
    );
    lines.push(
      `${hist.name}_count${formatLabels(hist.labels)} ${formatFloat(hist.count)}`,
    );
  }

  lines.push("");
  return lines.join("\n");
}

export const PROMETHEUS_CONTENT_TYPE =
  "text/plain; version=0.0.4; charset=utf-8";
