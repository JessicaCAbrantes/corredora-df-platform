# Payment Metrics Contract

**Status:** Stable v1.0 (FASE 3.5-D1)  
**Scope:** Counters derived from the [Payment Events Contract](./payment-events.md) (v1.1)  
**Out of scope (later):** operational gauges/histograms (3.5-D2), dashboards/alerts (3.5-D3)

---

## 1. Purpose

Freeze a **Metrics Contract v1.0** with the same discipline as payment decision events:

- canonical metric names
- types (`Counter` in v1.0)
- allowed labels (low cardinality, closed sets)
- operational meaning
- explicit increment rules

Metrics answer **rate / volume** questions. Domain truth and forensic detail remain in **decision logs**.

---

## 2. Design rules

| Rule | Detail |
|---|---|
| Single emission path | Counters are incremented only from `emitPaymentDecisionLog` → `recordPaymentDecisionMetric` |
| One increment per decision emit | Each domain decision emits **one** decision event; the mapped counter increments once for that emit. Stripe replays that take the duplicate path increment `payment_webhook_duplicate_total`, not `payment_confirmed_total` again. Transient retries that re-emit `webhook.retryable` intentionally increment again (one count per attempt). |
| Event → metric mapping | Each counter maps from exactly one decision `event` value (1:1 with the catalog below) |
| No ID labels | Never label with `paymentId`, `requestId`, `correlationId`, `userId`, `providerPaymentId`, `providerEventId` |
| Low cardinality | Labels only: `provider`, and when listed `reason` / `code` (closed enums from the events contract) |
| No derived domain metrics | Do not invent counters for “business KPIs”; keep those in logs/analytics later |
| No dual-write | Application code must not increment counters outside the decision-log hook |
| Best-effort | Metric recording must not throw into the payment path; failures are swallowed after the decision log is written |
| Process-local | v1.0 ships an in-memory registry per process (Prometheus / scrape is optional later) |

---

## 3. Metric catalog (Counters)

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
| `payment_permanent_ack_total` | Counter | `provider`, `code` | `payment.webhook.acknowledged_permanent` | Permanent ACK (e.g. PAYMENT_NOT_FOUND) |
| `payment_webhook_duplicate_total` | Counter | `provider` | `payment.webhook.duplicate` | Idempotent replay noop |
| `payment_webhook_stale_total` | Counter | `provider` | `payment.webhook.stale` | Event ignored as stale |
| `payment_webhook_ignored_unmapped_total` | Counter | `provider` | `payment.webhook.ignored_unmapped` | Unmapped provider event type |
| `payment_webhook_verify_error_total` | Counter | `provider` | `payment.webhook.verify_error` | Unexpected verify exception |
| `payment_webhook_processing_error_total` | Counter | `provider` | `payment.webhook.processing_error` | Unexpected processing exception |

### Explicitly not in v1.0

| Decision event | Why deferred |
|---|---|
| `payment.webhook.received` | High volume / trace-oriented; latency & volume better as D2 histogram + optional counter |

### Operational gauges / histograms (3.5-D2 — not frozen here)

Examples reserved for D2 (names may change until D2 ships):

- `payment_ledger_received_age_seconds` (Gauge)
- `payment_ledger_received_total` (Gauge)
- `payment_retryable_pending_total` (Gauge)
- `payment_webhook_processing_duration_seconds` (Histogram/Summary)

---

## 4. Label values

| Label | Allowed values |
|---|---|
| `provider` | Closed `PaymentProvider` enum (`mock`, `stripe`, …) |
| `reason` | Closed `PaymentDecisionReason` when the metric declares the label; otherwise omit |
| `code` | Closed `PaymentDecisionCode` when the metric declares the label; otherwise omit |

Missing optional domain fields on the event **must not** invent label values. If `reason`/`code` is required by the metric and absent on the event, use the literal `"unknown"` (stable sentinel — not a free-form string). Emitters should always pass the closed enum when the decision has one; `"unknown"` is a contract fallback for incomplete payloads, not a normal operational label.

---

## 5. Versioning

| Change | Action |
|---|---|
| New counter or new allowed label | Bump minor (v1.1) + update this doc + mapping table in code |
| Rename / remove metric or change label meaning | Bump major (v2.0) — avoid until necessary |
| D2 gauges/histograms | New section or companion doc; do not silently alter v1.0 counters |

---

## 6. Implementation pointer

| Piece | Location |
|---|---|
| Registry + mapping | `apps/api/src/payments/payment-metrics.ts` |
| Hook | `emitPaymentDecisionLog` → `recordPaymentDecisionMetric` |
| Contract tests | `apps/api/src/payments/payment-metrics.contract.test.ts` |

---

## 7. Honest limits (v1.0)

- Counters are **per process** until a scrape/export layer exists.
- Multi-instance totals require aggregation outside the app (D3).
- Metrics do **not** replace decision logs for correlation or forensic queries.
