# Auth

Autenticação e gerenciamento de sessão.

> **Auth MVP (implementado):** ver [`apps/api/src/auth/README.md`](../../apps/api/src/auth/README.md).
>
> Implementado agora: `POST /auth/login`, `GET /auth/me`, `POST /auth/logout`, cookie HttpOnly `corredora_session`, usuários **somente via seed**.
>
> A tabela abaixo ainda lista endpoints aspiracionais. **Não** implementar `/auth/register`, `/auth/refresh`, `/auth/forgot-password`, `/auth/reset-password` apenas porque aparecem aqui.

## Objetivo

Registrar, autenticar e gerenciar sessões de usuários da plataforma.

## Permissões

Todos os endpoints de auth são **públicos** (exceto logout e me, que requerem sessão).

## Endpoints

| Método | Endpoint | Descrição | Permissão | MVP |
|---|---|---|---|---|
| `POST` | `/auth/register` | Criar conta | Público | ❌ não neste ciclo |
| `POST` | `/auth/login` | Login | Público | ✅ |
| `POST` | `/auth/logout` | Encerrar sessão | Autenticado | ✅ (limpa cookie; sem revogação server-side) |
| `POST` | `/auth/refresh` | Renovar access token | Autenticado | ❌ |
| `POST` | `/auth/forgot-password` | Solicitar reset de senha | Público | ❌ |
| `POST` | `/auth/reset-password` | Redefinir senha | Público | ❌ |
| `GET` | `/auth/me` | Dados do usuário logado | Autenticado | ✅ |

## Estrutura das respostas

### POST /auth/login (MVP)

```json
{
  "data": {
    "user": {
      "id": "clx...",
      "email": "runner@corredora.df"
    }
  }
}
```

> Sessão enviada via cookie HttpOnly `corredora_session`. **Não** há `accessToken` no body.

### GET /auth/me (MVP)

```json
{
  "data": {
    "id": "clx...",
    "email": "runner@corredora.df"
  }
}
```

## Códigos de erro

| Código | Status | Quando |
|---|---|---|
| `INVALID_CREDENTIALS` | 401 | E-mail ou senha incorretos |
| `TOO_MANY_REQUESTS` | 429 | Limite de tentativas de login (pré-produção: 5 / 15 min por IP+email, in-memory) |
| `EMAIL_ALREADY_EXISTS` | 409 | E-mail já cadastrado (fora do MVP) |
| `TOKEN_EXPIRED` | 401 | Token expirado (cookie inválido/expirado → `UNAUTHORIZED` no MVP) |
| `UNAUTHORIZED` | 401 | Cookie ausente/inválido |
| `VALIDATION_ERROR` | 400 | Campos inválidos |

## Relação com o Frontend

`features/auth/` — login UI, `getSession` via `GET /auth/me`, e logout UI via `POST /auth/logout` (`credentials: "include"`). Registration usa Real Auth Boundary no backend.

Profile MVP (`/perfil`) também consome `GET /auth/me` para exibir `{ id, email }` (read-only; sem `/users/me`).
