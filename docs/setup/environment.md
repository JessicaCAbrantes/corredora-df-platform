# Environment variables

Reference for all environment variables used by the Corredora DF Platform (API, Web, local Docker, and CI).

> **Scope (FASE 2.2 — docs only):** this document describes current usage. Startup validation for the Web app and production secret management are follow-up work.

## Quick start (local)

1. Start Postgres (host port **5433**):

   ```bash
   docker compose -f infrastructure/docker-compose.yml up -d
   ```

2. API env:

   ```bash
   cp apps/api/.env.example apps/api/.env
   # Replace AUTH_SECRET with a long random value
   ```

3. Web env:

   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```

4. Align URLs:

   | Concern | Local default |
   |---|---|
   | Web app | `http://localhost:3000` |
   | API | `http://localhost:3001` |
   | Web → API | `NEXT_PUBLIC_API_URL=http://localhost:3001` |
   | API CORS | `CORS_ORIGIN=http://localhost:3000` |
   | Postgres (Docker) | `localhost:5433` |
   | Postgres (CI) | `localhost:5432` |

Never commit `.env`, `.env.local`, or real secrets. Commit only `*.env.example`.

---

## Classification

| Tag | Meaning |
|---|---|
| **PUBLIC** | Safe to expose to the browser (`NEXT_PUBLIC_*`) |
| **SECRET** | Credentials or signing material — never in client bundles or public docs with real values |
| **INTERNAL** | Server/config only; not a credential, but not for the browser |

---

## API (`apps/api`)

Validated at Nest boot by `apps/api/src/config/env.validation.ts` (`ConfigModule`).  
Template: [`apps/api/.env.example`](../../apps/api/.env.example).

| Variable | Type | Required | Default | Purpose | If missing |
|---|---|---|---|---|---|
| `PORT` | INTERNAL | No | `3001` | HTTP listen port | Listens on 3001 |
| `NODE_ENV` | INTERNAL | No | `development` | Node mode; affects cookie `Secure` in production | Treated as development |
| `DATABASE_URL` | SECRET | **Yes** | — | Prisma/Postgres connection string | Boot / Prisma fail |
| `CORS_ORIGIN` | INTERNAL | No | `http://localhost:3000` | Allowed browser origin | Default localhost web |
| `AUTH_SECRET` | SECRET | **Yes** | — | HMAC for `corredora_session` cookie | Boot fails |
| `PAYMENT_PROVIDER` | INTERNAL | No | `mock` | `mock` \| `stripe` | Uses mock gateway |
| `PUBLIC_API_BASE_URL` | INTERNAL | No | `http://localhost:${PORT}` | Public API origin (mock checkout links) | Localhost default |
| `PAYMENT_SUCCESS_URL` | INTERNAL | No | `{CORS_ORIGIN}/kit-pickup-requests/payment/success` | Post-payment redirect (success) | Derived from CORS |
| `PAYMENT_CANCEL_URL` | INTERNAL | No | `{CORS_ORIGIN}/kit-pickup-requests/payment/cancel` | Post-payment redirect (cancel) | Derived from CORS |
| `PAYMENT_WEBHOOK_SECRET` | SECRET | Conditional | Derived from `AUTH_SECRET` when `mock` | Mock webhook HMAC | Auto-derived for mock |
| `STRIPE_SECRET_KEY` | SECRET | If `stripe` | — | Stripe API secret key | Boot fails if provider is stripe |
| `STRIPE_WEBHOOK_SECRET` | SECRET | If `stripe` | — | Stripe webhook signing secret | Boot fails if provider is stripe |
| `KIT_PICKUP_OPERATOR_USER_IDS` | INTERNAL | No | empty list | Comma-separated User.id allowlist (MVP) | Operations return 403 |

### Notes (API)

- **Local Docker port:** `infrastructure/docker-compose.yml` publishes Postgres on **5433**. The API `.env.example` uses `localhost:5433`. CI uses **5432** (service container mapped 1:1).
- **`AUTH_SECRET`:** also read via `process.env` in the auth boundary (in addition to `ConfigService`). Keep a single value in `.env`.
- **`KIT_PICKUP_OPERATOR_USER_IDS`:** parsed in env validation and also read from `process.env` in the operator assert helper. Keep one comma-separated string in `.env`.
- **Stripe:** set `PAYMENT_PROVIDER=stripe` and both Stripe secrets. Do not use live keys in local/CI.
- Auth seed credentials and secret generation: [`apps/api/src/auth/README.md`](../../apps/api/src/auth/README.md).

---

## Web (`apps/web`)

No startup validation yet (`apps/web/lib/env.ts` is a stub).  
Template: [`apps/web/.env.example`](../../apps/web/.env.example).  
Prefer `.env.local` for local overrides (Next.js convention).

| Variable | Type | Required | Default | Purpose | If missing |
|---|---|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | PUBLIC | **De facto yes** for local/full-stack | `""` | Base URL of the Nest API (no trailing slash) | Client calls resolve against the Next origin and fail to reach the API |

### Notes (Web)

- Used by HTTP adapters under `apps/web/features/**` (auth, events, kit pickup, blog, partners, coupons, etc.).
- Must match the API listen URL (`PUBLIC_API_BASE_URL` / `PORT`).
- Browser-visible: never put secrets in `NEXT_PUBLIC_*`.
- Security guidance: [`docs/engineering/08-security.md`](../engineering/08-security.md).

---

## Infrastructure (Docker / CI Postgres)

These configure the Postgres **container**, not the Nest/Next apps. The apps connect only through `DATABASE_URL`.

| Variable | Type | Where | Purpose |
|---|---|---|---|
| `POSTGRES_USER` | INTERNAL | `infrastructure/docker-compose.yml`, CI service | DB user (`corredora`) |
| `POSTGRES_PASSWORD` | SECRET | same | DB password (dev/CI only: `corredora`) |
| `POSTGRES_DB` | INTERNAL | same | Database name (`corredora_df`) |

Dev/CI credentials are intentionally weak and committed for local parity. Production must use strong secrets outside the repo.

---

## CI (GitHub Actions)

Workflow: [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml).

| Job | Env set for the app? |
|---|---|
| Quality Gate | No app env (unit tests set `AUTH_SECRET` where needed) |
| Integration / E2E | Yes — see below |

Integration job (current fixtures, not GitHub Secrets):

| Variable | Example value in CI |
|---|---|
| `NODE_ENV` | `test` |
| `DATABASE_URL` | `postgresql://corredora:corredora@localhost:5432/...` |
| `AUTH_SECRET` | test fixture string |
| `CORS_ORIGIN` | `http://localhost:3000` |
| `PAYMENT_PROVIDER` | `mock` |
| `PUBLIC_API_BASE_URL` | `http://localhost:3001` |
| `PAYMENT_SUCCESS_URL` / `PAYMENT_CANCEL_URL` | localhost web payment paths |
| `KIT_PICKUP_OPERATOR_USER_IDS` | `usr_seed_runner` |

`PORT` and `PAYMENT_WEBHOOK_SECRET` rely on API defaults. Web `NEXT_PUBLIC_API_URL` is not required for current CI (no Web E2E against a live API).

---

## Local vs CI differences

| Topic | Local (Docker Compose) | CI Integration |
|---|---|---|
| Postgres host port | **5433** | **5432** |
| `DATABASE_URL` | use `:5433` (see API `.env.example`) | `:5432` |
| `NODE_ENV` | `development` | `test` |
| Web env | `.env.local` with `NEXT_PUBLIC_API_URL` | not set for Integration job |
| Secrets storage | developer `.env` (gitignored) | plaintext fixtures in workflow YAML |

---

## Staging / production (planned)

No staging/production env manifests live in the repo yet. When deploying, plan at least:

**API (secrets / config):** `DATABASE_URL`, `AUTH_SECRET`, `CORS_ORIGIN`, `PUBLIC_API_BASE_URL`, payment URLs, `PAYMENT_PROVIDER` (+ Stripe secrets or explicit mock policy), `KIT_PICKUP_OPERATOR_USER_IDS`, `PORT` / platform port binding.

**Web (build-time):** `NEXT_PUBLIC_API_URL` pointing at the public API origin.

Use the host’s secret store (e.g. GitHub Environments, Vercel/host secrets). Do not reuse CI or `.env.example` placeholder secrets.

---

## Packages

`packages/*` currently do not read environment variables.

---

## Related docs

- [`apps/api/.env.example`](../../apps/api/.env.example)
- [`apps/web/.env.example`](../../apps/web/.env.example)
- [`apps/api/src/auth/README.md`](../../apps/api/src/auth/README.md) — `AUTH_SECRET` and seed users
- [`docs/api/kit-pickup-operations.md`](../api/kit-pickup-operations.md) — operator allowlist
- [`docs/api/kit-pickup-requests.md`](../api/kit-pickup-requests.md) — payment provider notes
- [`docs/engineering/08-security.md`](../engineering/08-security.md) — frontend env rules
- [`infrastructure/docker-compose.yml`](../../infrastructure/docker-compose.yml) — local Postgres
