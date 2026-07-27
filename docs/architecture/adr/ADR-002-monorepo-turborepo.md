# ADR-002: Monorepo com Turborepo

## Status

Aceito — 2026-07-13

## Contexto

A plataforma terá ao menos `apps/web`, `apps/api`, `packages/ui` e documentação compartilhada. Time pequeno-médio no MVP; necessidade de builds cacheados e workflow único.

Stack já iniciada: **pnpm workspaces + Turborepo**.

## Problema

Como versionar e construir múltiplos aplicativos e pacotes com DX alta, cache de CI e uma única fonte de verdade — sem fragmentar o ecossistema Corredora DF em vários repositórios prematuramente?

## Alternativas

| Alternativa | Prós | Contras |
|---|---|---|
| **A. Multirepo (web / api / ui separados)** | ACL por repo | Sync de contratos dolorosa; PRs cross-repo |
| **B. Monorepo pnpm + Turborepo** | Atomic PRs; cache; packages locais | Repo maior; precisar de tooling |
| **C. Monorepo Nx** | Muito poderoso | Curva e opinião mais pesadas que o necessário agora |
| **D. Monorepo sem orchestrator** | Simples | CI lento; falta pipeline graph |

## Decisão

Adotar **monorepo** gerenciado com:

- **pnpm** workspaces (`pnpm-workspace.yaml`)
- **Turborepo** para pipelines (`build`, `lint`, `test`, `dev`) com cache
- Layout: `apps/*`, `packages/*`, `docs/`, `database/`, `tests/`

Convenções:

1. Filtros: `pnpm --filter web …`, `pnpm --filter @corredora/ui …`
2. Dependências de package via `workspace:`
3. Builds seletivos no CI (só o que mudou, via Turbo)

## Consequências

**Positivas**

- Mudança de contrato API + consumer no mesmo PR
- Butterfly UI versionado junto ao app
- Cache Turbo reduz tempo de CI

**Negativas**

- Clone e tooling mais complexos que um app solo
- Necessário cuidar de `allowBuilds` (pnpm 11) e boundaries

**Neutras**

- `apps/admin` pode nascer depois no mesmo monorepo sem novo repo

## Próximos passos

- [ ] Pipeline Turbo no GitHub Actions (ADR-010)
- [ ] Remote cache Turbo (opcional, pós-MVP)
- [ ] Documentar `package.json` name/filter de cada workspace no handbook
