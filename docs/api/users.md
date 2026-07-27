# Users

Gerenciamento de perfis de usuários.

> **Nota — My Registrations / Kits MVP:** o histórico read-only de inscrições está em **`GET /events/me/registrations`**; a retirada read-only de kits está em **`GET /events/me/kits`** (domínio Events).  
> Os endpoints `/users/me` e `/users/me/events` abaixo permanecem **aspiracionais / futuros** — não implementados neste ciclo.  
> **Não** implementar `/users/me/registrations` nem `/users/me/kits`.

## Objetivo

CRUD de dados pessoais, preferências e histórico do corredor.

## Permissões

| Endpoint | Público | Autenticado | Admin |
|---|---|---|---|
| Ver perfil próprio | — | ✅ | — |
| Editar perfil próprio | — | ✅ | — |
| Listar usuários | — | — | ✅ |
| Ver perfil de outro | — | — | ✅ |
| Editar/deletar usuário | — | — | ✅ |

## Endpoints

| Método | Endpoint | Descrição | Permissão |
|---|---|---|---|
| `GET` | `/users/me` | Perfil do usuário logado | Autenticado |
| `PATCH` | `/users/me` | Atualizar perfil | Autenticado |
| `GET` | `/users/me/events` | Eventos inscritos | Autenticado |
| `GET` | `/users` | Listar usuários | Admin |
| `GET` | `/users/:id` | Detalhe de usuário | Admin |
| `PATCH` | `/users/:id` | Atualizar usuário | Admin |
| `DELETE` | `/users/:id` | Desativar usuário | Admin |

## Estrutura das respostas

### GET /users/me

```json
{
  "data": {
    "id": "usr_01HXYZ",
    "name": "João Silva",
    "email": "joao@email.com",
    "phone": "+5561999999999",
    "avatar": "https://...",
    "bio": "Corredor amador",
    "role": "runner",
    "createdAt": "2026-01-15T10:00:00Z"
  }
}
```

## Filtros (admin)

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `search` | string | Busca por nome ou e-mail |
| `role` | string | Filtrar por papel (`runner`, `admin`) |
| `status` | string | `active`, `inactive` |

## Ordenação

| Campo | Default |
|---|---|
| `createdAt` | `desc` |
| `name` | `asc` |

## Códigos de erro

| Código | Status | Quando |
|---|---|---|
| `USER_NOT_FOUND` | 404 | Usuário não existe |
| `FORBIDDEN` | 403 | Sem permissão |
| `VALIDATION_ERROR` | 400 | Dados inválidos |

## Relação com o Frontend

`features/profile/` — perfil, edição, histórico de eventos.
