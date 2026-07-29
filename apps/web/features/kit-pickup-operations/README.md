# kit-pickup-operations

Dashboard operacional para retirada, custódia e entrega de kits (Fase 2.1 + Dashboard MVP).

## Rota

| Rota | Papel |
|------|-------|
| `/operator/kit-pickup` | Fila operacional + painel de detalhe |

Não altera `/kits`, `/kit-pickup` nem `/kit-pickup-requests`.

## Autorização

`KIT_PICKUP_OPERATOR_USER_IDS` — allowlist MVP (não RBAC).

- 401 → login com `returnUrl=/operator/kit-pickup`
- 403 → página de acesso restrito

## API consumida

- `GET /kit-pickup-requests/operations`
- `POST /:id/pickup`
- `POST /:id/take-into-custody`
- `POST /:id/ready`
- `POST /:id/handover`

## Known Debt

RBAC · navbar operacional · busca textual · filtro multi-status · notificações · QR/OTP · participante internal enriquecido
