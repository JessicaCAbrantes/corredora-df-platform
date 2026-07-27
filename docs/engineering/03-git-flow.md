# 03 — Git Flow

Como versionamos e entregamos código.

## Branches

```text
main          → produção (protegida)
develop       → integração contínua
feat/*        → novas funcionalidades
fix/*         → correções
chore/*       → tarefas de manutenção
docs/*        → documentação
```

### Nomenclatura

```text
feat/events-listing
fix/login-redirect
chore/update-dependencies
docs/engineering-manual
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

1. Criar branch a partir de `develop`.
2. Implementar a mudança.
3. Abrir PR com título no formato Conventional Commits.
4. Preencher descrição: **o que**, **por que**, **como testar**.
5. Aguardar review (mínimo 1 aprovação).
6. Merge via squash em `develop`.

### Template de PR

```markdown
## Summary
- Breve descrição da mudança

## Test plan
- [ ] Build passa (`pnpm --filter web build`)
- [ ] Testado localmente em http://localhost:3000
- [ ] Sem regressões visuais
```

## Fluxo de release

```text
feat/* → develop → main (release)
```

Releases de `develop` para `main` seguem o processo descrito em `10-release-process.md`.

## Devlog

Registramos o progresso do projeto em `docs/devlog/`. Ao concluir um sprint, adicionar entrada com:

- O que foi feito
- Decisões tomadas
- Dificuldades
- Próximos passos
