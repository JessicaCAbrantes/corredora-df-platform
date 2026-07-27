# ADR-005: NestJS Backend

## Status

Aceito — 2026-07-13

## Contexto

O frontend já consome contratos em `docs/api/`. É necessário um backend para auth, eventos, cupons, comunidade, admin e persistência. O diagrama de arquitetura prevê `apps/api`.

## Problema

Qual framework Node escolher para expor a API versionada da Corredora DF com modularidade, validação e alinhamento a um time TypeScript full-stack?

## Alternativas

| Alternativa | Prós | Contras |
|---|---|---|
| **A. NestJS** | Módulos; DI; guards; ecossistema OpenAPI; familiar a Angular-like | Verboso vs Express cru |
| **B. Express / Fastify “na mão”** | Leve | Estrutura improvisada; mais boilerplate de cross-cutting |
| **C. tRPC** | Tipagem FE↔BE excelente | Menos ideal para API pública versionada multi-cliente; acopla ao TS |
| **D. Backend em outra linguagem (Go/Java)** | Performance/isolamento | Quebra stack única TS do monorepo no MVP |

## Decisão

Adotar **NestJS** em `apps/api` como backend oficial:

1. Um **módulo Nest por domínio** espelhando recursos da API (`EventsModule`, `AuthModule`…).
2. Validação com DTO + `class-validator` (ou Zod via pipe — preferência a documentar na implementação).
3. **Guards** para JWT/roles (`public` | `authenticated` | `admin`).
4. ORM via **Prisma** (ver ADR-006).
5. Prefixo global `/api/v1` (ADR-007).
6. Contratos em `docs/api/` têm precedência até gerar OpenAPI a partir do código.

## Consequências

**Positivas**

- Boundaries claros FE feature ↔ BE module
- Guards/RBAC padronizados (admin, runner)
- Time full-stack em TypeScript

**Negativas**

- Curva Nest para quem só conhece Express
- Bootstrap mais “framework” que um script Fastify

**Neutras**

- BFF Next.js **não** substitui Nest no MVP — Next chama Nest

## Próximos passos

- [ ] Scaffold `apps/api` no monorepo
- [ ] Auth module + JWT/cookies (ADR complementar)
- [ ] Gerar OpenAPI a partir dos controllers
- [ ] Seeds para eventos/parceiros do launch
