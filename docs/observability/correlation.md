# Correlation IDs (FASE 3.5-C)

**Status:** Implemented  
**Depends on:** [Payment Events Contract v1.1](./payment-events.md) (`correlationId` field)

## Goal

Tie all structured payment decision logs (and future signals) from the **same HTTP request** to one opaque id, without changing payment domain or HTTP contracts.

## Lifecycle

```text
Inbound HTTP request
  → correlation middleware
       ├─ read valid `x-correlation-id` header, OR
       └─ generate UUID
  → AsyncLocalStorage store (request-scoped)
  → response echoes `x-correlation-id`
  → payment decision logs read `correlationId` from ALS
```

## Propagation rules

| Layer | Responsibility |
|---|---|
| Middleware | Create / accept id; store in ALS; echo header |
| HTTP controllers | May read `getCorrelationId()` and pass an opaque string into services |
| `PaymentsService` / domain | Receives optional `correlationId?: string` only — **no** ALS / Express / headers |
| Decision log helper | Reads ALS (or explicit input) when emitting JSON |
| Gateways | Forward opaque string into provider metadata |

## Header

| Name | Direction |
|---|---|
| `x-correlation-id` | Request (optional) · Response (always set) |

## What is not correlation

- `requestId` on payment logs = **kit pickup request id** (domain), not HTTP request id  
- Stripe `event.id` = `providerEventId`  
- No OpenTelemetry / distributed tracing in this phase  

## Out of scope (later)

Metrics, dashboards, alerting, OTel traces, W3C `traceparent`.

## Related

- Runtime: `apps/api/src/observability/correlation-context.ts`, `correlation-middleware.ts`  
- Emit: `apps/api/src/payments/payment-decision-log.ts`  
- Ops: [payments-runbook §10.5](../ops/payments-runbook.md#105-decision-logs-fase-35-b)
