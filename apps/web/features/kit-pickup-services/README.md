# kit-pickup-services

Ofertas públicas de retirada de kit (Fase 1 — CLOSED).

## Papel

Listar serviços disponíveis via `GET /api/v1/kit-pickup-services`.

## Fluxo

```text
Home / kit-pickup catalog
  ↓
http-get-kit-pickup-services (público, sem credentials)
```

CTA: `/kit-pickup` (Fase 2 — solicitações). **Não** aponta para `/kits` (My Kits).

## Known Debt

Fase 2.1 operação · estoque · Admin
