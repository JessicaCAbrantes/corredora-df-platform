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
local       → desenvolvimento (pnpm dev)
staging     → homologação (branch develop)
production  → produção (branch main)
```

## Fluxo de release

```text
1. Features mergeadas em develop
2. QA em staging
3. PR de develop → main
4. Tag de versão criada
5. Deploy automático para produção
6. Devlog atualizado
```

### Passo a passo

**1. Preparar release**

```bash
git checkout develop
git pull origin develop
pnpm --filter web build    # verificar build
pnpm --filter web lint     # verificar lint
```

**2. Criar PR para main**

```markdown
## Release v1.1.0

### Novidades
- Listagem de eventos
- Página de parceiros

### Correções
- Redirect após login

### Test plan
- [ ] Build passa
- [ ] Testado em staging
- [ ] Sem regressões
```

**3. Merge e tag**

```bash
git checkout main
git merge develop
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin main --tags
```

**4. Deploy**

Deploy automático via CI/CD (futuro) ou manual:

```bash
pnpm --filter web build
pnpm --filter web start
```

**5. Pós-release**

- Atualizar devlog em `docs/devlog/`
- Comunicar mudanças ao time
- Monitorar erros nas primeiras 24h

## Hotfix

Para correções urgentes em produção:

```text
1. Branch fix/* a partir de main
2. Correção + teste
3. PR direto para main
4. Tag PATCH (ex.: v1.0.1)
5. Merge de main → develop (backport)
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
git checkout main
git revert <commit-da-release>
git push origin main
# ou redeploy da tag anterior
```

## Checklist de release

- [ ] Todas as features do sprint mergeadas em develop
- [ ] Build e lint passam
- [ ] Testado em staging
- [ ] PR de release aprovado
- [ ] Tag criada
- [ ] Deploy realizado
- [ ] Devlog atualizado
- [ ] Time comunicado
