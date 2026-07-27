# home

Feature da página inicial da plataforma.

## Objetivo

Compor a Home MVP com Navbar, Hero e seções de conteúdo + Footer.

| Seção | Fonte |
|---|---|
| **Featured Events** | `GET /api/v1/events` |
| **Coupons** | `GET /api/v1/coupons` |
| **Partners** | `GET /api/v1/partners` |
| Kits Home / Blog | Mock |
| Hero | `@corredora/ui` defaults |

## Fluxo (Cupons)

```text
HomePage
  ↓
getCouponsList(buildHomeCouponsParams())
  ↓
http-get-coupons (credentials: não)
  ↓
Coupons → CouponCard[]
```

## Estrutura

```text
HomePage
├── Navbar
├── Hero
├── main#main-content
│   ├── FeaturedEvents  ← API
│   ├── Coupons         ← API
│   ├── Partners        ← API
│   ├── Kits            ← mock
│   └── Blog            ← mock
└── Footer
```

## Boas práticas

- Sem Auth / cookie / Boundary na Home (leitura pública).
- Reutilizar adapters das features — sem API Client genérico.
- `app/page.tsx` permanece fino; fetch em `HomePage`.
