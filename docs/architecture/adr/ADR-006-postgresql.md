# ADR-006: PostgreSQL

## Status

Aceito — 2026-07-13

## Contexto

Domínios relacionais fortes: users ↔ registrations ↔ events ↔ kits; coupons ↔ partners; posts ↔ comments. Documentação em `docs/database/` já aponta PostgreSQL + Prisma + Docker.

## Problema

Qual banco de dados primário garante integridade referencial, queries ad hoc para admin/analytics e operação previsível no MVP (incl. Docker local)?

## Alternativas

| Alternativa | Prós | Contras |
|---|---|---|
| **A. PostgreSQL** | Relacional maduro; JSONB; ecossistema Prisma | Ops de migração |
| **B. MySQL/MariaDB** | Familiar | Menos JSONB/ergonomia Prisma no nosso padrão |
| **C. MongoDB** | Flexível | Relações N:N e transações mais friccionadas para este domínio |
| **D. SQLite** | Zero ops local | Inadequado para staging/prod e concorrência |
| **E. Somente serverless DB (PlanetScale…)** | Managed | Constraints e vendor lock; avaliar depois, não como modelo mental |

## Decisão

Adotar **PostgreSQL** como banco primário:

1. **Prisma** como ORM e migrations em `database/` (ou `apps/api/prisma` — consolidar no scaffold).
2. **Docker Compose** para desenvolvimento local.
3. Convenções: tabelas `snake_case` plural; IDs prefixados ou UUID; `created_at` / `updated_at`; soft delete opcional via `deleted_at`.
4. Usar **JSONB** apenas onde o modelo for genuinamente flexível (preferências), não para entidades core.
5. Transações para operações multi-tabela (ex.: inscrição + side effects).

## Consequências

**Positivas**

- Integridade FKs (registration → event/user)
- Analytics SQL direto (EP-07)
- Prisma alinha tipos TS ao schema

**Negativas**

- Migrations exigem disciplina em CI
- Não é o caminho mais “serverless-first”

**Neutras**

- Read replicas / pooling (PgBouncer) são pós-MVP

## Próximos passos

- [ ] `schema.prisma` inicial (users, events, registrations, …)
- [ ] Pipeline migrate em staging/prod (ADR-010)
- [ ] Documento `docs/database/schema.md` (ER)
- [ ] Seeds de desenvolvimento
