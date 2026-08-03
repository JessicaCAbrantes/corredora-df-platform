# Environment variables

Reference for all environment variables used by the Corredora DF Platform (API, Web, local Docker, and CI).

> **Scope:** FASE 2.2 inventory + secrets strategy. **FASE 3.4-B** enforces payment fail-closed at API bootstrap (`validateEnv`) — see [Payment configuration (fail-closed)](#payment-configuration-fail-closed-fase-34-b).

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
| `PAYMENT_PROVIDER` | INTERNAL | No* | `mock` | `mock` \| `stripe` (*`mock` forbidden if `NODE_ENV=production`) | Default mock; production+mock fails boot |
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
- **Database seed:** local/CI only. Production is fail-closed unless `ALLOW_DB_SEED=true` — see [`docs/database/seeding.md`](../database/seeding.md).
- `ALLOW_DB_SEED` — INTERNAL, optional, **seed script only** (not validated at Nest boot). Never set in normal production deploys.

### Payment configuration (fail-closed — FASE 3.4-B)

Validated in [`apps/api/src/config/env.validation.ts`](../../apps/api/src/config/env.validation.ts) at Nest bootstrap. Invalid combinations **throw before the app listens**.

| Rule | Result |
|---|---|
| `NODE_ENV=production` and `PAYMENT_PROVIDER=mock` (or default `mock`) | Boot fails |
| `PAYMENT_PROVIDER=stripe` without `STRIPE_SECRET_KEY` or `STRIPE_WEBHOOK_SECRET` (missing or blank) | Boot fails |
| `PAYMENT_PROVIDER=mock` with `STRIPE_SECRET_KEY` and/or `STRIPE_WEBHOOK_SECRET` set | Boot fails (ambiguous config) |
| `PAYMENT_PROVIDER=mock` in `development` / `test` | Allowed; `PAYMENT_WEBHOOK_SECRET` optional (derived from `AUTH_SECRET` if omitted) |
| `PAYMENT_PROVIDER=stripe` with both Stripe secrets | Allowed in any `NODE_ENV` |

**Environment matrix**

| Environment | `NODE_ENV` | `PAYMENT_PROVIDER` | Stripe secrets | Notes |
|---|---|---|---|---|
| Local | `development` | `mock` (default) | Must be unset | Use `.env` from API `.env.example` |
| CI Integration | `test` | `mock` | Must be unset | Fixtures in workflow YAML |
| Staging (planned) | `production` (or staging equivalent treated as prod) | `stripe` | Required | No mock |
| Production | `production` | `stripe` | Required | No mock |

Idempotency, webhook ledger, and payment ops runbooks are **out of scope** for 3.4-B (see 3.4-C / 3.4-D).

---

## Web (`apps/web`)

Validated lazily via [`apps/web/lib/env.ts`](../../apps/web/lib/env.ts) (`env.apiUrl`).  
Template: [`apps/web/.env.example`](../../apps/web/.env.example).  
Prefer `.env.local` for local overrides (Next.js convention).

| Variable | Type | Required | Default | Purpose | If missing |
|---|---|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | PUBLIC | **Yes in production** | `http://localhost:3001` in development/test | Base URL of the Nest API (no trailing slash) | Dev/test: fallback localhost; production: throws |

### Notes (Web)

- HTTP adapters use `options.baseUrl ?? env.apiUrl` (injection preserved for tests).
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
| Integration / E2E | Yes — **CI-only fixtures** (see below) |

### CI-only fixtures (Integration / E2E)

Values in the Integration job `env:` and Postgres service are **deliberately non-production**.

**Never reuse these values in staging or production.**

| Variable | Role in CI |
|---|---|
| `NODE_ENV` | `test` |
| `DATABASE_URL` | Fixture connection string (weak test credentials) |
| `AUTH_SECRET` | Fixture HMAC secret |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Fixture DB container |
| `CORS_ORIGIN` | Fixture (`http://localhost:3000`) |
| `PAYMENT_PROVIDER` | Fixture (`mock` — no Stripe in CI) |
| `PUBLIC_API_BASE_URL` / payment URLs | Fixture localhost URLs |
| `KIT_PICKUP_OPERATOR_USER_IDS` | Fixture seed user id (`usr_seed_runner`) |

`PORT` and `PAYMENT_WEBHOOK_SECRET` rely on API defaults (mock webhook secret is derived from `AUTH_SECRET` in non-production mock mode). Web `NEXT_PUBLIC_API_URL` is not required for current CI (unit tests inject `baseUrl`).

GitHub Actions **CI does not** and **must not** load production or staging secrets.

---

## Secrets strategy (approved — FASE 2.2.4 / 2.2.5)

### Categories

| Category | Where it lives | Examples |
|---|---|---|
| **CI fixtures** | Workflow YAML (Integration job) | Test `DATABASE_URL`, test `AUTH_SECRET`, mock payments, localhost URLs |
| **Public build variables** | Build env / GitHub Variables / host build settings | `NEXT_PUBLIC_API_URL` |
| **Configuration / variables** | `.env`, Variables, or runtime config (not credentials) | `CORS_ORIGIN`, `PUBLIC_API_BASE_URL`, `PAYMENT_*_URL`, `PAYMENT_PROVIDER`, `KIT_PICKUP_OPERATOR_USER_IDS` |
| **Runtime secrets** | Secret store of the deploy host (or future GitHub Environments with CD) | See table below |
| **GitHub Secrets** | Only when a CI/CD job truly needs them | **Not used by current CI** |
| **GitHub Environments** | Future — with automated CD | Not created yet |

### Runtime secrets (staging / production)

These must come from the runtime / secret store — **never** from CI fixtures or committed examples:

| Variable | Notes |
|---|---|
| `DATABASE_URL` | Strong credentials; managed DB |
| `AUTH_SECRET` | Long random; rotate independently of CI |
| `STRIPE_SECRET_KEY` | Required when `PAYMENT_PROVIDER=stripe` (production/staging) |
| `STRIPE_WEBHOOK_SECRET` | Required when `PAYMENT_PROVIDER=stripe` (production/staging) |
| `PAYMENT_WEBHOOK_SECRET` | Only for `mock` (local/CI); optional — derived from `AUTH_SECRET` if omitted. Not used with Stripe. |

### Public build variables

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_API_URL` | Embedded in the browser bundle — treat as public |

### Configuration / variables

| Variable | Notes |
|---|---|
| `CORS_ORIGIN` | Web origin allowed by the API |
| `PUBLIC_API_BASE_URL` | Public API origin (e.g. mock checkout links) |
| `PAYMENT_SUCCESS_URL` | Post-payment redirect |
| `PAYMENT_CANCEL_URL` | Cancel redirect |
| `PAYMENT_PROVIDER` | `mock` locally/CI only; production/staging must use `stripe` (enforced at API bootstrap — FASE 3.4-B) |
| `KIT_PICKUP_OPERATOR_USER_IDS` | MVP allowlist (not a credential; manage as config) |

### Rules

1. CI fixtures ≠ staging/production secrets.
2. CI must not access production secrets.
3. Never put secrets in `NEXT_PUBLIC_*`.
4. Do not commit real `.env` / `.env.local` files.
5. GitHub Environments and production GitHub Secrets wait until CD exists.

---

## Local vs CI differences

| Topic | Local (Docker Compose) | CI Integration |
|---|---|---|
| Postgres host port | **5433** | **5432** |
| `DATABASE_URL` | use `:5433` (see API `.env.example`) | `:5432` (fixture) |
| `NODE_ENV` | `development` | `test` |
| Web env | `.env.local` with `NEXT_PUBLIC_API_URL` | not set for Integration job |
| Secrets storage | developer `.env` (gitignored) | CI-only fixtures in workflow YAML |

---

## Staging / production (planned)

No staging/production env manifests live in the repo yet. When deploying:

**Required for payments (FASE 3.4-B):** `PAYMENT_PROVIDER=stripe`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`. `PAYMENT_PROVIDER=mock` will refuse to boot when `NODE_ENV=production`.

**Runtime secrets:** `DATABASE_URL`, `AUTH_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.

**Configuration:** `CORS_ORIGIN`, `PUBLIC_API_BASE_URL`, payment URLs, `PAYMENT_PROVIDER=stripe`, `KIT_PICKUP_OPERATOR_USER_IDS`, `PORT`.

**Web (build-time):** `NEXT_PUBLIC_API_URL` pointing at the public API origin.

Use the host’s secret store (or GitHub Environments once CD exists). **Do not reuse CI fixtures or `.env.example` placeholders.**

---

## Cookie / CORS / CSRF strategy (approved)

### Target topology (same-site + reverse proxy)

```text
Browser
   |
   v
https://app.example.com          (Next.js Web)
   |
   | same-site reverse proxy
   v
https://app.example.com/api/*    → NestJS API
```

Web and API should share the **same site** via reverse proxy of `/api` to the Nest process. Split-domain (`app.` + `api.`) is **not** the target architecture.

### Session cookie

| Attribute | Value |
|---|---|
| Name | `corredora_session` |
| HttpOnly | yes |
| Path | `/` |
| SameSite | `Lax` |
| Secure | `true` when `NODE_ENV=production` (HTTPS) |
| Domain | host-only (omit `Domain`) |

Do **not** use `SameSite=None` under the recommended topology. If split-domain is adopted later, cookies/CSRF must be re-reviewed.

### CORS

- Explicit single origin via `CORS_ORIGIN` (no `*`)
- `credentials: true` so the browser can send the session cookie

**CORS does not replace CSRF protection.**

### CSRF

Under same-site + `SameSite=Lax`, mutable endpoints remain `POST`/`DELETE`. No CSRF token library in this phase. Revisit if topology changes.

### Auth secret source

Runtime reads `AUTH_SECRET` only through validated Nest `ConfigService` (`AuthBoundaryService`). Do not dual-read `process.env.AUTH_SECRET` in domain code.

### Operator allowlist

`KIT_PICKUP_OPERATOR_USER_IDS` is parsed once in env validation and consumed via `ConfigService` (MVP allowlist — not RBAC).

---

## Rate limiting (current limitations)

Login brute-force protection (`LoginAttemptLimiter`):

- **In-memory**, per Node process
- Default: 5 failed attempts / 15 minutes / IP+email
- Process restart clears counters
- Multiple API instances do **not** share state — distributed limiting (e.g. Redis) is required before multi-instance production
- Behind a reverse proxy / load balancer, `request.ip` / trust-proxy must be reviewed before production

No Redis / `@nestjs/throttler` in this phase.

---

## Health probes

| Endpoint | Meaning | HTTP |
|---|---|---|
| `GET /health/live` | Process alive (no DB) | 200 |
| `GET /health/ready` | Ready for traffic (DB `SELECT 1`) | 200 ready / **503** not ready |
| `GET /health` | Legacy — always 200; body includes `database: up\|down` | 200 |

Prefer `/health/live` and `/health/ready` for orchestration.

---

## Packages

`packages/*` currently do not read environment variables.

---

## Related docs

- [`apps/api/.env.example`](../../apps/api/.env.example)
- [`apps/web/.env.example`](../../apps/web/.env.example)
- [`apps/api/src/auth/README.md`](../../apps/api/src/auth/README.md) — `AUTH_SECRET` and seed users
- [`docs/database/seeding.md`](../database/seeding.md) — seed policy / fail-closed
- [`docs/database/backup.md`](../database/backup.md) — dump / restore
- [`docs/database/checklist.md`](../database/checklist.md) — deploy DB checklist
- [`docs/api/kit-pickup-operations.md`](../api/kit-pickup-operations.md) — operator allowlist
- [`docs/api/kit-pickup-requests.md`](../api/kit-pickup-requests.md) — payment provider notes
- [`docs/engineering/08-security.md`](../engineering/08-security.md) — frontend env rules
- [`infrastructure/docker-compose.yml`](../../infrastructure/docker-compose.yml) — local Postgres
