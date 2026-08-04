# Architecture

Documentação arquitetural da Plataforma Corredora DF.

## Objetivo

Descrever a arquitetura de alto nível do sistema — camadas, boundaries, fluxos de dados e integrações entre frontend, backend e infraestrutura.

## Escopo

| Área | Documentação relacionada |
|---|---|
| **FASE 3 freeze (baseline)** | [ARCHITECTURE-BASELINE-v1.md](./ARCHITECTURE-BASELINE-v1.md) |
| Estrutura de pastas | [engineering/01-folder-structure.md](../engineering/01-folder-structure.md) |
| Padrão de componentes | [engineering/04-component-pattern.md](../engineering/04-component-pattern.md) |
| Contratos de API | [api/README.md](../api/README.md) |
| Decisões formais (ADR) | [adr/](./adr/) |
| Design system | [design-system/](../design-system/) |
| EventDetailsPage | [event-details-page.md](./event-details-page.md) · produto: [product/event-details-page.md](../product/event-details-page.md) |

## Visão geral

```text
┌─────────────────────────────────────────────────┐
│                   apps/web                       │
│         Next.js 15 · App Router · React 19      │
│    features/ · components/ · services/ · lib/   │
└──────────────────────┬──────────────────────────┘
                       │ REST /api/v1
┌──────────────────────▼──────────────────────────┐
│                   apps/api                       │
│              NestJS · Prisma · PostgreSQL         │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│              PostgreSQL · Docker                 │
└─────────────────────────────────────────────────┘

        packages/ui ──► Butterfly UI (design system)
        packages/types, utils, hooks, config, validations
```

## Princípios

- **Clean Architecture** — camadas com responsabilidade única
- **Feature-Based Design** — domínios auto-contidos no frontend ([ADR-001](./adr/ADR-001-arquitetura-feature-first.md))
- **API-first REST** — contratos antes da implementação ([ADR-007](./adr/ADR-007-api-rest.md))
- **Monorepo** — código compartilhado via `packages/` ([ADR-002](./adr/ADR-002-monorepo-turborepo.md))

## Architecture Decision Records

Base oficial: **[adr/](./adr/)** (PB-034) — ADR-000 a ADR-010.
