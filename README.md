# 🦋 Corredora DF Platform

Uma plataforma moderna para corredores, eventos, parceiros e comunidade.

## Stack

- Next.js
- NestJS
- PostgreSQL
- Prisma
- Docker
- Turborepo
- Tailwind CSS

## Status

🚧 Em desenvolvimento

## Setup rápido (local)

1. Instalar dependências: `pnpm install`
2. Subir Postgres (+ Prometheus opcional): `docker compose -f infrastructure/docker-compose.yml up -d` (Postgres **5433**, Prometheus **9090**)
3. Copiar envs:
   - `cp apps/api/.env.example apps/api/.env` — substituir `AUTH_SECRET`
   - `cp apps/web/.env.example apps/web/.env.local`
4. Migrar / seed (API): ver scripts em `apps/api`
5. Rodar apps via Turborepo / filtros `api` e `web`
6. (Opcional) Scrape local de `/metrics`: [docs/platform/observability-local.md](./docs/platform/observability-local.md)

## Variáveis de ambiente

Documentação completa (API, Web, Docker, CI):

**[docs/setup/environment.md](./docs/setup/environment.md)**

Templates (sem secrets reais):

| App | Template | Arquivo local (gitignored) |
|---|---|---|
| API | [`apps/api/.env.example`](./apps/api/.env.example) | `apps/api/.env` |
| Web | [`apps/web/.env.example`](./apps/web/.env.example) | `apps/web/.env.local` |

## Documentação

Índice: [`docs/README.md`](./docs/README.md)
