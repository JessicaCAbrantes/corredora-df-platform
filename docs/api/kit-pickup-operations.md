# Kit Pickup Operations

Operações autorizadas de retirada/custódia/entrega (Fase 2.1).

## Status MVP

| Capacidade | Status |
|---|---|
| Allowlist `KIT_PICKUP_OPERATOR_USER_IDS` | ✅ |
| `GET /kit-pickup-requests/operations` | ✅ |
| pickup → custody → ready → handover | ✅ |
| Auditoria `*_At` / `*_By` | ✅ |
| Idempotência / 409 | ✅ |
| RBAC / dashboard / QR / OTP | Known Debt |

## Autorização

```env
KIT_PICKUP_OPERATOR_USER_IDS=usr_seed_runner
```

Após `pnpm prisma:seed`, o usuário `runner@corredora.df` é criado com id `usr_seed_runner` (em bancos novos). Em bancos já existentes, use o `id` retornado por `GET /api/v1/auth/me`.

MVP allowlist — **não** é RBAC completo.

## Estados

```text
PAID | WAIVED → PICKUP_PENDING → PICKED_UP → IN_CUSTODY → READY_FOR_HANDOVER → DELIVERED
```

`paymentStatus` permanece `PAID`/`WAIVED`; o `status` operacional avança para `PICKUP_PENDING` automaticamente após pagamento/termo sem taxa.

## Endpoints (somente Operator)

| Método | Endpoint |
|---|---|
| `GET` | `/kit-pickup-requests/operations` |
| `POST` | `/kit-pickup-requests/:id/pickup` |
| `POST` | `/kit-pickup-requests/:id/take-into-custody` |
| `POST` | `/kit-pickup-requests/:id/ready` |
| `POST` | `/kit-pickup-requests/:id/handover` |

### Handover body

```json
{ "receivedByName": "Nome", "notes": "opcional" }
```

### `OperationalRequestDto` (listagem e respostas de transição)

Campos adicionais não-breaking para o dashboard operacional:

```json
{
  "registrationId": "reg_01",
  "service": {
    "id": "kps_01",
    "title": "Retirada de kit",
    "pickupLabel": "Asa Norte · 10–12 ago"
  }
}
```

`pickupLabel` reutiliza `buildPickupLabel` da Fase 1. Para eventos `external`, `registrationId` é `null`; para `internal`, contém o id da inscrição vinculada quando disponível.

## Erros

| Código | Situação |
|---|---|
| 401 | Anônimo |
| 403 | Autenticado não-operator |
| 404 | Request inexistente |
| 409 | Transição inválida |
| 400 | `receivedByName` ausente |

## Fora do escopo

confirm-payment manual · RBAC · dashboard · QR/OTP · foto · CPF · refund · FAILED tipado · AuditLog genérico
