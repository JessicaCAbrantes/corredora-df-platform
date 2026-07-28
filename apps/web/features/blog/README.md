# blog

Feature de conteúdo editorial.

## Objetivo

Listar posts publicados para a Home via `GET /api/v1/blog/posts` (catálogo público teaser).

## Fluxo (MVP)

```text
HomePage
  ↓
getBlogPostsList(buildHomeBlogParams())
  ↓
http-get-blog-posts (público, sem credentials)
  ↓
Blog → BlogCard[]
```

Query Home: `page=1`, `perPage=3`, `published=true`, `sort=publishedAt`, `order=desc`.

## Estrutura

```text
features/blog/
├── types/
├── services/         # getBlogPostsList
└── infrastructure/   # http-get-blog-posts
```

## Fora deste MVP

- Página `/blog` e `/blog/{slug}`
- `content` / `author` / `coverImage`
- Categories API / busca / CMS / Admin CRUD
- Auth Boundary

## Boas práticas

- Sem Auth / cookie / Boundary no list público.
- Reutilizar `BlogCard` de `@corredora/ui`.
- AL008: Service → Adapter HTTP fino → API.
