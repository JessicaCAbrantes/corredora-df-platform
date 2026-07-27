# profile

Feature de perfil do usuário — **Profile MVP (read-only)**.

## Escopo MVP

- Rota `/perfil`
- Fonte de dados: `GET /api/v1/auth/me` (`credentials: "include"`)
- Dados exibidos: `id`, `email`
- Anônimo → `/auth/login?returnUrl=/perfil`
- Reutiliza `SiteNavbar` / logout existentes

## Fora do escopo

Edição de perfil, `PATCH`, name/avatar/role, `/users/me`, Minhas Inscrições, AuthProvider.

## Adapter

```text
features/profile/services/http-get-current-user.ts
  → GET /api/v1/auth/me
  → { id, email }
```

`getSession()` permanece o gate de autenticação (só `{ userId }`) e não foi alterado.
