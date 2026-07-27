# Blog

Conteúdo editorial da plataforma.

## Objetivo

Publicar artigos, dicas de treino, notícias do mundo da corrida e conteúdo da plataforma.

## Permissões

| Endpoint | Público | Autenticado | Admin |
|---|---|---|---|
| Listar/ler posts | ✅ | ✅ | ✅ |
| Criar/editar/deletar | — | — | ✅ |

## Endpoints

| Método | Endpoint | Descrição | Permissão |
|---|---|---|---|
| `GET` | `/blog/posts` | Listar artigos | Público |
| `GET` | `/blog/posts/:slug` | Artigo por slug | Público |
| `GET` | `/blog/categories` | Listar categorias | Público |
| `POST` | `/blog/posts` | Criar artigo | Admin |
| `PATCH` | `/blog/posts/:id` | Atualizar artigo | Admin |
| `DELETE` | `/blog/posts/:id` | Remover artigo | Admin |

## Estrutura das respostas

### GET /blog/posts/:slug

```json
{
  "data": {
    "id": "blg_01ABC",
    "title": "5 dicas para sua primeira maratona",
    "slug": "5-dicas-primeira-maratona",
    "excerpt": "Preparação física e mental...",
    "content": "# 5 dicas...",
    "coverImage": "https://...",
    "category": "training",
    "author": {
      "id": "usr_admin",
      "name": "Equipe Corredora DF"
    },
    "publishedAt": "2026-06-10T09:00:00Z",
    "readingTime": 5
  }
}
```

## Filtros

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `search` | string | Busca por título |
| `category` | string | `training`, `nutrition`, `events`, `gear` |
| `authorId` | string | Filtrar por autor |

## Ordenação

| Campo | Default |
|---|---|
| `publishedAt` | `desc` |
| `title` | `asc` |

## Códigos de erro

| Código | Status | Quando |
|---|---|---|
| `POST_NOT_FOUND` | 404 | Artigo não existe |

## Relação com o Frontend

`features/blog/` — listagem, artigo, categorias. SEO via metadata no App Router.
