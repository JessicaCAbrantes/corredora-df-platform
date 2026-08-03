# FASE 3.3-D — CHECK constraints & indexes

**Status:** Deferred (conscious skip)

**Date:** 2026-08-03

## Decision

After a read-only audit of the Prisma schema, migrations, and Nest query patterns, **no additional CHECK constraints or indexes** will be added for the current MVP.

Integrity is already covered by:

- domain and audit foreign keys to `User` (3.3-A / 3.3-B)
- business uniques and enums
- intentional PostgreSQL partial unique for active kit pickup (documented in 3.3-B)
- application-level state machines and fee/price rules
- operational docs (seed fail-closed, backup, checklist — 3.3-C)

Adding DDL “only to close the phase” would create unnecessary migrations, duplicate rules between app and database, and extra maintenance risk without solving an existing problem.

## Why not now

| Candidate area | Reason to skip |
|---|---|
| CHECKs (price/fee pairs, pickup window, non-negative amounts) | No admin write APIs yet; seed + services already enforce; Prisma cannot model CHECKs natively → more intentional drift |
| Status ↔ `payment_status` CHECKs | Belong in the domain layer; valid pairs evolve with payment/ops flows |
| Indexes (`updatedAt`, `name`, `paymentStatus`, composites) | No slow-query evidence, no `EXPLAIN` pressure, catalog volumes are small |

## Triggers to re-evaluate

Reopen this topic when **any** of the following is true:

- Administrative CRUD for events / kit-pickup services / catalog writes
- Material growth in row counts or measured latency
- `EXPLAIN ANALYZE` showing sequential scans that matter in production
- Integrity incidents from direct SQL / data repair

Closest future candidates (still not scheduled): event price XOR, request fee-snapshot XOR, pickup window ordering — only with real write-path risk.

## Related

- [README.md](./README.md)
- [checklist.md](./checklist.md)
- Partial unique notes in `apps/api/prisma/schema.prisma` (`KitPickupRequest`)
