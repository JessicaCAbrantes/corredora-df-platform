# Auth MVP — Real Auth Boundary + Pre-Production Hardening

**Status: Auth MVP hardened for single-instance pré-produção. Not a full Auth framework.**

## Scope

- Users created **only** via Prisma seed — no public `POST /auth/register`
- Password hashed with `node:crypto` scrypt (`scrypt$salt$hash`)
- Stateless session in HttpOnly cookie `corredora_session`
- HMAC-SHA256 signed payload `{ userId, exp }` using `AUTH_SECRET`
- Real Auth Boundary: `AuthBoundaryService.resolveCurrentUserId(request)` (secret via ConfigService); pure helper `resolveCurrentUserId(request, secret)` for tests
- In-memory brute-force protection on `POST /auth/login`

## Endpoints implemented

| Method | Path | Notes |
|---|---|---|
| `POST` | `/api/v1/auth/login` | Sets HttpOnly cookie; body has no token; `429` after repeated failures |
| `GET` | `/api/v1/auth/me` | Resolves cookie → user `{ id, email }` |
| `POST` | `/api/v1/auth/logout` | Clears cookie (no server-side revocation) |

## Endpoints NOT implemented (aspirational docs)

- `/auth/register`
- `/auth/refresh`
- `/auth/forgot-password`
- `/auth/reset-password`

## Dev seed credentials

| Field | Value |
|---|---|
| Email | `runner@corredora.df` |
| Password | `corredora123` |

Password is never stored in plaintext — only `password_hash` in DB.

**Local / CI only.** Production seed is fail-closed — see [`docs/database/seeding.md`](../../../../docs/database/seeding.md).

## Environment

Full env reference: [`docs/setup/environment.md`](../../../../docs/setup/environment.md).

```text
AUTH_SECRET=<long random string>   # required; boot fails if missing/blank
```

1. Copy `apps/api/.env.example` → `apps/api/.env` (gitignored).
2. Replace `AUTH_SECRET` with a long random value (never commit `.env`).
3. Generate locally: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`
4. Restart the API after changing the secret (existing cookies become invalid).

**Production rotation (hard cutover, mass re-login):** [`docs/ops/payments-runbook.md`](../../../../docs/ops/payments-runbook.md) §5.

## Login brute-force protection

| Setting | Value |
|---|---|
| Key | `IP + normalized email` |
| Limit | 5 failed attempts |
| Window | 15 minutes |
| Blocked response | `429 TOO_MANY_REQUESTS` |
| Storage | **in-memory (per process)** |

### Limitations (pré-produção only)

- Limit is **per API instance** — counters are not shared across replicas.
- Restarting the process **clears** all attempt state.
- Suitable for local / single-node pré-produção.
- Distributed rate limiting (e.g. Redis) is a **future production** requirement.

Invalid credentials still return `401 INVALID_CREDENTIALS` (same message for unknown email and wrong password). Successful login resets the counter for that key.

## Cookie

```text
Name:     corredora_session
HttpOnly: true
Path:     /
SameSite: Lax
Secure:   true in production, false in development
TTL:      7 days
```

## Real Auth Boundary

```text
HTTP request
  → resolveCurrentUserId(req)
  → User.id | null
  → EventsService.register(eventId, userId)
```

- Never accepts `userId` from body / query / route / client headers
- No fallback to `user_mock_01`
- No `X-Corredora-Dev-Anonymous` shortcut
- No DB lookup on each Registration request

## Known debt

1. Logout clears cookie only — does not revoke already-issued tokens
2. No refresh token
3. In-memory login limiter is not distributed (pré-produção limitation)
4. `EventRegistration.userId` has no FK to `User.id`
5. Historical registrations for `user_mock_01` remain in DB
6. No public register / profile / forgot-password (Logout UI is implemented on the web navbar)
7. `docs/api/auth.md` still lists aspirational endpoints beyond this MVP
