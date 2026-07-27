# Scripts

Scripts de automação do monorepo.

## Objetivo

Centralizar scripts utilitários para desenvolvimento, build, deploy e manutenção — executados via `pnpm` ou diretamente.

## Uso previsto

```text
scripts/
├── setup.sh          → setup inicial do ambiente
├── seed.sh           → popular banco com dados de dev
├── generate.sh       → gerar código (types, clients)
└── clean.sh          → limpar caches e artifacts
```

## Convenções

- Scripts em shell (`.sh`) ou Node (`.mjs`) conforme complexidade
- Documentar cada script com comentário no topo do arquivo
- Scripts cross-platform quando possível
- Nunca commitar scripts com credenciais hardcoded

## Relação com Turborepo

Scripts de build e dev são orquestrados pelo Turborepo (`turbo.json`). Esta pasta é para scripts auxiliares que não pertencem ao pipeline principal.

## Estado atual

Pasta preparada. Scripts serão adicionados conforme necessidade.
