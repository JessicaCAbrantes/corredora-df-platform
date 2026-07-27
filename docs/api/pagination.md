# Pagination

Estratégia de paginação para endpoints que retornam coleções.

## Objetivo

Padronizar como listas são paginadas, evitando que Frontend e Backend implementem estratégias diferentes.

## Estratégia: offset-based (page + perPage)

Escolhida por simplicidade e compatibilidade com a maioria dos ORMs (Prisma).

### Query parameters

| Parâmetro | Tipo | Default | Descrição |
|---|---|---|---|
| `page` | number | `1` | Página atual (1-indexed) |
| `perPage` | number | `20` | Itens por página (max: 100) |

### Exemplo de request

```text
GET /api/v1/events?page=2&perPage=10
```

### Meta na resposta

```json
{
  "data": [ ... ],
  "meta": {
    "page": 2,
    "perPage": 10,
    "total": 42,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": true
  }
}
```

### Estrutura tipada

```text
PaginationMeta
├── page: number
├── perPage: number
├── total: number
├── totalPages: number
├── hasNextPage: boolean
└── hasPreviousPage: boolean
```

## Regras

- `perPage` máximo: **100** (retorna `400` se exceder).
- `page` mínimo: **1** (retorna `400` se menor).
- Coleções vazias retornam `data: []` com `total: 0`, não `404`.
- Paginação é opcional — sem `page`/`perPage`, retorna default (page=1, perPage=20).

## Endpoints paginados

| Recurso | Endpoint |
|---|---|
| Eventos | `GET /events` |
| Parceiros | `GET /partners` |
| Cupons | `GET /coupons` |
| Kits | `GET /kits` |
| Comunidade (posts) | `GET /community/posts` |
| Blog | `GET /blog/posts` |
| Notificações | `GET /notifications` |
| Anúncios | `GET /ads` |
| Usuários (admin) | `GET /users` |

## Evolução futura

Cursor-based pagination pode ser adicionada para feeds em tempo real (comunidade, notificações) sem quebrar o contrato — novo parâmetro `cursor` opcional.

## Relação com o Frontend

```tsx
// Uso em features/events/services/
const response = await apiClient.get("/events", { page: 1, perPage: 20 });
const { data, meta } = response;
```

Componente `Pagination` em `components/shared/` consumirá `meta`.

## Filtros

### Query parameters

Filtros são passados como query parameters com prefixo do campo:

```text
GET /api/v1/events?status=active&category=marathon&city=brasilia
```

| Regra | Detalhe |
|---|---|
| Formato | `campo=valor` |
| Múltiplos valores | `campo=valor1&campo=valor2` ou `campo=valor1,valor2` |
| Busca textual | `search=maratona` (busca em campos indexados) |
| Intervalo de datas | `dateFrom=2026-01-01&dateTo=2026-12-31` |
| Combinação | Filtros são AND (todos devem ser satisfeitos) |

### Filtros por recurso

Definidos em cada documento de recurso (ex: `events.md` → `status`, `category`, `city`).

## Ordenação

### Query parameters

```text
GET /api/v1/events?sort=date&order=asc
```

| Parâmetro | Tipo | Default | Descrição |
|---|---|---|---|
| `sort` | string | `createdAt` | Campo para ordenar |
| `order` | `asc` \| `desc` | `desc` | Direção |

### Regras

- Campos ordenáveis definidos por recurso (whitelist).
- Campo inválido retorna `400 VALIDATION_ERROR`.
- Ordenação combinada com paginação e filtros.

### Defaults por recurso

| Recurso | Default `sort` | Default `order` | Fonte |
|---|---|---|---|
| **Padrão global** (quando o recurso não especifica) | `createdAt` | `desc` | esta página |
| **`GET /events`** | `date` | `asc` | [events.md](./events.md) |

O default global **não** se aplica a Events. Para listagem de eventos, usar sempre o contrato em `events.md`.

