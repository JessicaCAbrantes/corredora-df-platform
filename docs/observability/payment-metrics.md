# Payment Metrics Contract

**Status:** Stable — Counters **v1.0** (FASE 3.5-D1) + Operational **D2** (FASE 3.5-D2)  
**Scope:**  
- **v1.0:** Counters derived from the [Payment Events Contract](./payment-events.md) (v1.1)  
- **D2:** Webhook processing histogram + DB-backed ledger RECEIVED gauges  
**Out of scope:** live Grafana/Alertmanager, Prometheus scrape / `/metrics` (3.5-D3-B), checkout creation latency, `payment_retryable_pending_total`

**Related (3.5-D3-A):** [payment-dashboards.md](./payment-dashboards.md) · [payment-alerts.md](./payment-alerts.md) — semantic contracts only.

---

## 1. Purpose

Freeze metrics with the same discipline as payment decision events:

- canonical metric names
- types (`Counter`, `Gauge`, `Histogram`)
- allowed labels (low cardinality, closed sets)
- operational meaning
- explicit increment / observe / sample rules

Counters answer **rate / volume**. Operational gauges/histograms answer **backlog and latency**. Domain truth remains in **decision logs**.

---

## 2. Design rules

| Rule | Detail |
|---|---|
| Counter emission path | Counters only from `emitPaymentDecisionLog` → `recordPaymentDecisionMetric` |
| One increment per decision emit | Each domain decision emits **one** decision event; the mapped counter increments once. Stripe replays → `payment_webhook_duplicate_total`, not `payment_confirmed_total` again. Transient retries that re-emit `webhook.retryable` intentionally increment again. |
| Histogram / gauge paths | Histograms via `observe()`; gauges via `set()` from the ledger sampler — **not** via the decision-log counter map |
| No ID labels | Never label with `paymentId`, `requestId`, `correlationId`, `userId`, `providerPaymentId`, `providerEventId` |
| Low cardinality | Labels only from the closed sets declared per metric |
| No dual-write counters | Application code must not increment counters outside the decision-log hook |
| Best-effort | Metric recording must not throw into the payment path |
| Process-local series | In-memory registry per process until scrape (D3) |
| DB-backed gauges | Represent **global DB truth**; in multi-instance scrapes **do not sum** replica series (use max / any) |

---

## 3. Metric catalog (Counters) — v1.0

| Metric | Type | Labels | Increment when decision `event` is | Meaning |
|---|---|---|---|---|
| `payment_checkout_created_total` | Counter | `provider` | `payment.checkout.created` | New checkout URL created |
| `payment_checkout_reused_total` | Counter | `provider`, `reason` | `payment.checkout.reused` | Existing PENDING checkout reused |
| `payment_checkout_rejected_total` | Counter | `provider`, `reason` | `payment.checkout.rejected` | Checkout refused by domain rules |
| `payment_checkout_gateway_error_total` | Counter | `provider` | `payment.checkout.gateway_error` | Gateway createCheckout failed |
| `payment_confirmed_total` | Counter | `provider` | `payment.webhook.payment_confirmed` | Payment → PAID |
| `payment_failed_total` | Counter | `provider`, `reason` | `payment.webhook.payment_failed` | Payment → FAILED |
| `payment_retryable_total` | Counter | `provider`, `code` | `payment.webhook.retryable` | Transient webhook failure (HTTP 5xx path) |
| `payment_signature_rejected_total` | Counter | `provider` | `payment.webhook.signature_rejected` | Signature / auth verify failed |
| `payment_permanent_ack_total` | Counter | `provider`, `code` | `payment.webhook.acknowledged_permanent` | Permanent ACK (allowlist domain conflict) |
| `payment_webhook_duplicate_total` | Counter | `provider` | `payment.webhook.duplicate` | Idempotent replay noop |
| `payment_webhook_stale_total` | Counter | `provider` | `payment.webhook.stale` | Event ignored as stale |
| `payment_webhook_ignored_unmapped_total` | Counter | `provider` | `payment.webhook.ignored_unmapped` | Unmapped provider event type |
| `payment_webhook_verify_error_total` | Counter | `provider` | `payment.webhook.verify_error` | Unexpected verify exception |
| `payment_webhook_processing_error_total` | Counter | `provider` | `payment.webhook.processing_error` | Unexpected processing exception |

### Explicitly not counters

| Decision event | Why |
|---|---|
| `payment.webhook.received` | High-volume TRACE; latency covered by D2 histogram |

---

## 4. Operational metrics (D2)

### 4.1 Histogram

| Metric | Type | Labels | Observe when | Meaning |
|---|---|---|---|---|
| `payment_webhook_processing_duration_seconds` | Histogram | `provider`, `outcome` | End of `processVerifiedWebhook` (best-effort `finally`) | Wall time of verified webhook processing (excludes signature verify) |

**Closed `outcome` values:**

| `outcome` | When |
|---|---|
| `duplicate` | Ledger already `PROCESSED` (idempotent replay) |
| `applied` | Domain path completed and ledger marked `PROCESSED` (includes confirmed / failed / stale / ignored_unmapped) |
| `permanent_ack` | Permanent domain conflict ACK’d → `PROCESSED` |
| `retryable` | Transient path (e.g. `PAYMENT_NOT_FOUND`) → stays `RECEIVED`, HTTP 500 |
| `error` | Other failure before successful completion |

**Buckets (seconds, cumulative):**  
`0.005`, `0.01`, `0.025`, `0.05`, `0.1`, `0.25`, `0.5`, `1`, `2.5`, `5`, `10`, `+Inf`

### 4.2 DB-backed gauges

| Metric | Type | Labels | Update | Meaning |
|---|---|---|---|---|
| `payment_ledger_received_total` | Gauge | `provider` | Periodic sampler | Count of ledger rows with `status = RECEIVED` |
| `payment_ledger_received_age_seconds` | Gauge | `provider` | Periodic sampler | Age in seconds of the **oldest** `RECEIVED` row for that provider |

**Sampler**

- Implementation: `PaymentLedgerMetricsSampler` (`groupBy` provider on `RECEIVED`)
- Default interval: **30s** (`DEFAULT_LEDGER_METRICS_SAMPLE_MS`)
- Override: env `PAYMENT_METRICS_LEDGER_SAMPLE_MS` (milliseconds; `0` disables)
- **Never** run this `COUNT`/`groupBy` on every webhook request
- Includes current `PAYMENT_PROVIDER` in the provider hint so empty backlog still publishes **0**

**Empty backlog semantics (required)**

| Condition | `payment_ledger_received_total` | `payment_ledger_received_age_seconds` |
|---|---|---|
| Zero `RECEIVED` rows for provider | **0** | **0** |

Do **not** use `null`, omit the series, or emit `NaN`.

**Not in D2**

| Candidate | Why deferred |
|---|---|
| `payment_retryable_pending_total` | No persisted retryable state distinct from `RECEIVED` |
| `payment_checkout_duration_seconds` | Would measure session **creation** latency, not time-to-paid — rename/clarify if added later |
| Schema / status index migration | Not required at current volume |
| Prometheus scrape / `/metrics` | **D3-B** (platform) |
| Live Grafana / Alertmanager | After D3-B; contracts frozen in D3-A |

---

## 5. Label values

| Label | Allowed values |
|---|---|
| `provider` | Closed payment provider names (`mock`, `stripe`, …) |
| `reason` | Closed `PaymentDecisionReason` when the metric declares it |
| `code` | Closed decision/HTTP code when the metric declares it |
| `outcome` | Closed set in §4.1 only |

Missing optional decision fields on counters: use `"unknown"` only as fallback — not a normal operational label.

---

## 6. Versioning

| Change | Action |
|---|---|
| New counter or new allowed counter label | Bump counters minor + update this doc + mapping |
| D2 operational add (this section) | Additive; **do not** rename/remove v1.0 counters |
| Rename / remove metric or change label meaning | Bump major — avoid until necessary |

---

## 7. Implementation pointer

| Piece | Location |
|---|---|
| Registry + mapping + observe/set | `apps/api/src/payments/payment-metrics.ts` |
| Counter hook | `emitPaymentDecisionLog` → `recordPaymentDecisionMetric` |
| Duration observe | `PaymentsService.processVerifiedWebhook` |
| Ledger sampler | `apps/api/src/payments/payment-ledger-metrics-sampler.ts` |
| Contract tests | `payment-metrics.contract.test.ts`, `payment-metrics-operational.contract.test.ts` |

---

## 8. Honest limits

- Counters and histograms are **per process** until scrape/export (D3). Multi-instance → **sum** those series.
- DB-backed gauges reflect **global** ledger state. Multi-instance → **do not sum** replicas.
- Metrics do **not** replace decision logs for correlation or forensics.
- `payment_ledger_received_total` is the open RECEIVED backlog (NOT_FOUND **and** crash/other stuck rows) — not a pure “retryable only” count.
