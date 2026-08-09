# Payments runbook (FASE 3.4-D)

Operational procedures for kit-pickup payments in Corredora DF Platform.

> **Honesty rule:** this runbook describes what the system supports **today**. It does **not** claim dual-secret rotation, zero-downtime cutovers, Redis, queues, automatic Stripe↔DB reconciliation, a manual “confirm payment” API, Grafana Cloud, Loki, Datadog, Alertmanager **paging** (Slack/Teams/e-mail/PagerDuty), or production HA. Structured **payment decision logs** (FASE 3.5-B), **correlation IDs** (FASE 3.5-C), **metrics** (FASE 3.5-D1/D2), **dashboard/alert contracts** (FASE 3.5-D3-A), optional **`GET /metrics`** (FASE 3.5-D3-B), and the **local** observability stack (Prometheus / Grafana / Alertmanager + rules — FASE 4.1, see [docs/platform/](../platform/)) **are** available — see [§10.5](#105-decision-logs-fase-35-b), [§10.6](#106-dashboards--alerts-fase-35-d3-a), [payment-metrics.md](../observability/payment-metrics.md).

## 1. Objective and limits

**In scope**

- Secret rotation with **hard cutover** (single active secret per role)
- Expected impact on sessions and webhooks
- Smoke tests after rotation
- Troubleshooting of webhook HTTP outcomes and ledger states
- Production checklists and secret-leak incident steps
- Boundaries between application ops and future infrastructure

**Out of scope**

- Implementing dual/previous secrets in code
- Redis, message queues, workers, Kafka, Outbox
- Observability **hosted / production** platforms (Grafana Cloud, paging integrations, ServiceMonitor, log shipping) — later  
  Local stack (Compose): [docs/platform/](../platform/) (Prometheus, Grafana, Alertmanager + rules)
- Docker/Kubernetes production deploy — FASE 3.6+
- Changing payment domain logic, checkout, or HTTP contract (already C1–C4)
- Routine SQL that forces `PROCESSED` / `PAID` (not a normal procedure)

**Related contracts (do not duplicate)**

- Env / fail-closed: [`docs/setup/environment.md`](../setup/environment.md)
- Webhook ledger / concurrency / HTTP matrix: [`docs/api/kit-pickup-requests.md`](../api/kit-pickup-requests.md)
- Payment decision events (canonical): [`docs/observability/payment-events.md`](../observability/payment-events.md)
- Payment metrics (canonical): [`docs/observability/payment-metrics.md`](../observability/payment-metrics.md)
- Payment dashboards (canonical D3-A): [`docs/observability/payment-dashboards.md`](../observability/payment-dashboards.md)
- Payment alerts (canonical D3-A): [`docs/observability/payment-alerts.md`](../observability/payment-alerts.md)
- Correlation: [`docs/observability/correlation.md`](../observability/correlation.md)
- DB seed / backup / checklist: [`docs/database/`](../database/)

---

## 2. Architecture (ops view)

```text
Participant  →  POST …/payment  →  Gateway (Stripe | mock*)
                                      ↓
                              Checkout Session
                                      ↓
Provider     →  POST /payments/webhook  →  verify signature
                                      ↓
                              payment_webhook_events
                              (provider, event_id)
                                      ↓
                         domain apply (conditional)
                         KitPickupPayment / KitPickupRequest
```

\* `PAYMENT_PROVIDER=mock` is **forbidden** when `NODE_ENV=production` (FASE 3.4-B).

| Concern | Mechanism today |
|---|---|
| Idempotency | Ledger `UNIQUE(provider, event_id)` + short-circuit if `PROCESSED` |
| Concurrency | Conditional `updateMany`; stale session ignored; one `PENDING` payment per request |
| Provider retries | Non-2xx → Stripe retries; permanent known failures → 200 + `PROCESSED` |
| Auth sessions | Stateless HMAC cookie with **one** `AUTH_SECRET` |

---

## 3. Environment matrix

| Environment | `NODE_ENV` | `PAYMENT_PROVIDER` | Secrets |
|---|---|---|---|
| Local | `development` | `mock` (typical) | Dev `.env`; mock webhook secret often derived from `AUTH_SECRET` |
| CI | `test` | `mock` | Workflow fixtures only — never production values |
| Staging (planned) | treat as production for payments | `stripe` | Host secret store |
| Production | `production` | `stripe` | Host secret store; mock blocked at boot |

Full inventory: [`docs/setup/environment.md`](../setup/environment.md).

---

## 4. Secrets inventory (payments + auth)

| Variable | Role | Notes |
|---|---|---|
| `AUTH_SECRET` | Cookie HMAC | Required; boot fails if blank |
| `STRIPE_SECRET_KEY` | Checkout API | Required when provider = `stripe` |
| `STRIPE_WEBHOOK_SECRET` | Webhook `constructEvent` | Required when provider = `stripe` |
| `PAYMENT_WEBHOOK_SECRET` | Mock HMAC only | Optional locally; **not** used with Stripe in production |
| `PAYMENT_PROVIDER` | `mock` \| `stripe` | Production must be `stripe` |

**Not available today:** previous-secret / dual-secret verify for auth or Stripe.

---

## 5. Rotation — `AUTH_SECRET` (hard cutover)

### Impact (must communicate)

```text
AUTH_SECRET changes
        ↓
existing HMAC cookies fail verification
        ↓
users must authenticate again
```

This is **not** a transparent operation. Plan a maintenance window or accept mass logout.

### Procedure

1. Generate a new long random secret (e.g. 48+ bytes, base64url).
2. Take a **config evidence** note: who, when, why (ticket/incident id).
3. Update the secret store / host env for the API.
4. **Restart** (or redeploy) all API instances so every process loads the new value.
5. Confirm boot succeeds (fail-closed env validation).
6. Run [§10 smoke tests](#10-smoke-test-after-rotation) — login path is mandatory.

### Local / mock coupling

If local mock omits `PAYMENT_WEBHOOK_SECRET`, the mock HMAC is derived from `AUTH_SECRET`. Rotating auth alone also invalidates mock webhook signatures until the API restarts with the new derivation (or you set an explicit mock webhook secret).

### Future (not now)

Dual-secret / grace period for cookies — **not implemented**; evolution only.

---

## 6. Rotation — `STRIPE_SECRET_KEY` (hard cutover)

### Impact

- New Checkout Sessions use the new key.
- Open sessions created with the old key may fail or become unusable independently of our DB.
- Does **not** by itself change webhook signature verification (that is `STRIPE_WEBHOOK_SECRET`).

### Procedure

1. Create/rotate the secret key in Stripe Dashboard (prefer test vs live discipline).
2. Update `STRIPE_SECRET_KEY` in the host secret store.
3. Restart/redeploy API instances.
4. Smoke: start a **new** checkout for a test request; complete payment in Stripe test mode if applicable.
5. Do not leave the app pointing at a key that Stripe already revoked.

---

## 7. Rotation — `STRIPE_WEBHOOK_SECRET` (hard cutover)

### Impact

```text
Webhook secret changes in env (or Dashboard) without alignment
        ↓
constructEvent fails
        ↓
HTTP 401 (no ledger row)
        ↓
Stripe retries until secrets match again
```

There is **one** active webhook secret in application config. No in-app overlapping secrets.

### Safe sequence (avoid deliberate inconsistency)

Prefer aligning **Dashboard endpoint signing secret** and **API env** in a short window:

1. Note current endpoint URL and secret in Stripe Dashboard.
2. Prepare the new signing secret from Stripe (endpoint “reveal” / roll per Stripe’s UI).
3. Update `STRIPE_WEBHOOK_SECRET` in the secret store **and** ensure the Dashboard endpoint uses the same signing secret the API will verify.
4. Restart/redeploy API **immediately** after env update.
5. Expect a possible short window of **401** if delivery arrives mid-cutover; Stripe retries are expected.
6. Smoke: Dashboard “Send test webhook” or complete a real test payment; confirm API returns **200** and ledger advances.

**Do not** run production for extended periods with Dashboard secret ≠ API `STRIPE_WEBHOOK_SECRET`.

---

## 8. Hard cutover summary

| Secret | Overlap in app? | Expected user/provider effect |
|---|---|---|
| `AUTH_SECRET` | No | All sessions invalid → re-login |
| `STRIPE_SECRET_KEY` | No | New checkouts only; old open sessions may break |
| `STRIPE_WEBHOOK_SECRET` | No | 401 until aligned; then retries succeed |

---

## 9. Impact on in-flight webhooks

| Ledger / HTTP state | During rotation |
|---|---|
| Bad signature → **401** | No ledger insert; provider retries |
| Already **PROCESSED** | Short-circuit **200**; safe |
| **RECEIVED** (e.g. prior 500 / `PAYMENT_NOT_FOUND`) | Remains retryable once signature works again |
| Permanent domain allowlist | **200** + **PROCESSED** without domain write (see API doc) |

---

## 10. Smoke test after rotation

Run against the target environment (staging/production as applicable):

- [ ] API boots (`NODE_ENV` + `PAYMENT_PROVIDER=stripe` + Stripe secrets present)
- [ ] `GET /health/live` → 200
- [ ] `GET /health/ready` → 200
- [ ] **Login** succeeds with a fresh session (critical after `AUTH_SECRET` rotate)
- [ ] Create / open a kit-pickup request that requires payment
- [ ] `POST …/payment` returns a Stripe checkout URL
- [ ] Complete a **test** payment (or Dashboard test webhook)
- [ ] Request shows `paymentStatus=PAID` / operational status as designed
- [ ] Ledger row exists for the delivery (`payment_webhook_events`) with `PROCESSED` when expected
- [ ] No unexpected seed ran (`ALLOW_DB_SEED` unset in normal prod)

---

## 10.5 Decision logs (FASE 3.5-B)

Canonical catalog + JSON schema: [`docs/observability/payment-events.md`](../observability/payment-events.md).

### Where to look

| What | Where |
|---|---|
| Emitter | `apps/api` — `PaymentsService` / `PaymentWebhookController` |
| Format | One JSON object per line on process **stdout** (`console.info` / `warn` / `error` / `debug` mapped from `category`) |
| Filter key | Field `event` (e.g. `payment.webhook.payment_confirmed`) |
| Correlation | Field `correlationId` — see [correlation.md](../observability/correlation.md); header `x-correlation-id` |
| Metrics (v1.0 + D2) | Process-local counters/histograms + DB-backed RECEIVED gauges — [payment-metrics.md](../observability/payment-metrics.md) |
| Dashboards / alerts (D3-A) | Contracts: [payment-dashboards.md](../observability/payment-dashboards.md), [payment-alerts.md](../observability/payment-alerts.md). **Local** Grafana + Prometheus rules + Alertmanager: [docs/platform/](../platform/) (dummy receiver only — no paging) |

There is **no** dedicated log shipper or hosted dashboard in this phase. On the host / container, search API stdout/stderr for `"event":"payment.`.

### Expected sequences

```text
Happy checkout:
  payment.checkout.created

Happy webhook (first delivery):
  payment.webhook.received
  → payment.webhook.payment_confirmed

Stripe replay of same event.id:
  payment.webhook.duplicate          (only — no "received")

Permanent domain conflict (still HTTP 200):
  payment.webhook.received
  → payment.webhook.acknowledged_permanent

Retryable PAYMENT_NOT_FOUND (HTTP 500, ledger RECEIVED):
  payment.webhook.received
  → payment.webhook.retryable

Bad signature (HTTP 401, no ledger):
  payment.webhook.signature_rejected
```

### Troubleshooting with events

| Symptom | Look for | Notes |
|---|---|---|
| Participant paid but request not PAID | `payment.webhook.payment_confirmed` missing; or `stale` / `acknowledged_permanent` | Cross-check ledger + DB (§15–§16) |
| Stripe storm / many retries | Many `duplicate` for same `providerEventId` | Healthy idempotency if HTTP 200 |
| Persistent RECEIVED | `retryable` with `code=PAYMENT_NOT_FOUND` | §13–§14 |
| 401 after rotation | `signature_rejected` | §11 — fix secret; do not force ACK |
| Checkout never opens | `checkout.rejected` or `checkout.gateway_error` | Domain rule vs provider failure |
| Suspected secret leak in logs | Any line containing `sk_`, `whsec_`, raw body | Must not happen; rotate if found (§19) |

**Do not** treat free-text application errors as the contract — prefer the structured `event` + `code` + `reason` fields.

---

## 10.6 Dashboards & alerts (FASE 3.5-D3-A)

Canonical contracts:

- Dashboards: [`docs/observability/payment-dashboards.md`](../observability/payment-dashboards.md)
- Alerts: [`docs/observability/payment-alerts.md`](../observability/payment-alerts.md)

### Honesty (today)

| Exists today? | |
|---|---|
| `GET /metrics` (optional) | **Sim** — off by default; when enabled, Bearer required |
| Prometheus / Grafana / Alertmanager **local** (FASE 4.1) | **Sim** — [observability-local.md](../platform/observability-local.md) · [grafana-local.md](../platform/grafana-local.md) · [alertmanager-local.md](../platform/alertmanager-local.md) · [alert-rules-local.md](../platform/alert-rules-local.md) |
| Dashboard `payments-ops-v1` (local) | **Sim** — as code |
| Alert rules D3-A avaliadas no Prometheus local | **Sim** — 5 rules → Alertmanager |
| Receiver de entrega | **Só** dummy `ops-local` (logs Compose) — [alertmanager-ops.md](../platform/alertmanager-ops.md) |
| Slack / Teams / e-mail / PagerDuty / paging real | **Não** |
| What D3-A shipped | Semantic **contracts** for panels and alerts |
| What D3-B shipped | Fail-closed Prometheus text export |

### How to interpret dashboards

When using local Grafana `payments-ops-v1` (or any tool that implements the contract):

1. Read the panel’s **operational question** in the dashboard contract.
2. Apply the **aggregation rules** (counters → `rate`/`increase`; histogram → quantile; DB gauges → **`max`**, never `sum` across replicas).
3. Treat anomalies as hypotheses — confirm with decision logs (`"event":"payment.`) and `correlationId`.
4. Do not treat `duplicate` volume alone as an incident.

### How to interpret alerts

```text
Dashboard panel anomaly / Prometheus rule fire
        │
        ▼
Alertmanager (local) → receiver ops-local (dummy log)
        │
        ▼
This runbook (section linked by the alert)
        │
        ▼
Troubleshooting (§11–§16)
```

Ops silence / smoke (sem paging): [alertmanager-ops.md](../platform/alertmanager-ops.md).

| Alert id | Severity | Receiver | Start here |
|---|---|---|---|
| `payment_signature_rejected_spike` | critical | `ops-local` | §11 |
| `payment_ledger_received_stuck` | warning | `ops-local` | §13 · §14 |
| `payment_retryable_elevated` | warning | `ops-local` | §12 · §14 |
| `payment_webhook_latency_high` | warning | `ops-local` | §12 |
| `payment_processing_error_spike` | critical | `ops-local` | §12 |

`duplicate` **não** tem alerta próprio e **não** é incidente por volume sozinho.

Live evaluation: local Prometheus `rule_files` (FASE 4.1-D3). Thresholds = starting points do contrato — ver [alert-rules-local.md](../platform/alert-rules-local.md).

---

## 11. Troubleshooting — webhook **401**

**Meaning:** signature missing/invalid — **security class**. No ledger row.

**Checks**

1. Correct header: Stripe → `Stripe-Signature`; mock → `X-Corredora-Payment-Signature`.
2. `STRIPE_WEBHOOK_SECRET` matches the **same** Stripe endpoint that signed the body.
3. Raw body preserved for verify (`rawBody` enabled at Nest bootstrap).
4. Recent secret rotation incomplete (Dashboard ≠ env).
5. Not using mock secrets against Stripe (or vice versa).
6. Decision log: `payment.webhook.signature_rejected` ([§10.5](#105-decision-logs-fase-35-b)).

**Do not** ACK 401 with a forced 200. Fix config; allow Stripe retry.

---

## 12. Troubleshooting — webhook **500**

**Meaning:** transient / retryable path. Ledger often left **RECEIVED** (including MVP `PAYMENT_NOT_FOUND`).

**Checks**

1. Database connectivity / migrations applied (`/health/ready`).
2. Decision logs: `payment.webhook.retryable` / `processing_error` / `verify_error` ([§10.5](#105-decision-logs-fase-35-b)); legacy strings `WEBHOOK_PROCESSING_ERROR` / `PAYMENT_NOT_FOUND` may still appear in HTTP envelopes.
3. Whether Stripe is still retrying the same `event.id`.
4. Disk/connection pool exhaustion on the host (infra — outside this runbook’s tooling).

Allow provider retries while investigating. Do not mark `PROCESSED` manually as a first step.

---

## 13. Troubleshooting — persistent **RECEIVED**

Decision tree:

```text
RECEIVED
   │
   ├── Is Stripe still retrying this event.id?
   │       └── YES → wait / monitor (preferred)
   │
   ├── Are retries failing with 401?
   │       └── investigate webhook secret / config (§11)
   │
   ├── Response / logs show PAYMENT_NOT_FOUND?
   │       └── race or missing payment row (§14); wait for retry; verify checkout created the row
   │
   ├── Retries return 500 for other reasons?
   │       └── investigate DB / application (§12)
   │
   └── Provider will never resend (exhausted / endpoint disabled)?
           └── explicit incident: evidence + backup before any manual action (§19)
```

**Not a normal procedure:** SQL `UPDATE … SET processed_at = now()` to silence retries. That can hide Stripe↔DB inconsistency.

---

## 14. `PAYMENT_NOT_FOUND`

**HTTP today:** **500**, ledger stays **RECEIVED** (FASE 3.4-C4) so the provider can retry.

Possible race:

```text
checkout created → payment row written → webhook arrives → lookup miss (rare timing / wrong env DB)
```

**Ops**

1. Confirm the payment id / session id from Stripe metadata exists in `kit_pickup_payments`.
2. Confirm webhook hits the same database the API uses for checkout.
3. Prefer waiting for automatic retry after the row is visible.
4. If the session never created a row, fix checkout/errors — do not invent PAID in SQL.

---

## 15. Stale / expired checkout

**Behavior (C3):** if `providerPaymentId` on the payment row ≠ event session id (and not a `pending_*` placeholder), domain apply is a **no-op**; ledger still **PROCESSED**.

**Ops**

1. Compare Stripe session id with `kit_pickup_payments.provider_payment_id`.
2. If the participant started a newer checkout, the old session completing/expiring should not mutate the current row.
3. Participant may need a fresh `POST …/payment` if the current session expired without PAID.

---

## 16. Stripe ↔ database divergence

**Not available:** automatic reconciliation job or “confirm payment” admin API.

**Manual inspection (read-only first)**

1. Stripe Dashboard: session / payment status for the `provider_payment_id`.
2. DB: `kit_pickup_payments` status + `kit_pickup_requests.payment_status` / `status`.
3. Ledger: `payment_webhook_events` for `(provider, event_id)` — `RECEIVED` vs `PROCESSED`.
4. Classify using the [HTTP matrix](../api/kit-pickup-requests.md) (permanent ACK vs retryable).

Escalation for true money/state mismatch: incident with evidence; restore/backup awareness ([§19](#19-backup-and-evidence-before-manual-intervention)); product follow-up if a confirm-payment tool is needed later.

---

## 17. Pre-production checklist (payments)

- [ ] `PAYMENT_PROVIDER=stripe` (not mock)
- [ ] `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` set (non-empty)
- [ ] Webhook endpoint URL points at this environment’s public API `/api/v1/payments/webhook`
- [ ] `AUTH_SECRET` strong and unique per environment
- [ ] Seed policy: production seed blocked unless emergency `ALLOW_DB_SEED` ([seeding.md](../database/seeding.md))
- [ ] Migrations applied including `payment_webhook_events` and pending-payment partial unique
- [ ] Health endpoints OK
- [ ] One successful test payment path in staging (if staging exists)

Also see [database checklist](../database/checklist.md).

---

## 18. Post-rotation checklist

- [ ] All API instances restarted on new secrets
- [ ] No prolonged Dashboard ≠ env mismatch for webhook secret
- [ ] [§10 smoke](#10-smoke-test-after-rotation) completed
- [ ] After `AUTH_SECRET`: operators/participants know re-login is required
- [ ] After Stripe webhook secret: confirm a delivery returns 200 (Dashboard resend or test payment)
- [ ] Incident/ticket updated with time window and outcome

---

## 19. Secret leak / compromise incident

1. **Treat as incident** — revoke/rotate compromised material in Stripe and auth secret store.
2. Prefer rotating **`AUTH_SECRET`**, **`STRIPE_SECRET_KEY`**, and **`STRIPE_WEBHOOK_SECRET`** as needed (assume leak scope unknown).
3. Follow hard-cutover procedures above; accept session logout and webhook 401 window.
4. Review Stripe Dashboard for unexpected sessions/charges in the exposure window.
5. Evidence: timestamps, which secrets rotated, who approved.
6. After rotation: full [§10 smoke](#10-smoke-test-after-rotation).
7. Debrief: how the secret was exposed; tighten secret store / access (infra process).

---

## 20. Backup and evidence before manual intervention

Before **any** emergency write to payment or ledger tables:

1. Confirm automatic retries and config fixes were exhausted ([§13](#13-troubleshooting--persistent-received)).
2. Take DB backup / snapshot evidence ([backup.md](../database/backup.md)).
3. Record Stripe Dashboard screenshots / event ids / payment ids.
4. Get explicit approval for the write; document before/after rows.
5. Prefer restoring from backup + replaying provider events over inventing PAID state.

Routine ops should **not** include ad-hoc `UPDATE` of payment status.

---

## 21. Application vs infrastructure

| Application (this repo / API) | Future infrastructure (not this phase) |
|---|---|
| Env validation, fail-closed mock-in-prod | Managed secret stores, CD, GitHub Environments |
| Single-secret verify, ledger, HTTP contract | Multi-instance secret distribution / dual-secret design |
| Health live/ready | Containers, orchestrators, autoscaling |
| Manual Dashboard + SQL inspection | Observability, alerting, log aggregation |
| Documented hard cutover | Blue/green with overlapping secrets |

---

## 22. Links

| Doc | Use |
|---|---|
| [environment.md](../setup/environment.md) | Env inventory, fail-closed, local/CI/prod |
| [kit-pickup-requests.md](../api/kit-pickup-requests.md) | Domain + ledger + HTTP allowlist |
| [seeding.md](../database/seeding.md) | Seed fail-closed |
| [backup.md](../database/backup.md) | `pg_dump` / restore |
| [checklist.md](../database/checklist.md) | DB deploy checklist |
| [auth README](../../apps/api/src/auth/README.md) | Cookie HMAC / `AUTH_SECRET` |
| [kit-pickup MVP validation](../testing/kit-pickup-mvp-validation.md) | Local/CI mock validation notes |
