# Database backup & restore

Operational notes for PostgreSQL used by the Corredora DF API (FASE 3.3-C).

Os exemplos abaixo destinam-se a ambientes locais. Em produção, utilize sempre o mecanismo oficial de backup do provedor (RDS, Cloud SQL, Neon, etc.).

## Local / DIY dump

Example dump (adjust URL to match `DATABASE_URL`):

```bash
pg_dump "$DATABASE_URL" --format=custom --file=backup.dump
```

Plain SQL alternative:

```bash
pg_dump "$DATABASE_URL" --format=plain --file=backup.sql
```

## Restore

Custom format:

```bash
pg_restore --clean --if-exists --no-owner --dbname="$DATABASE_URL" backup.dump
```

Plain SQL:

```bash
psql "$DATABASE_URL" -f backup.sql
```

After restore on an empty or rebuilt database, apply schema migrations if needed:

```bash
pnpm --filter api exec prisma migrate deploy
```

Do **not** run seed against restored production/staging data unless you intentionally want fixtures (see [seeding.md](./seeding.md)).

## Payments & restore (FASE 3.4)

Restoring a database dump **does not** automatically reconcile Stripe (or any payment provider) with application state.

After restore, operators should be aware of:

| Concern | Why it matters |
|---|---|
| `payment_webhook_events` | Webhook ledger (`UNIQUE(provider, event_id)`). Restore may replay already-PROCESSED ids or leave RECEIVED rows that no longer match provider retries. |
| Partial unique `kit_pickup_payments_pending_request_uidx` | At most one `PENDING` payment per request (SQL-only; do not DROP). |
| Partial unique `kit_pickup_requests_active_user_service_uidx` | One active request per (user, service). |
| User / audit FKs (`ON DELETE RESTRICT`) | Restore must keep `users` and referencing rows consistent. |
| Stripe ↔ DB | Provider Dashboard may show PAID while a restored DB shows UNPAID/PENDING (or the reverse). Prefer **provider event replay** / investigation over inventing PAID in SQL. |

Operational procedures: [payments-runbook.md](../ops/payments-runbook.md) (§16 divergence, §19 backup before manual intervention).

## Production / managed providers

In production, prefer the **official backup mechanism of the provider** (RDS snapshots, Cloud SQL, Neon, Supabase, etc.).

- Schedule and retention follow the provider’s tooling
- Test restore periodically on a non-production clone
- Application-level `pg_dump` scripts are for local/dev and emergency ops only
- After a production restore test, run a **payments smoke** (or Dashboard inspection) — restore alone is not Stripe reconciliation

## Related

- [seeding.md](./seeding.md)
- [checklist.md](./checklist.md)
- [environment.md](../setup/environment.md)
- [payments-runbook.md](../ops/payments-runbook.md)
