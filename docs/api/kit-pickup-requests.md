# Kit Pickup Requests

Solicitações autenticadas de serviço de retirada de kit (Fase 2).

## Status MVP (Fase 2)

| Capacidade | Status |
|---|---|
| `KitPickupRequest` (internal + external) | ✅ |
| `ParticipantSnapshot` (external only) | ✅ |
| `PickupTermAcceptance` versionado | ✅ |
| Fee snapshot (`Decimal`) | ✅ |
| Gateway (Stripe ou mock HMAC) | ✅ |
| Webhook assinado + idempotente | ✅ |
| Ownership / cancelamento participante | ✅ |
| Pickup / custody / handover | ✅ Fase 2.1 — ver `kit-pickup-operations.md` |

## Endpoints

| Método | Endpoint | Auth |
|---|---|---|
| `GET` | `/kit-pickup-requests/term` | Público (conteúdo do termo) |
| `POST` | `/kit-pickup-requests` | Sessão |
| `GET` | `/kit-pickup-requests/me` | Sessão |
| `GET` | `/kit-pickup-requests/:id` | Sessão + ownership |
| `POST` | `/kit-pickup-requests/:id/accept-term` | Sessão + ownership |
| `POST` | `/kit-pickup-requests/:id/cancel` | Sessão + ownership |
| `POST` | `/kit-pickup-requests/:id/payment` | Sessão + ownership |
| `POST` | `/payments/webhook` | Assinatura do gateway |

## Criação

### Internal

```json
{ "kitPickupServiceId": "kps_01_own_event", "registrationId": "reg_..." }
```

### External

```json
{
  "kitPickupServiceId": "kps_02_third_party",
  "participant": {
    "fullName": "Nome",
    "email": "a@b.com",
    "phone": "61999999999",
    "externalRegistrationCode": "INS-1"
  }
}
```

Campos **proibidos** do cliente: `userId`, `status`, `paymentStatus`, `feeAmountSnapshot`, `feeCurrencySnapshot`, `registrationMode`.

## Fluxo de status

```text
TERM_PENDING → (accept-term) → PAYMENT_PENDING | PICKUP_PENDING (WAIVED)
PAYMENT_PENDING → (webhook paid) → PICKUP_PENDING (paymentStatus=PAID)
PICKUP_PENDING → … → DELIVERED   (Fase 2.1 — Operators)
* → CANCELLED (participante, antes de PICKED_UP)
```

## DTO participante (Experience MVP)

`GET /kit-pickup-requests/:id` e `GET /kit-pickup-requests/me` incluem:

- `paymentStatusLabel` — rótulo amigável do pagamento
- `service.pickupLabel` — local/janela (reutiliza Fase 1)
- `timeline` — `pickedUpAt`, `custodyAt`, `readyAt`, `deliveredAt` (sem `*By`)
- `handover` — quando `DELIVERED`: `receivedByName`, `notes`, `deliveredAt`

Campos **nunca** expostos ao participante: `pickedUpBy`, `custodyBy`, `readyBy`, `deliveredBy`.

`paymentStatus = PAID` somente via webhook validado.

## Gateway

| `PAYMENT_PROVIDER` | Uso |
|---|---|
| `mock` (default local/CI) | Checkout HTML + HMAC `X-Corredora-Payment-Signature`. **Forbidden** when `NODE_ENV=production` (boot fails — FASE 3.4-B). |
| `stripe` | Stripe Checkout Session + `Stripe-Signature`. Requires `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`. |

Variáveis relacionadas (`PAYMENT_*`, `STRIPE_*`, `PUBLIC_API_BASE_URL`): [setup/environment.md](../setup/environment.md).

## Compatibilidade

- `GET /kit-pickup-services` (Fase 1) inalterado
- `/kits` = My Kits (`GET /events/me/kits`)
- Sem `EventRegistration` artificial no modo external

## Known Debt (Fase 2.1+)

confirm-payment operacional · pickup · custody · handover · delivery · RBAC · refund · QR/OTP · CPF/docs · notificações
