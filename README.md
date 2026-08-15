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

🚧 **Em desenvolvimento — MVP acadêmico funcional**

O projeto encontra-se em desenvolvimento e, para fins da Atividade
Extensionista II, possui um MVP funcional com a jornada principal validada
em ambiente local.

O estado atual não representa uma plataforma comercial pronta para produção.

Funcionalidades adicionais, melhorias de infraestrutura, acessibilidade,
segurança e publicação externa permanecem planejadas para etapas futuras.

## Setup rápido (local)

1. Instalar dependências: `pnpm install`
2. Subir Postgres (+ Prometheus/Grafana opcional): `docker compose -f infrastructure/docker-compose.yml up -d` (Postgres **5433**, Prometheus **9090**, Grafana **3002**)
3. Copiar envs:
   - `cp apps/api/.env.example apps/api/.env` — substituir `AUTH_SECRET`
   - `cp apps/web/.env.example apps/web/.env.local`
4. Migrar / seed (API): ver scripts em `apps/api`
5. Rodar apps via Turborepo / filtros `api` e `web`
6. (Opcional) Observabilidade local: [docs/platform/observability-local.md](./docs/platform/observability-local.md) · [docs/platform/grafana-local.md](./docs/platform/grafana-local.md)

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

---

## 🔗 Links do projeto

### 💻 Repositório

[GitHub — Corredora DF](https://github.com/JessicaCAbrantes/corredora-df-platform)

Repositório contendo o código-fonte, documentação, histórico de
desenvolvimento e materiais técnicos do projeto.

### 🌐 Plataforma

**Ambiente de demonstração:** execução local durante a apresentação
acadêmica.

> A aplicação atualmente é executada em ambiente local, não estando
> publicada em ambiente de produção externo.

### 📚 Documentação acadêmica

- [Índice da documentação](./docs/README.md)
- [Roteiro da demonstração acadêmica](./docs/testing/faculdade-mvp-demo-script.md)
- [Checkpoint do MVP acadêmico](./docs/testing/faculdade-mvp-f6-checkpoint.md)

### 🧪 Documentação técnica

- [Configuração do ambiente](./docs/setup/environment.md)
- [Observabilidade local](./docs/platform/observability-local.md)
- [Grafana local](./docs/platform/grafana-local.md)

### 📝 Atividade Extensionista

A documentação relacionada à Atividade Extensionista II apresenta o contexto
da atividade, diagnóstico realizado, objetivos, metodologia, execução,
resultados e referências utilizadas.

- [Documentação da Atividade Extensionista](./docs/academic/atividade-extensionista.md)
- [Fase 1 — Diagnóstico e público](./docs/academic/fase-1-diagnostico.md)
- [Fase 2 — Ação extensionista](./docs/academic/fase-2-acao.md)
- [Fase 3 — Avaliação da ação](./docs/academic/fase-3-avaliacao.md)
- [Referências](./docs/academic/referencias.md)

> Os documentos acadêmicos complementam as informações apresentadas no
> formulário da instituição de ensino.

### 🎥 Demonstração

A demonstração acadêmica apresenta a jornada principal do MVP:

**Descobrir → Autenticar → Inscrever → Acompanhar → Sair**

O material audiovisual e/ou fotográfico utilizado como evidência da
atividade extensionista é apresentado conforme solicitado pela instituição
de ensino.

> O estado apresentado neste repositório corresponde ao **MVP acadêmico validado**
> para a Atividade Extensionista II. O sistema está em desenvolvimento e não deve
> ser interpretado como plataforma comercial pronta para produção.
