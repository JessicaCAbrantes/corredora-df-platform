# Payment Events Contract

**Status:** Stable  
**Version:** 1.1  
**Phase:** FASE 3.5-B3 freeze + **3.5-C** additive `correlationId`  
**Date:** 2026-08-04  
**Source of truth:** this file · runtime helper: `apps/api/src/payments/payment-decision-log.ts`  
**Ops how-to:** [payments-runbook.md § Decision logs](../ops/payments-runbook.md#105-decision-logs-fase-35-b)  
**Correlation:** [correlation.md](./correlation.md)

This is the **official contract** for structured payment decision logs. Dashboards, alerts, and runbooks must use these event names, categories, and field enums. Renaming after consumers depend on them is expensive — change only via an explicit contract revision (same PR that updates emitters + tests).

| PR | Scope | Status |
|---|---|---|
| **3.5-B1** | Checkout emitters | ✅ |
| **3.5-B2** | Webhook emitters | ✅ |
| **3.5-B3** | Canonical docs + runbook + contract tests (v1.0) | ✅ |
| **3.5-C** | Additive `correlationId` (v1.1) | ✅ (this phase) |

**Not in 3.5-C:** OpenTelemetry, Grafana, Loki, alerting dashboards.

**Related (3.5-D1):** process-local counters derived from these events — [payment-metrics.md](./payment-metrics.md) (Metrics Contract v1.0). Not a hosted metrics stack.

---

## Versioning

This catalog was **stable at v1.0** as of FASE 3.5-B3. **v1.1** (FASE 3.5-C) adds required field `correlationId` (additive).

| Change type | How to treat it |
|---|---|
| Additive (new optional `reason` / new event / new field with docs + tests) | Contract revision; document in this file; bump minor (`1.1`, …) |
| Incompatible (rename event, remove/rename field, change enum meaning) | **Breaking contract change** — must be explicit in the PR, update this file + emitters + contract tests, and bump major (`2.0`) |

Do not silently rename events or reshape the JSON schema after consumers (dashboards/alerts) depend on them.

---

## Category vs logger level

Do **not** mix these concepts.

| Concept | Belongs to | Purpose |
|---|---|---|
| `category` | Domain / ops taxonomy | How humans and dashboards group the signal |
| logger `level` | Logger / sink | Severity for retention, paging, and noise control |

| Category | Objective | Suggested logger level |
|---|---|---|
| `trace` | Internal execution flow (high volume) | DEBUG / TRACE |
| `audit` | Confirmed business decision | INFO |
| `warn` | Unexpected but controlled situation | WARN |
| `error` | Failure that interrupted or degraded the flow | ERROR |

---

## Base JSON schema (frozen)

Every payment decision log line is **one JSON object** (typically one line on stdout via `console`).

Every line **must** include exactly these fields (use `null` when not applicable). Do **not** invent values (e.g. do not invent `userId` for Stripe-only deliveries).

```json
{
  "timestamp": "2026-08-04T13:00:00.000Z",
  "service": "api",
  "environment": "production",
  "event": "payment.webhook.payment_confirmed",
  "category": "audit",
  "provider": "stripe",
  "paymentId": "kpp_…",
  "requestId": "kpr_…",
  "userId": null,
  "providerPaymentId": "cs_…",
  "providerEventId": "evt_…",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "result": "success",
  "code": null,
  "reason": null
}
```

### Required fields

| Field | Rules |
|---|---|
| `timestamp` | ISO-8601 UTC |
| `service` | Constant `"api"` |
| `environment` | Runtime (`development` / `test` / `production`, …) |
| `event` | Exact name from the [catalog](#event-catalog) |
| `category` | `trace` \| `audit` \| `warn` \| `error` |
| `provider` | `stripe` \| `mock` (current gateways) |
| `paymentId` | Internal id or `null` |
| `requestId` | Kit pickup request id or `null` (**not** HTTP request id) |
| `userId` | Authenticated participant id or `null` (webhooks: usually `null`) |
| `providerPaymentId` | Gateway session/payment id or `null` |
| `providerEventId` | Provider `event.id` (or mock synthetic) or `null` |
| `correlationId` | Request correlation id (FASE 3.5-C) or `null` if no ALS context |
| `result` | Closed enum — see below |
| `code` | Closed domain/security code or `null` — **never** a human message |
| `reason` | Closed constant or `null` — **never** free text |

### `result` (closed — only these)

- `success`
- `rejected`
- `noop`
- `error`

**Forbidden synonyms:** `ok`, `done`, `processed`, `accepted`, `fine`, …

### `reason` (closed constants)

Only the constants listed here (extend this document **and** TypeScript unions in the same PR):

| Constant | Typical use |
|---|---|
| `existing_pending` | Checkout reused an existing PENDING row |
| `race_detected` | Checkout reused after pending unique P2002 race |
| `stale_session` | Webhook for a non-current provider session |
| `duplicate_event` | Ledger already `PROCESSED` for `(provider, event_id)` |
| `already_processed` | Domain already in terminal/success path (soft noop) |
| `crash_recovery` | Payment already PAID; request catch-up |
| `ignored_unmapped` | Verified delivery with no mapped domain event |
| `permanent_domain_conflict` | Allowlist permanent domain code → ACK without domain write |
| `payment_not_found` | Retryable missing payment row |
| `request_not_found` | Checkout for unknown / non-owned request |
| `invalid_signature` | Missing/invalid webhook signature |
| `invalid_transition` | Checkout/request status not ready for payment |
| `request_cancelled` | Request cancelled |
| `term_required` | Term not accepted |
| `payment_not_required` | No fee on service |
| `already_paid` | Request already paid |
| `payment_waived` | Payment waived |
| `gateway_failure` | Provider checkout API failed |
| `expired` | Provider session expired → failed path |
| `declined` | Provider declined / failed payment |
| `cancelled_by_provider` | Provider cancelled session (if mapped later) |
| `verify_failure` | Webhook verify failed for non-signature reasons |
| `processing_failure` | Unexpected error while processing webhook |

**Forbidden:** free text (`"old session"`, `"retry"`, `"race"`, …).

### `code` (closed machine codes)

Always a stable machine code (same family as API error envelopes), never a message string.

Examples in use:

`PAYMENT_NOT_FOUND` · `NOT_FOUND` · `REQUEST_CANCELLED` · `AMOUNT_MISMATCH` · `CURRENCY_MISMATCH` · `PAYMENT_MISMATCH` · `REQUEST_MISMATCH` · `INVALID_STATUS` · `INVALID_SIGNATURE` · `MISSING_SIGNATURE` · `TERM_REQUIRED` · `PAYMENT_NOT_REQUIRED` · `ALREADY_PAID` · `PAYMENT_WAIVED` · `GATEWAY_ERROR` · `WEBHOOK_VERIFY_ERROR` · `WEBHOOK_PROCESSING_ERROR`

### Forbidden fields / content

Never appear on a decision log line (enforced in contract tests via `PAYMENT_DECISION_FORBIDDEN_KEYS`):

- `rawBody`, `signature`, `cookie` / `cookies`, `payloadHash`  
- Signature headers or secret values (`STRIPE_*`, mock HMAC, `AUTH_SECRET`)  
- Session tokens / `authorization`  
- Full customer email, checkout URLs, card data  
- Prisma / stack traces with query payloads  
- Extra ad-hoc keys beyond the schema above  

---

## Event catalog

| Event | Category | Result | Reason | Description |
|---|---|---|---|---|
| `payment.checkout.created` | `audit` | `success` | `null` | New PENDING payment + checkout session bound |
| `payment.checkout.reused` | `audit` | `success` | `existing_pending` \| `race_detected` | Reused existing PENDING (or after unique race) |
| `payment.checkout.rejected` | `warn` | `rejected` | `invalid_transition` \| `term_required` \| `already_paid` \| `payment_waived` \| `payment_not_required` \| `request_cancelled` \| `request_not_found` | Checkout refused by domain rules |
| `payment.checkout.gateway_error` | `error` | `error` | `gateway_failure` | Provider checkout failed; local row marked FAILED (new-checkout path) |
| `payment.webhook.received` | `trace` | `success` | `null` | Verified delivery entered the pipeline (**not** emitted on duplicate replay) |
| `payment.webhook.duplicate` | `audit` | `noop` | `duplicate_event` | Ledger short-circuit: already `PROCESSED` (**only** event on replay) |
| `payment.webhook.stale` | `warn` | `noop` | `stale_session` | Non-current provider session; domain unchanged; ledger may still complete |
| `payment.webhook.payment_confirmed` | `audit` | `success` \| `noop` | `null` \| `already_processed` \| `crash_recovery` | Payment confirmed in domain (or soft noop / recovery) |
| `payment.webhook.payment_failed` | `audit` | `success` \| `noop` | `expired` \| `declined` \| `cancelled_by_provider` \| `already_processed` | Failed path applied (or noop). Discriminate with `reason` |
| `payment.webhook.retryable` | `warn` | `rejected` | `payment_not_found` | Leave ledger `RECEIVED`; HTTP **500** so provider retries |
| `payment.webhook.acknowledged_permanent` | `audit` | `noop` | `permanent_domain_conflict` | Permanent allowlist conflict: HTTP **200** + ledger `PROCESSED`, no domain write |
| `payment.webhook.signature_rejected` | `warn` | `rejected` | `invalid_signature` | Missing/invalid signature → HTTP **401** |
| `payment.webhook.ignored_unmapped` | `audit` | `noop` | `ignored_unmapped` | Authenticated delivery with no mapped domain event; ACK |
| `payment.webhook.verify_error` | `error` | `error` | `verify_failure` | Verify failed for reasons other than signature |
| `payment.webhook.processing_error` | `error` | `error` | `processing_failure` | Unexpected failure during processing |

### Expected sequences (happy / common paths)

```text
Checkout OK:
  payment.checkout.created

Checkout reuse:
  payment.checkout.reused   (reason=existing_pending|race_detected)

Webhook paid (first delivery):
  payment.webhook.received
  payment.webhook.payment_confirmed

Webhook replay:
  payment.webhook.duplicate          ← only this event

Webhook permanent conflict:
  payment.webhook.received
  payment.webhook.acknowledged_permanent   (+ HTTP 200, ledger PROCESSED)

Webhook retryable miss:
  payment.webhook.received
  payment.webhook.retryable                (+ HTTP 500, ledger RECEIVED)

Webhook bad signature:
  payment.webhook.signature_rejected       (+ HTTP 401, no ledger)
```

### Naming notes

- Prefer **domain language** (`payment_confirmed`, `payment_failed`, `acknowledged_permanent`) over internals (`applied_*`) or bare protocol slang (`ack`).  
- One `payment_failed` event; put `expired` / `declined` / … in `reason`.  

### Jonathan / Operations Review checklist

> Can a new engineer understand what happened **without opening the code**?

If no → rename in this document **before** shipping emitters.

---

## Related

- [Payments runbook — decision logs](../ops/payments-runbook.md#105-decision-logs-fase-35-b)  
- [Kit pickup payments contract](../api/kit-pickup-requests.md)  
- [Architecture Baseline v1](../architecture/ARCHITECTURE-BASELINE-v1.md)  
- [Environment](../setup/environment.md)  
- Tests: `payment-checkout-logs.test.ts`, `payment-webhook-logs.test.ts`, `payment-decision-log.contract.test.ts`
