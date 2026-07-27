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

- Sessão gerenciada via cookies `httpOnly` + `secure` + `sameSite`.
- Refresh token rotacionado pelo backend.
- Redirect para `/login` em respostas 401.

## Variáveis de ambiente

```text
# .env.local (NUNCA commitar)
NEXT_PUBLIC_API_URL=http://localhost:3001   # ✅ prefixo NEXT_PUBLIC_ para cliente
API_SECRET=abc123                            # ✅ sem prefixo = apenas servidor
```

| Prefixo | Acesso | Exemplo |
|---|---|---|
| `NEXT_PUBLIC_` | Cliente e servidor | URL da API pública |
| Sem prefixo | Apenas servidor | Chaves secretas, tokens de serviço |

- `.env` e `.env.local` estão no `.gitignore`.
- Criar `.env.example` com variáveis necessárias (sem valores reais).

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

## Headers de segurança (futuro)

Configurar no `next.config.ts` quando necessário:

```text
Content-Security-Policy
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

## Checklist

- [ ] Nenhum segredo em código ou commit
- [ ] `.env.example` atualizado
- [ ] Inputs validados
- [ ] Sem `dangerouslySetInnerHTML`
- [ ] Cookies com flags de segurança
- [ ] Dependências auditadas
