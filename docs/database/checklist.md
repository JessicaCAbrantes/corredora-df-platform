# Database checklist

Operational checklist for database changes and deployments (FASE 3.3-C).

## Before deployment

- [ ] `prisma migrate deploy` planned / applied on target
- [ ] Backup verified (provider snapshot or `pg_dump` — see [backup.md](./backup.md))
- [ ] `GET /health/ready` returns 200 after deploy
- [ ] Partial unique `kit_pickup_requests_active_user_service_uidx` still present (do **not** DROP)
- [ ] Partial unique `kit_pickup_payments_pending_request_uidx` still present (do **not** DROP)
- [ ] **Seed NOT executed** on production (`NODE_ENV=production` without `ALLOW_DB_SEED=true`)
- [ ] Rollback plan noted (previous migration / restore from backup)

## After deployment

- [ ] `/health/live` → 200
- [ ] `/health/ready` → 200
- [ ] Smoke: login + one authenticated read path
- [ ] Confirm no accidental seed in deploy logs
- [ ] Payments (if this deploy touches API secrets / Stripe): see [payments-runbook.md](../ops/payments-runbook.md) smoke §10

## Migration review (always)

- [ ] Diff contains only intended DDL
- [ ] No `DROP INDEX "kit_pickup_requests_active_user_service_uidx"`
- [ ] No `DROP INDEX "kit_pickup_payments_pending_request_uidx"`
- [ ] New FKs to `User` use `ON DELETE RESTRICT` unless explicitly redesigned

## Related

- [seeding.md](./seeding.md)
- [backup.md](./backup.md)
- [README.md](./README.md)
- [Payments runbook](../ops/payments-runbook.md)
