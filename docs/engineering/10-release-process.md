# 10 — Release Process

Como entregamos versões da plataforma em produção.

## Versionamento

Seguimos [Semantic Versioning](https://semver.org/):

```text
MAJOR.MINOR.PATCH
  1  .  0  .  0
```

| Incremento | Quando |
|---|---|
| MAJOR | Mudança incompatível (breaking change) |
| MINOR | Nova funcionalidade compatível |
| PATCH | Correção de bug compatível |

## Ambientes

```text
local       → desenvolvimento (pnpm + Compose local — FASE 4.1)
staging     → primeiro ambiente fora do laptop (ADR-011: VPS + Compose) — a provisionar
production  → mesma família de topologia, ambiente separado — direção apenas (ADR-011)
```

Branch de integração/release no GitHub: **`master`** (não `develop`/`main`).  
**Produção não é provisionada** no marco 4.2 atual — somente direção e checklists.

## Fluxo de release

```text
1. Features mergeadas em master via PR
2. QA em staging (quando existir — ADR-011)
3. Tag de versão em master
4. Deploy para produção (manual no primeiro corte; CD depois via ADR-010)
5. Devlog atualizado
```

### Passo a passo

**1. Preparar release**

```bash
git checkout master
git pull origin master
pnpm --filter web build
pnpm --filter api build
```

**2. Criar PR / tag conforme o ritual do time**

```markdown
## Release v1.1.0

### Novidades
- …

### Test plan
- [ ] CI verde
- [ ] Testado em staging (quando existir)
- [ ] Sem regressões
```

**3. Merge e tag**

```bash
git checkout master
git pull origin master
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin master --tags
```

**4. Deploy**

No primeiro corte (ADR-011): deploy **manual** no VPS de staging conforme runbook de infraestrutura (a criar em 4.2-C+).  
Migrations: etapa explícita `prisma migrate deploy` — **não** no boot da API.  
CD automático via GitHub Actions permanece o alvo do [ADR-010](../architecture/adr/ADR-010-cicd-github-actions.md), sem mudar a topologia Compose.

**5. Pós-release**

- Atualizar devlog em `docs/devlog/`
- Comunicar mudanças ao time
- Monitorar erros nas primeiras 24h

## Hotfix

Para correções urgentes em produção:

```text
1. Branch fix/* a partir de master
2. Correção + teste
3. PR direto para master
4. Tag PATCH (ex.: v1.0.1)
5. Deploy no ambiente de produção (manual no primeiro corte)
```

## Changelog

Manter histórico de mudanças por versão. Formato:

```markdown
## [1.1.0] — 2026-07-15

### Added
- Events listing page
- Partners page

### Fixed
- Login redirect loop
```

## Rollback

Se uma release apresentar problemas críticos:

```bash
git checkout master
git revert <commit-da-release>
git push origin master
# ou redeploy da tag anterior no VPS
```

## Checklist de release

- [ ] Features do sprint mergeadas em `master`
- [ ] Build e lint passam
- [ ] Testado em staging (quando existir — ADR-011)
- [ ] PR / tag aprovados
- [ ] Tag criada
- [ ] Deploy realizado
- [ ] Devlog atualizado
- [ ] Time comunicado
