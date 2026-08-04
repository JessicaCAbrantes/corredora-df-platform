# Payment decision events — canonical contract

**Status:** Frozen (pre-implementation)  
**Phase:** FASE 3.5-B  
**Date:** 2026-08-04  

This document is the **official contract** for structured payment decision logs. Dashboards, alerts, and runbooks must use these event names, categories, and field enums. Renaming after consumers depend on them is expensive — change only via an explicit contract revision.

**Implementation order (no domain/HTTP/ledger changes):**

| PR | Scope |
|---|---|
| **3.5-B1** | Checkout events only |
| **3.5-B2** | Webhook events only |
| **3.5-B3** | Tests + runbook pointer + enforce this schema |

Until B1 merges, **no runtime emitters** are required to exist.

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

## Base JSON schema

Every payment decision log line **must** include these fields. Use `null` when not applicable. Do not invent values (e.g. do not invent `userId` for Stripe-only deliveries).

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
  "result": "success",
  "code": null,
  "reason": null
}
```

| Field | Required | Rules |
|---|---|---|
| `timestamp` | yes | ISO-8601 UTC |
| `service` | yes | Constant `"api"` for Nest emitters |
| `environment` | yes | From runtime env (`development` / `test` / `production`, etc.) |
| `event` | yes | Exact name from the catalog below |
| `category` | yes | `trace` \| `audit` \| `warn` \| `error` |
| `provider` | yes | `stripe` \| `mock` |
| `paymentId` | yes | Internal id or `null` |
| `requestId` | yes | Kit pickup request id or `null` |
| `userId` | yes | Authenticated participant id or `null` (webhooks: usually `null`) |
| `providerPaymentId` | yes | Gateway session/payment id or `null` |
| `providerEventId` | yes | Provider `event.id` (or mock synthetic) or `null` |
| `result` | yes | Closed enum — see below |
| `code` | yes | Closed domain/security code or `null` — never a human message |
| `reason` | yes | Closed constant or `null` — never free text |

### `result` (closed)

Only:

- `success`
- `rejected`
- `noop`
- `error`

**Forbidden synonyms:** `ok`, `done`, `processed`, `accepted`, `fine`, …

### `reason` (closed constants)

Only the constants listed here (extend this document when adding a new one):

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

### `code` (closed examples)

Always a stable machine code (same family as API error envelopes), never a message string.

Examples already in the payments domain / HTTP contract:

- `PAYMENT_NOT_FOUND`
- `REQUEST_CANCELLED`
- `AMOUNT_MISMATCH`
- `CURRENCY_MISMATCH`
- `PAYMENT_MISMATCH`
- `REQUEST_MISMATCH`
- `INVALID_STATUS`
- `INVALID_SIGNATURE`
- `MISSING_SIGNATURE`
- `TERM_REQUIRED`
- `PAYMENT_NOT_REQUIRED`
- `ALREADY_PAID`
- `PAYMENT_WAIVED`
- `GATEWAY_ERROR`
- `WEBHOOK_VERIFY_ERROR`
- `WEBHOOK_PROCESSING_ERROR`

Extend this list in the same PR that introduces a new emitter `code`.

---

## Never log

- Raw webhook body  
- Signature headers / secrets (`STRIPE_*`, mock HMAC, `AUTH_SECRET`)  
- Cookies / session tokens  
- Full customer email (omit or hash later if product requires)  
- Prisma / stack traces with query payloads  

---

## Event catalog

| Event | Category | Typical `result` | Typical `reason` | Description | PR |
|---|---|---|---|---|---|
| `payment.checkout.created` | `audit` | `success` | `null` | New PENDING payment + checkout session bound | B1 |
| `payment.checkout.reused` | `audit` | `success` | `existing_pending` \| `race_detected` | Reused existing PENDING (or after unique race) | B1 |
| `payment.checkout.rejected` | `warn` | `rejected` | `invalid_transition` \| `term_required` \| `already_paid` \| `payment_waived` \| `payment_not_required` \| `request_cancelled` | Checkout refused by domain rules | B1 |
| `payment.checkout.gateway_error` | `error` | `error` | `gateway_failure` | Provider checkout failed; local row marked FAILED | B1 |
| `payment.webhook.received` | `trace` | `success` | `null` | Verified delivery entered the pipeline (high volume; retries/replay) | B2 |
| `payment.webhook.duplicate` | `audit` | `noop` | `duplicate_event` | Ledger short-circuit: already `PROCESSED` | B2 |
| `payment.webhook.stale` | `warn` | `noop` | `stale_session` | Non-current provider session; domain unchanged; ledger may still complete | B2 |
| `payment.webhook.payment_confirmed` | `audit` | `success` \| `noop` | `null` \| `already_processed` \| `crash_recovery` | Payment confirmed in domain (or soft noop / recovery) | B2 |
| `payment.webhook.payment_failed` | `audit` | `success` \| `noop` | `expired` \| `declined` \| `cancelled_by_provider` \| `already_processed` \| `stale_session` | Payment failed path applied (or noop). **One event name**; discriminate with `reason` | B2 |
| `payment.webhook.retryable` | `warn` | `rejected` | `payment_not_found` | Leave ledger `RECEIVED`; HTTP 500 so provider retries | B2 |
| `payment.webhook.acknowledged_permanent` | `audit` | `noop` | `permanent_domain_conflict` | Permanent allowlist conflict: HTTP 200 + ledger `PROCESSED`, no domain write | B2 |
| `payment.webhook.signature_rejected` | `warn` | `rejected` | `invalid_signature` | Missing/invalid signature → HTTP 401 | B2 |
| `payment.webhook.ignored_unmapped` | `audit` | `noop` | `ignored_unmapped` | Authenticated delivery with no mapped domain event; ACK | B2 |
| `payment.webhook.verify_error` | `error` | `error` | `verify_failure` | Verify failed for reasons other than signature | B2 |
| `payment.webhook.processing_error` | `error` | `error` | `processing_failure` | Unexpected failure during processing | B2 |

### Naming notes

- Prefer **domain language** (`payment_confirmed`, `payment_failed`, `acknowledged_permanent`) over internals (`applied_*`) or protocol slang (`ack` alone).  
- `payment.webhook.payment_failed` covers expired / declined / cancelled-by-provider; put the distinction in `reason`, do not multiply event names.  
- Soft no-ops under confirmed/failed may use `result: "noop"` + `reason: "already_processed"` (or omit emitter until B2 proves need — prefer one event with `noop` over extra event names).

### Jonathan / Operations Review checklist

For each `event` name ask:

> Can a new engineer understand what happened **without opening the code**?

If no → rename in this document **before** shipping emitters.

---

## Related

- [Payments runbook](../ops/payments-runbook.md)  
- [Kit pickup payments contract](../api/kit-pickup-requests.md)  
- [Architecture Baseline v1](../architecture/ARCHITECTURE-BASELINE-v1.md) (when merged)  
- [Environment](../setup/environment.md)
