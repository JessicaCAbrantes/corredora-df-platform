# Partners

Parceiros e patrocinadores da plataforma.

## Objetivo

Exibir parceiros do ecossistema de corrida. **MVP atual:** listagem pública para a seção Parceiros da Home.

## Status MVP

| Capacidade | Status |
|---|---|
| `GET /partners` (público) | ✅ Implementado |
| Seed determinístico | ✅ |
| Home dinâmica | ✅ |
| `GET /partners/:id` | Known Debt |
| Página `/parceiros` | Known Debt |
| Admin CRUD | Known Debt |

## Permissões

| Endpoint | Público | Autenticado | Admin |
|---|---|---|---|
| Listar parceiros | ✅ | ✅ | ✅ |
| Criar/editar/deletar | — | — | — (fora do MVP) |

## Endpoints

| Método | Endpoint | Descrição | Permissão |
|---|---|---|---|
| `GET` | `/partners` | Listar parceiros | Público |

## GET /partners

### Query

| Parâmetro | Tipo | Default | Descrição |
|---|---|---|---|
| `page` | number | `1` | Página |
| `perPage` | number | `8` | Máximo `100` |
| `active` | boolean | `true` | Filtrar por ativos |
| `sort` | `name` \| `createdAt` | `name` | Ordenação |
| `order` | `asc` \| `desc` | `asc` | Direção |

### Resposta

```json
{
  "data": [
    {
      "id": "ptr_01_nike",
      "name": "Nike Running",
      "slug": "nike-running",
      "category": "Equipamento",
      "logo": null,
      "website": "https://www.nike.com",
      "active": true
    }
  ],
  "meta": {
    "page": 1,
    "perPage": 8,
    "total": 4,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

Lista vazia: `200` com `data: []` e `total: 0` (não 404).

### Erros

| Código | Status | Quando |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Query inválida |

## Relação com o Frontend

`features/partners/` — adapter `http-get-partners` + `getPartnersList`.  
Home: `Partners` consome a listagem (sem credentials).

## Known Debt

- Página `/parceiros` e detalhe
- Admin CRUD
- `benefits` / `description`
- Cupons vinculados
- Featured / ranking / analytics
- Logo rica no `PartnerCard`
