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
| Pickup / custody / handover | Known Debt — Fase 2.1 |

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
TERM_PENDING → (accept-term) → PAYMENT_PENDING | WAIVED
PAYMENT_PENDING → (webhook paid) → PAID
* → CANCELLED
```

`paymentStatus = PAID` somente via webhook validado.

## Gateway

| `PAYMENT_PROVIDER` | Uso |
|---|---|
| `mock` (default local/CI) | Checkout HTML + HMAC `X-Corredora-Payment-Signature` |
| `stripe` | Stripe Checkout Session + `Stripe-Signature` |

## Compatibilidade

- `GET /kit-pickup-services` (Fase 1) inalterado
- `/kits` = My Kits (`GET /events/me/kits`)
- Sem `EventRegistration` artificial no modo external

## Known Debt (Fase 2.1+)

confirm-payment operacional · pickup · custody · handover · delivery · RBAC · refund · QR/OTP · CPF/docs · notificações
