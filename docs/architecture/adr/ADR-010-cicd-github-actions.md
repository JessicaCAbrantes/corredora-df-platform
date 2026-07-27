# ADR-010: CI/CD GitHub Actions

## Status

Aceito — 2026-07-13

## Contexto

O código vive no GitHub; o monorepo usa pnpm + Turborepo (ADR-002). O roadmap prevê testes (Sprint 13), deploy (Sprint 14) e release MVP (Sprint 15). Precisamos de automação reproduzível sem acoplar a um único PaaS no nível de decisão.

## Problema

Como automatizar lint, typecheck, build, testes e deploy de preview/staging/production de forma integrada ao fluxo de PRs do time?

## Alternativas

| Alternativa | Prós | Contras |
|---|---|---|
| **A. GitHub Actions** | Nativo ao GitHub; marketplace; grátis generoso p/ OSS/pequenos times | YAML a manter |
| **B. GitLab CI** | Pipelines fortes | Repo não está no GitLab |
| **C. CircleCI / Jenkins** | Poderoso | Outro vendor; ops extras |
| **D. Só scripts locais** | Zero setup | Sem gate de qualidade; regressões sobem |

## Decisão

Adotar **GitHub Actions** como plataforma oficial de CI/CD:

### CI (em todo PR para `develop` / `main`)

1. Checkout + pnpm + Turbo
2. `lint` + `typecheck`/`build` filtrado pelo que mudou
3. Unit/integration tests quando existirem
4. E2E Playwright smoke nas jornadas críticas (quando configurado; pode ser job nightly no início)

### CD (progressivo)

1. **Preview** de `apps/web` em PRs (Vercel/Netlify/Cloudflare — escolha de hosting em ADR/implementação posterior; Actions orquestra)
2. **Staging** no merge em `develop` (web + api + `prisma migrate`)
3. **Production** em `main` / tag release semântica (Sprint 14–15), com aprovação manual se necessário

### Princípios

- Secrets só em GitHub Environments
- Sem credenciais no repo
- Artefatos de build cacheados (Turbo / Actions cache)
- Release notes alinhadas a Conventional Commits
- Processo documentado em [10-release-process.md](../../engineering/10-release-process.md)

## Consequências

**Positivas**

- Gate automático antes do merge
- Paridade local vs CI via pnpm/turbo
- Trilha clara até o MVP em produção

**Negativas**

- Minutes de CI a monitorar
- Workflows quebram se node/pnpm drifts — pin de versões obrigatório

**Neutras**

- Provider de hosting (Vercel vs container) é decisões operacional satélite; Actions permanece o orquestrador

## Próximos passos

- [ ] Workflow `ci.yml` (lint, build web, ui)
- [ ] Workflow `e2e.yml` (Playwright) ligado às stories Must
- [ ] Environments `staging` / `production` com secrets
- [ ] Migrações Prisma no job de deploy API
- [ ] Status checks obrigatórios na branch `develop`
