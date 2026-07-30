# 08 — Security

Práticas de segurança para o frontend e integração com a API.

## Princípios

1. **Nunca confiar no cliente** — validação real acontece no backend (NestJS).
2. **Dados sensíveis nunca no frontend** — tokens, senhas, chaves de API ficam no servidor.
3. **Defesa em profundidade** — múltiplas camadas de proteção.

## Autenticação

```tsx
// ✅ Token em httpOnly cookie (gerenciado pelo backend)
// O frontend nunca acessa o token diretamente

// ❌ Nunca fazer
localStorage.setItem("token", jwt);
document.cookie = `token=${jwt}`; // sem httpOnly
```

- Sessão gerenciada via cookies `httpOnly` + `secure` (em production) + `sameSite=lax`.
- Topologia alvo: same-site + reverse proxy `/api` — ver [setup/environment.md](../setup/environment.md).
- Redirect para `/login` em respostas 401.

## Variáveis de ambiente

Inventário completo (API + Web + CI + Docker): [docs/setup/environment.md](../setup/environment.md).

```text
# apps/web/.env.local (NUNCA commitar) — ver apps/web/.env.example
NEXT_PUBLIC_API_URL=http://localhost:3001   # ✅ único env público do Web hoje
```

Secrets da API (`AUTH_SECRET`, `DATABASE_URL`, Stripe, webhook) vivem em `apps/api/.env` — **nunca** com prefixo `NEXT_PUBLIC_`.

| Prefixo | Acesso | Exemplo no projeto |
|---|---|---|
| `NEXT_PUBLIC_` | Cliente e servidor | `NEXT_PUBLIC_API_URL` |
| Sem prefixo | Apenas servidor (API Nest) | `AUTH_SECRET`, `DATABASE_URL` |

- `.env` e `.env.local` estão no `.gitignore`.
- Templates commitáveis: `apps/api/.env.example`, `apps/web/.env.example`.
## Input e XSS

```tsx
// ✅ React escapa automaticamente
<p>{userInput}</p>

// ❌ NUNCA usar sem sanitização
<div dangerouslySetInnerHTML={{ __html: userContent }} />
```

- Validar inputs no frontend (UX) e no backend (segurança).
- Usar bibliotecas de validação (Zod) quando implementarmos formulários.

## Chamadas à API

```tsx
// services/api-client.ts
const apiClient = {
  get: (path: string) =>
    fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
      credentials: "include", // cookies httpOnly
      headers: { "Content-Type": "application/json" },
    }),
};
```

- Sempre usar `services/` — nunca `fetch` direto em componentes.
- Não expor endpoints internos no frontend.
- Tratar erros sem vazar detalhes técnicos ao usuário.

## Dependências

- Rodar `pnpm audit` periodicamente.
- Aprovar builds explicitamente (`allowBuilds` no `pnpm-workspace.yaml`).
- Não instalar pacotes sem necessidade — cada dependência é uma superfície de ataque.

## Headers de segurança (Web)

Configurados em `apps/web/next.config.ts` (sem CSP complexa; sem HSTS — HSTS fica no proxy/edge):

```text
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
X-Frame-Options: DENY
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

API Nest aplica `helmet` com CSP desabilitada (compatível com mock checkout HTML). Detalhes de cookie/CORS/CSRF: [setup/environment.md](../setup/environment.md).

## Checklist

- [ ] Nenhum segredo em código ou commit
- [ ] `.env.example` atualizado
- [ ] Inputs validados
- [ ] Sem `dangerouslySetInnerHTML`
- [ ] Cookies com flags de segurança
- [ ] Dependências auditadas
