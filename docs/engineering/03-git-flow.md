# 03 — Git Flow

Como versionamos e entregamos código.

> **Honesty (ADR-011 Aceito):** o repositório GitHub usa **`master`** como branch de integração e release. Não introduzimos `develop` / `main` só porque docs antigos mencionavam esse modelo.

## Branches

```text
master            → integração + linha de release (protegida)
feature/*         → novas funcionalidades de produto
platform/*        → plataforma / infra (docs e compose)
hardening/*       → endurecimento
fix/*             → correções
docs/*            → documentação
chore/*           → manutenção
```

### Nomenclatura

```text
feat/events-listing
feature/kit-pickup-mvp
platform/observability-prometheus-local-4.1-b
hardening/payments-fail-closed
fix/login-redirect
docs/engineering-manual
chore/update-dependencies
```

## Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```text
tipo(escopo): descrição curta
```

### Tipos

| Tipo | Uso |
|---|---|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `chore` | Manutenção, configs, deps |
| `docs` | Documentação |
| `refactor` | Refatoração sem mudança de comportamento |
| `test` | Testes |
| `style` | Formatação (sem mudança lógica) |

### Exemplos

```text
feat(web): add events listing page
fix(auth): handle expired token redirect
chore(init): project foundation
docs(engineering): add folder structure guide
refactor(events): extract EventCard to feature components
```

### Regras

- Mensagem em inglês, imperativo, até 72 caracteres no título.
- Um commit = uma mudança lógica.
- Não commitar `.env`, credenciais ou `node_modules/`.

## Pull Requests

1. Criar branch a partir de **`master`**.
2. Implementar a mudança (após auditoria/escopo quando for capacidade arquitetural).
3. Abrir PR com título no formato Conventional Commits.
4. Preencher descrição: **o que**, **por que**, **como testar**.
5. Aguardar review (mínimo 1 aprovação).
6. Merge em **`master`** (respeitar branch protection — não contornar).
7. Sync local: `git checkout master && git pull` e remover a branch de feature.

### Template de PR

```markdown
## Summary
- Breve descrição da mudança

## Test plan
- [ ] Build / checks relevantes passam
- [ ] Testado localmente quando aplicável
- [ ] Sem regressões
```

## Fluxo

```text
feature|platform|hardening|…  →  PR  →  master  →  sync / checkpoint
```

Release / tag: ver [10-release-process.md](./10-release-process.md).  
Topologia de staging/prod: [ADR-011](../architecture/adr/ADR-011-deployment-topology.md) (**Aceito**).

## Ritual arquitetural

```text
auditoria → escopo → aprovação → implementação → review → merge → sync → checkpoint
```

Pedido no Slack **não** é autorização automática de implementação.  
Não reabrir fases/contratos congelados sem decisão explícita.

## Devlog

Registramos o progresso do projeto em `docs/devlog/`. Ao concluir um sprint, adicionar entrada com:

- O que foi feito
- Decisões tomadas
- Dificuldades
- Próximos passos
