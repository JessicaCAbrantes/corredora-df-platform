# Community

Comunidade de corredores.

## Objetivo

Conectar corredores — posts, grupos, interações sociais e rankings.

## Permissões

Todos os endpoints requerem **autenticação**.

| Endpoint | Autenticado | Admin |
|---|---|---|
| Ver posts/grupos | ✅ | ✅ |
| Criar posts/comentários | ✅ | ✅ |
| Moderar conteúdo | — | ✅ |

## Endpoints

| Método | Endpoint | Descrição | Permissão |
|---|---|---|---|
| `GET` | `/community/posts` | Listar posts | Autenticado |
| `GET` | `/community/posts/:id` | Detalhe do post | Autenticado |
| `POST` | `/community/posts` | Criar post | Autenticado |
| `PATCH` | `/community/posts/:id` | Editar post | Autenticado (autor) |
| `DELETE` | `/community/posts/:id` | Remover post | Autenticado (autor/admin) |
| `POST` | `/community/posts/:id/like` | Curtir post | Autenticado |
| `GET` | `/community/posts/:id/comments` | Comentários | Autenticado |
| `POST` | `/community/posts/:id/comments` | Comentar | Autenticado |
| `GET` | `/community/groups` | Listar grupos | Autenticado |
| `POST` | `/community/groups/:id/join` | Entrar em grupo | Autenticado |
| `GET` | `/community/rankings` | Rankings | Autenticado |

## Estrutura das respostas

### GET /community/posts/:id

```json
{
  "data": {
    "id": "pst_01ABC",
    "author": {
      "id": "usr_01HXYZ",
      "name": "João Silva",
      "avatar": "https://..."
    },
    "content": "Primeira maratona completa! 🏃",
    "likes": 42,
    "commentsCount": 8,
    "groupId": "grp_01DEF",
    "createdAt": "2026-06-18T14:30:00Z"
  }
}
```

## Filtros

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `groupId` | string | Posts de um grupo |
| `authorId` | string | Posts de um usuário |
| `search` | string | Busca no conteúdo |

## Ordenação

| Campo | Default |
|---|---|
| `createdAt` | `desc` |
| `likes` | `desc` |

## Códigos de erro

| Código | Status | Quando |
|---|---|---|
| `POST_NOT_FOUND` | 404 | Post não existe |
| `GROUP_NOT_FOUND` | 404 | Grupo não existe |
| `ALREADY_MEMBER` | 409 | Já é membro do grupo |
| `FORBIDDEN` | 403 | Sem permissão para editar |

## Relação com o Frontend

`features/community/` — feed, grupos, rankings.
