# Payment Alerts Contract

**Status:** Stable v1.0 (FASE 3.5-D3-A)  
**Scope:** Official alert definitions for kit-pickup payments  
**Depends on:** [payment-metrics.md](./payment-metrics.md), [payment-dashboards.md](./payment-dashboards.md)  
**Out of scope:** Alertmanager, Grafana alerts, Datadog monitors, paging integrations, `/metrics` scrape (3.5-D3-B)

---

## 1. Purpose

Freeze **when** operators should be notified and **which playbook** to open — before any alert engine exists.

This contract is **semantic**. Conditions use PromQL-shaped expressions as the **intended** evaluation language once series are scrapeable; they are **not** live rules today.

---

## 2. Honesty (today)

| Claim | Today |
|---|---|
| Scrape automático / Prometheus server | **Não** |
| `GET /metrics` (optional export) | See [payment-metrics.md](./payment-metrics.md) — off by default |
| Grafana / Datadog alerting | **Não** |
| Paging / on-call routing | **Não** |
| O que este documento faz | Descreve alertas **esperados** e o encadeamento Dashboard → Alerta → Runbook |

Until export + evaluation exist, treat these as **manual watch criteria** while reading logs and ledger state.

---

## 3. Design rules

| Rule | Detail |
|---|---|
| Closed labels only | Same as metrics contract — never alert on ID labels |
| Aggregation | Counters/histograms: sum then `rate`/`quantile`; DB gauges: **`max()`** — never `sum(payment_ledger_received_*)` across replicas |
| No alert on healthy noise | Do **not** page on `payment_webhook_duplicate_total` alone |
| Severity | `warning` = investigate soon; `critical` = likely user-visible payment breakage |
| Playbook required | Every alert maps to a runbook section |
| Thresholds | Initial values below are **starting points** — tune after baseline traffic; document changes in this file |

---

## 4. Alert catalog

### 4.1 `payment_signature_rejected_spike`

| Field | Value |
|---|---|
| **Objective** | Detect webhook auth/config failures (secret mismatch, bad signature) |
| **Severity** | `critical` |
| **Signals** | Counter `payment_signature_rejected_total` |
| **Condition (intended)** | `sum(rate(payment_signature_rejected_total[5m])) by (provider) > 0.1` **or** sustained non-zero rate for ≥ 5m during expected traffic |
| **Dashboard** | `payments-ops-v1` → `webhook_outcomes` |
| **Playbook** | [Runbook §11 — webhook 401](../ops/payments-runbook.md#11-troubleshooting--webhook-401) |

---

### 4.2 `payment_ledger_received_stuck`

| Field | Value |
|---|---|
| **Objective** | Detect events stuck in ledger `RECEIVED` (retryable miss, crash mid-flight, exhausted provider retries) |
| **Severity** | `warning` (elevate to `critical` if age keeps growing and confirmations stall) |
| **Signals** | Gauges `payment_ledger_received_total`, `payment_ledger_received_age_seconds` |
| **Condition (intended)** | `max(payment_ledger_received_total) by (provider) > 0` **and** `max(payment_ledger_received_age_seconds) by (provider) > 900` |
| **Dashboard** | `payments-ops-v1` → `ledger_health` |
| **Playbook** | [Runbook §13 — persistent RECEIVED](../ops/payments-runbook.md#13-troubleshooting--persistent-received) · [§14 PAYMENT_NOT_FOUND](../ops/payments-runbook.md#14-payment_not_found) |

**Note:** Backlog includes all `RECEIVED` rows, not only `PAYMENT_NOT_FOUND`.

---

### 4.3 `payment_retryable_elevated`

| Field | Value |
|---|---|
| **Objective** | Detect elevated transient webhook failures (often `PAYMENT_NOT_FOUND` race) |
| **Severity** | `warning` |
| **Signals** | Counter `payment_retryable_total` (label `code`) |
| **Condition (intended)** | `sum(rate(payment_retryable_total{code="PAYMENT_NOT_FOUND"}[10m])) by (provider) > 0.05` sustained, or sharp spike vs quiet baseline |
| **Dashboard** | `payments-ops-v1` → `webhook_outcomes` |
| **Playbook** | [Runbook §12 — webhook 500](../ops/payments-runbook.md#12-troubleshooting--webhook-500) · [§14](../ops/payments-runbook.md#14-payment_not_found) |

---

### 4.4 `payment_webhook_latency_high`

| Field | Value |
|---|---|
| **Objective** | Detect slow verified webhook processing (DB / app pressure) |
| **Severity** | `warning` |
| **Signals** | Histogram `payment_webhook_processing_duration_seconds` (`outcome="applied"` preferred for happy-path latency) |
| **Condition (intended)** | `histogram_quantile(0.95, sum(rate(payment_webhook_processing_duration_seconds_bucket{outcome="applied"}[5m])) by (le, provider)) > 2` |
| **Dashboard** | `payments-ops-v1` → `webhook_latency` |
| **Playbook** | [Runbook §12 — webhook 500](../ops/payments-runbook.md#12-troubleshooting--webhook-500) |

Bucket metric name suffix (`_bucket`) assumes Prometheus histogram exposition in D3-B; until then, use registry histogram snapshots / logs qualitatively.

---

### 4.5 `payment_processing_error_spike`

| Field | Value |
|---|---|
| **Objective** | Detect unexpected verify/processing exceptions |
| **Severity** | `critical` |
| **Signals** | Counters `payment_webhook_processing_error_total`, `payment_webhook_verify_error_total` |
| **Condition (intended)** | `sum(rate(payment_webhook_processing_error_total[5m])) by (provider) > 0` **or** same for `verify_error` during expected traffic |
| **Dashboard** | `payments-ops-v1` → `webhook_outcomes` |
| **Playbook** | [Runbook §12](../ops/payments-runbook.md#12-troubleshooting--webhook-500) |

---

## 5. Explicitly not alerts (v1)

| Candidate | Why |
|---|---|
| Alert on `duplicate` rate alone | Healthy idempotent replays |
| Alert on `permanent_ack` alone | Expected allowlist conflicts; investigate via logs if volume is abnormal |
| Business “conversion dropped” | Not an ops metric in D1/D2 |
| Per-payment / per-user alerts | Forbidden ID cardinality |

---

## 6. Interpretation chain

```text
Dashboard panel anomaly
        │
        ▼
Alert (this catalog) fires or matches watch criteria
        │
        ▼
Runbook section linked above
        │
        ▼
Troubleshooting (HTTP / ledger / secrets)
        │
        ▼
Decision logs + correlationId (forensics)
```

See [Runbook §10.6](../ops/payments-runbook.md#106-dashboards--alerts-fase-35-d3-a).

---

## 7. Versioning

| Change | Action |
|---|---|
| Tune threshold only | Document in this file; bump patch/minor note |
| New alert on existing metrics | Bump minor |
| Change signal meaning / remove alert | Explicit revision |
| Wire Alertmanager | Platform PR — does not change this catalog’s names without a contract bump |

---

## 8. Related

- Dashboards: [payment-dashboards.md](./payment-dashboards.md)
- Metrics: [payment-metrics.md](./payment-metrics.md)
- Events: [payment-events.md](./payment-events.md)
- Ops: [payments-runbook.md](../ops/payments-runbook.md)
