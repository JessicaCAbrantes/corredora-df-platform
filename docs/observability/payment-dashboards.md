# Payment Dashboards Contract

**Status:** Stable v1.0 (FASE 3.5-D3-A)  
**Scope:** Official operational dashboard definitions for kit-pickup payments  
**Depends on:** [payment-events.md](./payment-events.md) (v1.1), [payment-metrics.md](./payment-metrics.md) (Counters v1.0 + Operational D2)  
**Out of scope:** Grafana JSON, Prometheus scrape, `/metrics` export (3.5-D3-B), hosted platforms

---

## 1. Purpose

Freeze **what** an ops dashboard must show and **how** series are aggregated — before any visualization tool exists.

This contract is **semantic**. It does **not** claim that Grafana, Prometheus, or automatic scrape are deployed today.

---

## 2. Honesty (today)

| Claim | Today |
|---|---|
| Scrape automático | **Não** |
| Prometheus | **Não** |
| Grafana / Datadog / Loki | **Não** |
| Endpoint `/metrics` | **Não** (reservado a D3-B) |
| O que este documento faz | Descreve o comportamento **esperado** de painéis quando a telemetria for consumida |

Until export exists, operators use [decision logs](../ops/payments-runbook.md#105-decision-logs-fase-35-b) and SQL/ledger inspection. Panel definitions below remain the target layout.

---

## 3. Aggregation rules (mandatory)

Wrong aggregation doubles backlog or invents latency. Apply these rules in every panel query.

| Metric class | Examples | Valid aggregation across replicas | Forbidden |
|---|---|---|---|
| **Counter** (process-local) | `payment_confirmed_total`, `payment_retryable_total`, … | `rate()` / `increase()` after **sum** by labels | Treating raw counter levels as “current backlog” |
| **Histogram** (process-local) | `payment_webhook_processing_duration_seconds` | `histogram_quantile()` over **sum** of bucket series | Averaging quantiles across replicas incorrectly |
| **Gauge DB-backed** | `payment_ledger_received_total`, `payment_ledger_received_age_seconds` | **`max()`** (or `any` / single scrape target) | **`sum()`** across replicas — doubles global ledger truth |
| **Gauge process-local** (if added later) | — | Document per metric; never blindly `sum()` | Assuming DB semantics |

**Labels:** only closed sets from the metrics contract (`provider`, `reason`, `code`, `outcome`). Never IDs (`paymentId`, `correlationId`, …).

---

## 4. Official dashboard

**Id:** `payments-ops-v1`  
**Title:** Payments — Operational  
**Audience:** on-call / Tech Lead investigating checkout & webhook health  
**Refresh (when tool exists):** align with ledger sampler (≥ 30s); do not refresh faster than sample interval for gauge panels

### Panel catalog

| # | Panel id | Title | Operational question | Primary source | Notes |
|---|---|---|---|---|---|
| 1 | `checkout_funnel` | Checkout funnel | Are checkouts being created, reused, or rejected? | Counters: `payment_checkout_created_total`, `payment_checkout_reused_total`, `payment_checkout_rejected_total`, `payment_checkout_gateway_error_total` | `rate()` / `increase()` by `provider` (and `reason` where present) |
| 2 | `webhook_outcomes` | Webhook outcomes | What decisions are webhooks producing? | Counters: `payment_confirmed_total`, `payment_failed_total`, `payment_retryable_total`, `payment_permanent_ack_total`, `payment_webhook_duplicate_total`, `payment_signature_rejected_total`, `payment_webhook_stale_total`, `payment_webhook_ignored_unmapped_total`, `payment_webhook_verify_error_total`, `payment_webhook_processing_error_total` | Prefer stacked or multi-series rates; **duplicate** volume alone is not an incident |
| 3 | `webhook_latency` | Webhook processing latency | How long does verified webhook processing take? | Histogram: `payment_webhook_processing_duration_seconds` | Show p50 / p95 (or p99) by `provider`, optionally split by `outcome`; use `histogram_quantile` |
| 4 | `ledger_health` | Ledger RECEIVED health | Are events stuck in RECEIVED? How old is the oldest? | Gauges: `payment_ledger_received_total`, `payment_ledger_received_age_seconds` | **`max()` by `provider`**; empty backlog = **0** / **0** |

### Explicitly not panels (v1)

| Idea | Why deferred |
|---|---|
| Time-to-paid / business conversion | Not a D2 metric; would mislead |
| Checkout API creation latency | Deferred intentionally (not time-to-paid) |
| Per-`paymentId` / correlation traces as charts | Use logs + `correlationId`, not metrics |
| Partner / admin product dashboards | Product surface — out of ops observability |

---

## 5. Log correlation (companion, not a panel)

When a panel shows an anomaly, drill down via decision logs:

1. Filter stdout JSON: `"event":"payment.`
2. Narrow with `provider`, `code`, `reason`, `correlationId`
3. Follow [payments-runbook troubleshooting](../ops/payments-runbook.md)

Dashboards do **not** replace forensic log queries.

---

## 6. Versioning

| Change | Action |
|---|---|
| Add panel using existing frozen metrics | Bump minor (v1.1); update this file |
| Change aggregation rule or panel meaning | Explicit revision; prefer major if consumers break |
| Wire Grafana / scrape | D3-B+ — do not silently imply tools exist in §2 |

---

## 7. Related

- Metrics: [payment-metrics.md](./payment-metrics.md)
- Alerts: [payment-alerts.md](./payment-alerts.md)
- Events: [payment-events.md](./payment-events.md)
- Ops: [payments-runbook.md §10.6](../ops/payments-runbook.md#106-dashboards--alerts-fase-35-d3-a)
