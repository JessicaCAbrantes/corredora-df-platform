# Architecture Baseline v1 — FASE 3

**Status:** Official snapshot  
**Date:** 2026-08-04  
**Git tip at freeze:** `e8673fb` (`master` after Doc-Fix coherence merge)  
**Audience:** Tech Lead, reviewers (incl. Operations Review), future phases

This is the **photography** of the platform after FASE 3 closed. It is not a tutorial and not a substitute for ADRs or runbooks. Prefer linked sources of truth when details change; update this file only when the team deliberately re-baselines.

---

## FASE 3 BASELINE

| Area | Status | Notes |
|---|---|---|
| Architecture | ✔ | Monorepo, Nest API, Next web, feature-first ADRs; Final Architecture Review (read-only) closed with no hidden P0 |
| Security | ✔ | Helmet, Next security headers, `/health/live` + `/health/ready`, unhandled exception filter (no leak), ConfigService single-source env |
| Database | ✔ | User + audit FKs, seed fail-closed, backup/checklist docs; CHECKs/indexes deferred consciously |
| Payments | ✔ | Fail-closed provider/env, webhook ledger, concurrency + stale ignore, HTTP retry contract, payments runbook |
| Operations | ✔ | Payments runbook (hard cutover, smoke, troubleshooting); DB ops docs; **not** full observability yet |
| Documentation coherence | ✔ | Doc-Fix aligned backup/checklist/events/Known Debt/roadmap with shipped code |
| Known intentional drifts | ✔ | See below |
| Known debts | ✔ | See below |
| Future roadmap | ✔ | See below |

---

## What “done” means here

FASE 3 did **not** primarily add product features. It built an **operational foundation**:

- protect domain invariants (DB + payments concurrency)
- fail closed on unsafe config
- make webhook retries honest (401 vs 200 ACK vs 500 retry)
- document restore, seed, and payment cutover without overclaiming

The next phase (3.5) shifts from *“is the code correct?”* to *“how do we see when something went wrong?”*

---

## Architecture (freeze)

```text
apps/web  (Next.js App Router)  ──REST /api/v1──►  apps/api  (NestJS + Prisma)
                                                         │
                                                         ▼
                                                   PostgreSQL
packages/ui · types · utils · hooks · config · validations
```

- **ADRs:** [adr/](./adr/) (ADR-000 … ADR-010)  
- **API contracts:** [docs/api/](../api/)  
- **Env inventory:** [docs/setup/environment.md](../setup/environment.md)

---

## Security (freeze)

| Capability | Where |
|---|---|
| HTTP security headers (API) | Helmet / Nest security MVP |
| HTTP security headers (web) | Next headers |
| Liveness / readiness | `GET /health/live`, `GET /health/ready` |
| Unexpected errors | `UnhandledExceptionFilter` — stable envelope; minimal `console.error` name only |
| Config | `ConfigService` + fail-closed env validation |
| Auth MVP | HttpOnly HMAC session cookie; in-memory login brute-force (single instance) |

Auth details: [`apps/api/src/auth/README.md`](../../apps/api/src/auth/README.md).

---

## Database (freeze)

| Item | Status |
|---|---|
| FKs to `User` (domain + audit operators) | Done (3.3-A / 3.3-B) |
| Partial unique active kit pickup | SQL-only; intentional Prisma drift |
| Partial unique one `PENDING` payment / request | SQL-only; do not DROP |
| Seed in production | Fail-closed (`ALLOW_DB_SEED`) |
| Backup / restore docs | [backup.md](../database/backup.md) — restore ≠ Stripe reconcile |
| Deploy checklist | [checklist.md](../database/checklist.md) |
| CHECKs + extra indexes | **Deferred** — [fase-3.3-d-deferred.md](../database/fase-3.3-d-deferred.md) |

Source of truth: [docs/database/README.md](../database/README.md).

---

## Payments (freeze)

| Block | Guarantee |
|---|---|
| 3.4-B Fail-closed | No `PAYMENT_PROVIDER=mock` when `NODE_ENV=production`; Stripe secrets required for stripe |
| 3.4-C1/C2 Ledger | `payment_webhook_events` UNIQUE(`provider`, `event_id`); short-circuit if `PROCESSED` |
| 3.4-C3 Concurrency | Conditional `updateMany`; stale checkout no-op; one PENDING payment / request |
| 3.4-C4 HTTP contract | 401 signature only; permanent allowlist → 200 + `PROCESSED`; `PAYMENT_NOT_FOUND` → 500 + `RECEIVED` |
| 3.4-D Runbook | Hard cutover, smoke, troubleshooting — no dual-secret / zero-downtime claims |

Contracts: [kit-pickup-requests.md](../api/kit-pickup-requests.md) · [payments-runbook.md](../ops/payments-runbook.md).

---

## Operations (freeze)

**Available today**

- Payments secret rotation (hard cutover) and webhook troubleshooting runbook
- DB seed policy, backup/restore guidance, migration review checklist
- Health probes for orchestrators (when containers arrive)

**Not available at this baseline** (honest gap → FASE 3.5)

- Structured decision logs, correlation / request IDs
- Metrics, tracing, dashboards, alerting
- Dual-secret rotation, Redis rate-limit, queues, automatic Stripe↔DB reconciliation

---

## Known intentional drifts

| Drift | Why it is intentional |
|---|---|
| Partial unique indexes only in PostgreSQL (not in Prisma schema) | Prisma cannot model partial uniques; app + SQL + docs own the contract |
| 3.3-D CHECKs / extra indexes skipped | No admin write APIs / no measured query pressure; avoid DDL for ceremony |
| Auth brute-force in-memory | Pré-produção single-instance; Redis is future |
| Soft idempotency on payment status + hard ledger idempotency | Defense in depth; ledger is primary for `event.id` |
| `PAYMENT_NOT_FOUND` still retryable (500 + `RECEIVED`) | Create↔webhook race possible; not auto-ACK in this phase |
| Runbook honesty rule | Docs describe only what ships; no dual-secret / APM theater |

---

## Known debts (open)

Grouped; not a commitment to order.

### Payments / kit pickup

- Operational confirm-payment API
- Refunds
- Automatic Stripe↔DB reconciliation
- QR / OTP handover
- CPF / document capture
- Notifications

### Auth / security (production scale)

- Distributed rate limiting
- Server-side session revocation / refresh
- Public register / password reset flows (product-dependent)

### Product / API surfaces (examples)

- Blog pages / CMS depth, coupons redeem, partners detail/CRUD
- Full operator RBAC / dashboard
- Kit fields (`shirtSize`, pickup window on My Kits, etc.)

### Platform

- Observability stack (FASE 3.5)
- Containers (3.6), Deploy / CD (3.7 / 3.8)

---

## Future roadmap (from this baseline)

| Phase | Focus |
|---|---|
| **3.5** | Observability, Reliability & Operations — **see first**, then measure/alert |
| 3.5-A | Observability & Reliability Audit (read-only) — done as ritual input |
| 3.5-B | Payment Decision Logs (audit → small PR; **no domain change**) |
| 3.5-C | Correlation / request IDs |
| 3.5-D | Security signals (401 webhook, invalid cookie, forbidden ops, …) |
| 3.5-E | Operational metrics hooks (exporter later) |
| 3.5-F+ | Dashboards, alerting, ops runbooks (beyond payments) |
| **3.6** | Containers |
| **3.7 / 3.8** | Deploy / CD |

**Out of 3.5 by default:** Redis, Kafka, dual-secret, full Stripe reconciliation, confirm-payment, K8s, complex APM — unless Tech Lead re-scopes.

---

## How to use this baseline

1. **Before large changes** — re-read intentional drifts and debts; do not “fix” drifts without a decision.  
2. **In reviews** — ask whether a PR moves the freeze or only implements an approved next slice.  
3. **Operations Review (Jonathan)** — especially useful from 3.5 onward: “would this help at 03:00 without leaking secrets?”  
4. **Re-baseline** — create `ARCHITECTURE-BASELINE-v2.md` after a major phase close; keep v1 immutable for history.

---

## Related

- [Architecture README](./README.md)  
- [Database README](../database/README.md)  
- [Payments runbook](../ops/payments-runbook.md)  
- [Environment](../setup/environment.md)
