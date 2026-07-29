# Web — Corredora DF

Next.js app (`apps/web`) for the Corredora DF Platform.

## Getting started

From the monorepo root (after API Postgres + env setup):

```bash
pnpm --filter web dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

```bash
cp apps/web/.env.example apps/web/.env.local
```

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Nest API origin (no trailing slash), e.g. `http://localhost:3001` |

Full inventory (API + Web + Docker + CI): [docs/setup/environment.md](../../docs/setup/environment.md).
