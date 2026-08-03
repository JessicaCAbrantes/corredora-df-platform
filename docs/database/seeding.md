# Database seeding

Policy for `apps/api/prisma/seed.ts` (FASE 3.3-C).

## Seed Policy

| Environment | Seed allowed? | Notes |
|---|---|---|
| **Development** | Yes | Default local workflow |
| **CI** (`NODE_ENV=test`) | Yes | Required for E2E fixtures |
| **Staging** | Normally no | Only with explicit override |
| **Production** | **Blocked** | Override only in exceptional situations |

## Fail-closed rule

```text
NODE_ENV != "production"  →  seed permitted
NODE_ENV == "production"  →  requires ALLOW_DB_SEED=true
```

Without the override, `pnpm prisma:seed` / `prisma db seed` exits with an error:

```text
Database seed is disabled in production.

If you really need to execute it, set:

  ALLOW_DB_SEED=true

and rerun the command.

This operation may overwrite development fixtures.
```

`ALLOW_DB_SEED` is read only by the seed script (not required for Nest boot / `env.validation`).

## What the seed does

Deterministic fixtures for local + CI (idempotent `upsert`):

- Users: `usr_seed_runner`, `usr_seed_participant_2` (password documented in auth README — **dev/CI only**)
- Events, kits, partners, coupons, blog posts, kit pickup services

**Do not** run against production data. Fixtures (IDs, emails, passwords) are intentionally stable so CI/E2E keep working.

## Commands

```bash
# local / CI
pnpm --filter api prisma:seed

# exceptional production override (dangerous)
ALLOW_DB_SEED=true NODE_ENV=production pnpm --filter api prisma:seed
```

## Related

- [backup.md](./backup.md)
- [checklist.md](./checklist.md)
- [environment.md](../setup/environment.md)
- [auth README](../../apps/api/src/auth/README.md)
