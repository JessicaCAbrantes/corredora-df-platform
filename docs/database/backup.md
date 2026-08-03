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

## Production / managed providers

In production, prefer the **official backup mechanism of the provider** (RDS snapshots, Cloud SQL, Neon, Supabase, etc.).

- Schedule and retention follow the provider’s tooling
- Test restore periodically on a non-production clone
- Application-level `pg_dump` scripts are for local/dev and emergency ops only

## Related

- [seeding.md](./seeding.md)
- [checklist.md](./checklist.md)
- [environment.md](../setup/environment.md)
