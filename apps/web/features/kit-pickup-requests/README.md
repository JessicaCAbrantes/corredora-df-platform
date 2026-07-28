# kit-pickup-requests

Solicitações autenticadas de retirada de kit (Fase 2).

## Fluxo

1. Usuário autenticado cria `KitPickupRequest` a partir de um `KitPickupService`
2. Aceita termo versionado
3. Sem taxa → `WAIVED`; com taxa → checkout no gateway → webhook → `PAID`
4. Lista/detalhe próprios; cancelamento antes da operação (Fase 2.1)

## Superfícies

| Rota | Papel |
|---|---|
| `/kit-pickup` | Catálogo + criar solicitação |
| `/kit-pickup-requests` | Minhas solicitações |
| `/kit-pickup-requests/:id` | Detalhe / termo / pagamento / cancelar |

`/kits` permanece **My Kits** (`GET /events/me/kits`).

## Known Debt

Operação (pickup/custody/handover), refund, RBAC, CPF/documentos, UI avançada.
