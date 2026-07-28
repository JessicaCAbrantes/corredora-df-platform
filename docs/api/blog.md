# Blog

Conteúdo editorial da plataforma.

## Objetivo

Catálogo público de posts para teaser na Home (**MVP atual**).  
Página `/blog`, detalhe, CMS e Admin permanecem **fora deste ciclo**.

## Status MVP

| Capacidade | Status |
|---|---|
| `GET /blog/posts` (público) | ✅ Implementado |
| Filtro `published` + paginação + ordenação | ✅ |
| Seed determinístico | ✅ |
| Home dinâmica | ✅ |
| `/blog` e `/blog/{slug}` | Known Debt |
| `content` / `author` / `coverImage` | Known Debt |
| Categories API / busca / CMS / CRUD | Known Debt |

## Permissões

| Endpoint | Público | Autenticado | Admin |
|---|---|---|---|
| Listar posts (teaser Home) | ✅ | ✅ | ✅ |
| Detalhe / CRUD / categorias | — | — | — (fora do MVP) |

## Endpoints

| Método | Endpoint | Descrição | Permissão |
|---|---|---|---|
| `GET` | `/blog/posts` | Listar posts (catálogo público) | Público |

## GET /blog/posts

### Query

| Parâmetro | Tipo | Default | Descrição |
|---|---|---|---|
| `page` | number | `1` | Página |
| `perPage` | number | `3` | Máximo `100` |
| `published` | boolean | `true` | Filtrar publicados |
| `sort` | `publishedAt` \| `title` \| `createdAt` | `publishedAt` | Ordenação |
| `order` | `asc` \| `desc` | `desc` | Direção |

### Resposta

```json
{
  "data": [
    {
      "id": "blg_01_5k_tips",
      "title": "5 dicas para sua primeira corrida de 5K",
      "slug": "5-dicas-primeira-corrida-5k",
      "excerpt": "Preparação simples para estreantes no calendário do DF.",
      "category": "Treino",
      "readingTimeMinutes": 5,
      "publishedAt": "2026-06-10T09:00:00.000Z",
      "published": true
    }
  ],
  "meta": {
    "page": 1,
    "perPage": 3,
    "total": 3,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

**Não retorna:** `content`, `author`, `authorId`, `coverImage`.

Lista vazia: `200` com `data: []`.

### Erros

| Código | Status | Quando |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Query inválida |

## Relação com o Frontend

`features/blog/` — `http-get-blog-posts` + `getBlogPostsList` (sem credentials).  
Home: seção Blog → `BlogCard` (CTA `/blog`, cards `/blog/{slug}` — páginas Known Debt).

## Known Debt

- Página `/blog` e detalhe `/blog/{slug}`
- Campos `content`, `coverImage`, `author`
- `GET /blog/categories`, busca, comentários
- Admin CRUD / CMS
- Analytics / featured / cache / SEO avançado
