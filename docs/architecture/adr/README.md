# Architecture Decision Records (ADR)

**PB-034** · Documentação oficial das decisões arquiteturais da Plataforma Corredora DF.

## Objetivo

Registrar **por que** escolhemos cada caminho técnico — contexto, alternativas descartadas e consequências — para que qualquer engenheiro (atual ou futuro) possa evoluir o sistema sem reinventar debates.

## Localização

```text
docs/architecture/adr/
├── README.md                 ← este índice
├── ADR-000-como-utilizar-adrs.md
├── ADR-001-arquitetura-feature-first.md
├── ADR-002-monorepo-turborepo.md
├── ADR-003-butterfly-ui-design-system.md
├── ADR-004-nextjs-app-router.md
├── ADR-005-nestjs-backend.md
├── ADR-006-postgresql.md
├── ADR-007-api-rest.md
├── ADR-008-mobile-first.md
├── ADR-009-acessibilidade.md
└── ADR-010-cicd-github-actions.md
```

> Atalho histórico: [`docs/adr/`](../../adr/) redireciona para esta pasta.

## Índice

| ADR | Título | Status |
|---|---|---|
| [000](./ADR-000-como-utilizar-adrs.md) | Como utilizar ADRs | Aceito |
| [001](./ADR-001-arquitetura-feature-first.md) | Arquitetura Feature First | Aceito |
| [002](./ADR-002-monorepo-turborepo.md) | Monorepo com Turborepo | Aceito |
| [003](./ADR-003-butterfly-ui-design-system.md) | Butterfly UI Design System | Aceito |
| [004](./ADR-004-nextjs-app-router.md) | Next.js App Router | Aceito |
| [005](./ADR-005-nestjs-backend.md) | NestJS Backend | Aceito |
| [006](./ADR-006-postgresql.md) | PostgreSQL | Aceito |
| [007](./ADR-007-api-rest.md) | API REST | Aceito |
| [008](./ADR-008-mobile-first.md) | Mobile First | Aceito |
| [009](./ADR-009-acessibilidade.md) | Acessibilidade | Aceito |
| [010](./ADR-010-cicd-github-actions.md) | CI/CD GitHub Actions | Aceito |

## Template

```markdown
# ADR-NNN: Título

## Status
Proposto | Aceito | Substituído por ADR-XXX | Depreciado

## Contexto
…

## Problema
…

## Alternativas
…

## Decisão
…

## Consequências
…

## Próximos passos
…
```

## Quando criar um novo ADR

- Nova stack, framework ou serviço
- Mudança de padrão que afeta ≥2 apps/packages
- Trade-off relevante (latência vs consistência, acoplamento vs DX)
- Reversão ou substituição de ADR existente

## Relacionados

- [Architecture](../README.md)
- [Engineering Handbook](../../engineering/engineering-handbook.md)
- [API Contracts](../../api/README.md)
- [Michael Nygard — Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
