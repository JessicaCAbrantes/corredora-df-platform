# coupons

Feature de cupons e benefícios.

## Objetivo

Listar cupons ativos para a Home via `GET /api/v1/coupons` (catálogo público teaser, **sem código**).

## Fluxo (MVP)

```text
HomePage
  ↓
getCouponsList(buildHomeCouponsParams())
  ↓
http-get-coupons (público, sem credentials)
  ↓
Coupons → CouponCard[]
```

Query Home: `page=1`, `perPage=4`, `active=true`, `sort=expiresAt`, `order=asc`.

## Estrutura

```text
features/coupons/
├── types/
├── services/         # getCouponsList
└── infrastructure/   # http-get-coupons
```

## Fora deste MVP

- Página `/cupons`
- Redeem / validate
- Exposição de `code`
- Admin CRUD
- Auth Boundary

## Boas práticas

- Sem Auth / cookie / Boundary no list público.
- Reutilizar `CouponCard` de `@corredora/ui`.
- AL008: Service → Adapter HTTP fino → API.
