# Kit Pickup MVP – Validation Report

**Date:** 2026-07-29  
**Branch:** `feat/kit-pickup-mvp`  
**Scope:** Kit Pickup participant flows, operations, payments, security, and robustness

---

## Environment

| Component | Details |
|-----------|---------|
| API | NestJS on `http://localhost:3001` |
| Database | PostgreSQL 16 (Docker), host port `5433` |
| ORM | Prisma (`migrate deploy` + `db seed`) |
| Payment provider | Mock (`PAYMENT_PROVIDER=mock`) |
| Operator allowlist | `KIT_PICKUP_OPERATOR_USER_IDS=usr_seed_runner` |
| Seed users | `usr_seed_runner`, `usr_seed_participant_2` |

---

## Functional Validation

### Internal flow ✅

`TERM_PENDING` → accept-term → `PICKUP_PENDING` / `WAIVED` → pickup → custody → ready → handover → `DELIVERED`

Validated with service `kps_01_own_event` and internal registration.

### External flow ✅

`TERM_PENDING` → accept-term → `PAYMENT_PENDING` / `PENDING` → mock checkout → webhook → `PICKUP_PENDING` / `PAID` → operations → `DELIVERED`

Validated with service `kps_02_third_party` (R$ 10.00 fee).

---

## Security

| Scenario | Endpoint | Expected | Result |
|----------|----------|----------|--------|
| Anonymous | `GET /operations` | 401 `UNAUTHORIZED` | ✅ |
| Non-operator (`usr_seed_participant_2`) | `GET /operations` | 403 `FORBIDDEN` | ✅ |
| Operator (`usr_seed_runner`) | `GET /operations` | 200 | ✅ |
| Ownership isolation | `GET /:id` (other user's request) | 404 `NOT_FOUND` | ✅ |
| Participant physical ops | `POST /:id/pickup` | 403 `FORBIDDEN` | ✅ |

Participant DTO does not expose operator `*By` fields.

---

## State Machine

### Valid transitions ✅

`PICKUP_PENDING` → `PICKED_UP` → `IN_CUSTODY` → `READY_FOR_HANDOVER` → `DELIVERED`

### Invalid transitions (409 `INVALID_STATUS`) ✅

Examples: custody before pickup, ready before custody, handover before ready, pickup after delivered.

State and timestamps preserved after each 409.

### Same-state idempotency (200 OK) ✅

**Architectural decision (documented):** repeating the same operation in the current state returns **200** with the existing resource unchanged — not 409. This applies consistently to:

- `accept-term` (already accepted)
- `pickup` (already `PICKED_UP`)
- `take-into-custody` (already `IN_CUSTODY`)
- `ready` (already `READY_FOR_HANDOVER`)
- `handover` (already `DELIVERED`)

Wrong-order transitions return **409 `INVALID_STATUS`**.

This pattern matches robust API design: retries and duplicate clicks do not fail unnecessarily while invalid state jumps are rejected.

---

## Payments

| Scenario | Result |
|----------|--------|
| Start payment (`POST /payment`) | 200 + `checkoutUrl` |
| Mock checkout → webhook | `PICKUP_PENDING` / `PAID` |
| Duplicate webhook | 200 idempotent via ledger `(provider, event_id)`; no domain re-apply |
| Repeat `POST /payment` after PAID | 409 `INVALID_STATUS` |
| Payment records | Single row per request, no duplicates |

---

## Domain & DTO Validation

| Case | Code |
|------|------|
| Internal without `registrationId` | `REGISTRATION_REQUIRED` |
| Internal with `participant` | `PARTICIPANT_NOT_ALLOWED` |
| External without `participant` | `PARTICIPANT_REQUIRED` |
| External with `registrationId` | `REGISTRATION_NOT_ALLOWED` |
| Blank `externalRegistrationCode` | `EXTERNAL_CODE_REQUIRED` |
| Invalid email / empty code | `VALIDATION_ERROR` |

Domain errors (400 with business codes) are distinct from DTO validation errors (`VALIDATION_ERROR`).

---

## Automated Tests

**Command:** `cd apps/api && pnpm test:e2e`

| Suite | Focus |
|-------|-------|
| `auth.e2e-spec.ts` | Login, anonymous 401 |
| `kit-pickup-requests.e2e-spec.ts` | Internal/external paths, ownership, negative creation |
| `kit-pickup-operations.e2e-spec.ts` | Auth matrix, state machine, idempotency |
| `payments.e2e-spec.ts` | Webhook, duplicate webhook, repeat payment |

```
Test Suites: 4 passed
Tests:       15 passed
```

**Prerequisites:** running PostgreSQL, `pnpm prisma:seed`, `.env` with mock payment config.

---

## Manual E2E Validation

Manual smoke covered the full participant and operator journeys before automation:

- Flow A (Internal, no fee): create → term → operations → `DELIVERED`
- Flow B (External, paid): create → term → payment → mock checkout → webhook → operations → `DELIVERED`
- Security: anonymous 401, participant 403 on operations, ownership 404
- Idempotency: `accept-term` repeat, operational repeats, webhook duplicate
- State machine: 409 out-of-order, 200 same-state repeats

---

## Risks & Known Limitations

| Item | Notes |
|------|-------|
| Seed user IDs | `upsert` by email does not fix ID mismatch on existing DBs; use `prisma migrate reset` when introducing deterministic IDs |
| E2E DB dependency | Integration tests require live Postgres + seed (not in-memory) |
| Operator RBAC | MVP allowlist via env var, not full RBAC |
| Mock payment only | Stripe path not covered by this validation |
| Web redirect | Post-payment `successUrl` targets `localhost:3000` (web app optional for API validation) |

---

## Final Result

**Ready for merge** — functional flows, security boundaries, state machine behavior, payment idempotency, and domain contracts validated manually and automated.
