# Coupons

Cupons de desconto e benefícios.

## Objetivo

Catálogo público de cupons para teaser na Home (**MVP atual**).  
Resgate, validação e área autenticada permanecem **fora deste ciclo**.

## Status MVP

| Capacidade | Status |
|---|---|
| `GET /coupons` (público, sem `code`) | ✅ Implementado |
| Filtro `active` + paginação + ordenação | ✅ |
| Partner opcional (`partner` nested) | ✅ |
| Seed determinístico | ✅ |
| Home dinâmica | ✅ |
| `/cupons` página | Known Debt |
| Redeem / validate / `code` | Known Debt |
| Admin CRUD | Known Debt |

## Permissões

| Endpoint | Público | Autenticado | Admin |
|---|---|---|---|
| Listar cupons (teaser Home) | ✅ | ✅ | ✅ |
| Resgatar / validar / CRUD | — | — | — (fora do MVP) |

## Endpoints

| Método | Endpoint | Descrição | Permissão |
|---|---|---|---|
| `GET` | `/coupons` | Listar cupons (catálogo público) | Público |

## GET /coupons

### Query

| Parâmetro | Tipo | Default | Descrição |
|---|---|---|---|
| `page` | number | `1` | Página |
| `perPage` | number | `4` | Máximo `100` |
| `active` | boolean | `true` | Filtrar ativos |
| `sort` | `expiresAt` \| `title` \| `createdAt` | `expiresAt` | Ordenação |
| `order` | `asc` \| `desc` | `asc` | Direção |

### Resposta

```json
{
  "data": [
    {
      "id": "cpn_01_welcome",
      "title": "Cupom bem-vindo",
      "discountLabel": "10% OFF",
      "expiresAt": "2026-08-31T23:59:59.000Z",
      "active": true,
      "partner": null
    },
    {
      "id": "cpn_02_running",
      "title": "Desconto em inscrição selecionada",
      "discountLabel": "15% OFF",
      "expiresAt": "2026-12-31T23:59:59.000Z",
      "active": true,
      "partner": {
        "id": "ptr_01_nike",
        "name": "Nike Running",
        "slug": "nike-running"
      }
    }
  ],
  "meta": {
    "page": 1,
    "perPage": 4,
    "total": 2,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

**Não retorna:** `code`, `redeemedAt`, `usageCount`, `partnerId` solto.

Lista vazia: `200` com `data: []`.

### Erros

| Código | Status | Quando |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Query inválida |

## Relação com o Frontend

`features/coupons/` — `http-get-coupons` + `getCouponsList` (sem credentials).  
Home: seção Cupons → `CouponCard` (sem exibir código).

## Known Debt

- Página `/cupons` e detalhe
- `POST /coupons/:id/redeem`
- `POST /coupons/validate`
- Campo `code` e área autenticada (US-CPN-*)
- Admin CRUD
- Analytics / featured / cache
