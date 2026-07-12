# Corredora DF Platform

Monorepo da plataforma Corredora DF, usando Node.js, pnpm workspaces e Turborepo.

## Requisitos

- Node.js 24
- pnpm 11
- Git
- Docker
- Docker Compose

## Primeiros Passos

Instale as dependencias:

```bash
pnpm install
```

Execute os comandos do workspace com:

```bash
pnpm turbo <comando>
```

## Estrutura

```text
apps/
  # Aplicacoes da plataforma

packages/
  # Pacotes compartilhados
```

Os pacotes do monorepo sao configurados em `pnpm-workspace.yaml`.

## Scripts

Os scripts principais serao adicionados conforme os apps e pacotes forem criados.
