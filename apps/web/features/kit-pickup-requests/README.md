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
| `/kit-pickup-requests` | Minhas solicitações (cards enriquecidos) |
| `/kit-pickup-requests/:id` | Detalhe consolidado / termo / pagamento / timeline / handover |

`/kits` permanece **My Kits** (`GET /events/me/kits`).

## Experience MVP

- Timeline visual de acompanhamento
- Labels amigáveis (`statusLabel`, `paymentStatusLabel`)
- Internal vs external com disclaimers
- Handover visível após `DELIVERED`
- Cancelamento com confirmação e aviso de ausência de reembolso automático
- Snapshot congelado desde a criação (sem PATCH)

## Known Debt

Operação (dashboard), refund automático, RBAC, CPF/documentos, notificações, naming navbar `/kits`.
