# partners

Feature de parceiros e patrocinadores.

## Objetivo

Listar parceiros ativos para a Home via `GET /api/v1/partners`.

## Fluxo (MVP)

```text
HomePage
  ↓
getPartnersList(buildHomePartnersParams())
  ↓
http-get-partners (público, sem credentials)
  ↓
Partners → PartnerCard[]
```

Query Home: `page=1`, `perPage=8`, `active=true`, `sort=name`, `order=asc`.

## Estrutura

```text
features/partners/
├── types/            # contratos Application
├── services/         # getPartnersList
└── infrastructure/   # http-get-partners
```

## Fora deste MVP

- Página `/parceiros`
- Detalhe do parceiro
- Admin CRUD
- Cupons / benefits

## Boas práticas

- Sem Auth / cookie / Boundary.
- Reutilizar `PartnerCard` de `@corredora/ui` (sem alterar o UI kit).
- AL008: Service → Adapter HTTP fino → API.
