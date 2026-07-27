# auth

Feature de autenticação e sessão (Auth Frontend MVP + Logout UI).

## Escopo

- Página `/auth/login`
- `POST /api/v1/auth/login` com `credentials: "include"`
- `GET /api/v1/auth/me` → `getSession()` → `{ userId } | null`
- `POST /api/v1/auth/logout` → `logout()` / botão **Sair** na navbar
- Cookie HttpOnly gerenciado pelo browser (nunca lido via JS)
- Profile MVP (`/perfil`) consome o mesmo `/auth/me` para `{ id, email }` (feature `profile`)

## Logout

```text
Sair → POST /api/v1/auth/logout (credentials: include) → 204
  → redirect fixo para /
```

- Logout é **stateless**: limpa o cookie no browser; não há revogação server-side no MVP.
- Sem AuthProvider / Context / storage de token.

## Fora do escopo

Cadastro público, refresh token, OAuth, AuthProvider/Context, perfil, forgot-password, localStorage de token.

## Credenciais de desenvolvimento

Usuário seedado no backend (ver `apps/api/src/auth/README.md`).
