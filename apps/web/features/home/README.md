# home

Feature da página inicial da plataforma.

## Objetivo

Compor a Home MVP com Navbar, Hero e seções de conteúdo + Footer.

| Seção | Fonte |
|---|---|
| **Featured Events** | `GET /api/v1/events` |
| **Coupons** | `GET /api/v1/coupons` |
| **Partners** | `GET /api/v1/partners` |
| **Kit Pickup Services** | `GET /api/v1/kit-pickup-services` |
| **Blog** | `GET /api/v1/blog/posts` |
| Hero | `@corredora/ui` defaults |

## Fluxo (Kit Pickup)

```text
HomePage
  ↓
getKitPickupServicesList(buildHomeKitPickupParams())
  ↓
http-get-kit-pickup-services
  ↓
Kits → KitCard[]
```

CTA da seção: `/kit-pickup` (Fase 2 — solicitações). Rota `/kits` permanece My Kits autenticado.

## Boas práticas

- Sem Auth / cookie / Boundary na Home (leitura pública).
- Reutilizar adapters das features — sem API Client genérico.
- `app/page.tsx` permanece fino; fetch em `HomePage`.
