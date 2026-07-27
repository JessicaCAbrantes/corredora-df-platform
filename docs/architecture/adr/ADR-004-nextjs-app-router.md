# ADR-004: Next.js App Router

## Status

Aceito — 2026-07-13

## Contexto

O frontend público precisa de SEO (Home, blog, eventos), performance mobile e integração natural com React 19. O app já está em `apps/web` com App Router.

## Problema

Qual meta-framework React usar para a superfície web da Corredora DF, alinhado a Server Components, rotas e DX do time?

## Alternativas

| Alternativa | Prós | Contras |
|---|---|---|
| **A. Next.js App Router (RSC)** | SEO; RSC; ecossistema; deploy maduro | Curva Server/Client |
| **B. Next.js Pages Router** | Mais legado no mercado | Menos alinhado ao futuro RSC |
| **C. Remix** | Loaders claros | Ecossistema/time menos familiar |
| **D. SPA Vite + React Router** | Simples | SEO e data loading manuais; pior LCP |

## Decisão

Adotar **Next.js com App Router** em `apps/web`:

1. **Server Components por padrão**; `"use client"` só para estado, efeitos e APIs de browser.
2. Rotas em `app/` **finas** (ADR-001).
3. Rotas públicas em **português** (`/corridas`, `/cupons`) por SEO local.
4. `next/image`, metadata API e streaming/Suspense quando apropriado.
5. Mutações e auth client isoladas em Client Components / futuro Server Actions (avaliar em ADR dedicado se adotar).

Versão alvo: Next.js 15+ / linha atual do monorepo (acompanhar major com PR + notes).

## Consequências

**Positivas**

- LCP e SEO favoráveis às jornadas públicas
- Menos JS no cliente nas listagens
- Um padrão claro Server vs Client (handbook)

**Negativas**

- Erros clássicos de passar funções/não-serializáveis a Client Components
- Algumas libs de UI exigem wrappers client

**Neutras**

- Admin pode compartilhar o mesmo app (`/admin`) no MVP

## Próximos passos

- [ ] Middleware de auth/session (com ADR de cookies vs Bearer)
- [ ] Política de cache/`revalidate` por rota pública
- [ ] Avaliar Server Actions para mutações autenticadas pós-MVP inicial
