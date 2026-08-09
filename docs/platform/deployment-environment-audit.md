# FASE 4.2-A — Deployment & Environment Architecture Audit

**Status:** Audit (somente leitura) — aguardando decisão estratégica  
**Pergunta-guia:** *O que ainda impede evoluir de uma plataforma local coerente para uma arquitetura realmente pronta para entrega/uso?*  
**Fora de escopo deste documento:** Dockerfile, CD, cloud, código de app, reabrir FASE 3 / 4.1

Base: `master` @ `3bd1984` (FASE 4.1 encerrada).  
Aplicação FASE 3 e observabilidade local FASE 4.1 permanecem **congeladas**.

---

## 1. Honesty (hoje)

| Frente | Estado real |
|---|---|
| Execução fora do PC do desenvolvedor | **Não** — só `pnpm` local + Compose local |
| Staging / Production vivos | **Não** |
| Dockerfile API / Web | **Não** |
| CD (deploy automático) | **Não** |
| CI (quality + e2e API) | **Sim** — `.github/workflows/ci.yml` |
| Branch default | **`master`** (não `main` / `develop`) |
| Observabilidade local | **Sim** — FASE 4.1 completa |
| Secrets de staging/prod no Git | **Não** (correto) |
| GitHub Environments | **Não** criados |

---

## 2. Inventário

### 2.1 ADRs relevantes

| ADR | Tema | Implicação para deploy |
|---|---|---|
| ADR-002 | Monorepo Turborepo/pnpm | Build/filter por app; CD deve orquestrar `api` + `web` |
| ADR-004 | Next.js App Router | Web apta a PaaS Node/Edge ou container |
| ADR-005 | NestJS backend | API Node long-running; precisa processo + DB |
| ADR-006 | PostgreSQL | Persistência obrigatória; migrate no deploy |
| **ADR-010** | **CI/CD GitHub Actions** | **Aceito** — Actions = orquestrador; hosting = decisão satélite |

**ADR-010 — pretendido vs feito**

| Item ADR-010 | Pretendido | Real |
|---|---|---|
| CI lint/typecheck/tests em PR | Sim | **Parcial** — lint/typecheck/test API + lint/test Web; **sem** `next build` / `nest build` no workflow |
| E2E Playwright | Futuro | **Não** — e2e é Nest (`test:e2e`) com Postgres service |
| Preview web em PR | Sim | **Não** |
| Staging no merge `develop` | Sim | **Não** — nem branch `develop` no remoto padrão |
| Production em `main`/tag | Sim | **Não** — default branch é `master` |
| Environments + secrets | Sim | **Não** |
| Prisma migrate no deploy API | Sim | Só no **job CI** de integração (não é deploy) |

### 2.2 Apps

| App | Stack | Scripts | Empacotamento |
|---|---|---|---|
| `apps/api` | NestJS + Prisma | `build` / `start` / `start:prod` | Sem Dockerfile |
| `apps/web` | Next.js 15 | `build` / `start` | Sem Dockerfile |
| `packages/*` | ui, types, utils, … | via workspace | — |

### 2.3 Infrastructure

| Artefato | Papel |
|---|---|
| `infrastructure/docker-compose.yml` | **Local:** Postgres `:5433` + Prometheus + Grafana + Alertmanager + dummy webhook |
| `infrastructure/observability/**` | Config local (FASE 4.1) |
| Dockerfile(s) de aplicação | **Ausentes** |

Compose **não** sobe API nem Web. API roda no host.

### 2.4 CI atual

Workflow único: `.github/workflows/ci.yml`

| Job | Faz | Não faz |
|---|---|---|
| Quality Gate | install, prisma generate, lint/typecheck/test API, lint/test Web | build de produção, publish |
| Integration / E2E | Postgres service, migrate, seed, `api` e2e | deploy, Stripe real, web e2e |

Triggers: `pull_request` + `push` em `master`.  
Permissions: `contents: read`. Sem secrets de staging/prod (correto).

### 2.5 Ambientes (documentados vs reais)

| Ambiente | Documentação | Realidade |
|---|---|---|
| Local | `environment.md`, Compose, `.env.example` | **Existe** |
| CI | fixtures no workflow | **Existe** (éphémero) |
| Staging | “planned”; URL exemplo em `docs/api/README.md` | **Não existe** |
| Production | checklists / fail-closed payments | **Não existe** |

Docs de fluxo (`03-git-flow.md`, `10-release-process.md`) assumem `develop` → `main`. O repositório opera **`feature/*` → `master`**.

### 2.6 Secrets / segurança operacional

| Área | Estado |
|---|---|
| Estratégia documentada | **Sim** — `docs/setup/environment.md` |
| Fail-closed payments + metrics bearer | **Sim** (app) |
| `/metrics` default off + Bearer | **Sim** |
| TLS / ingress | **Não** (só localhost) |
| Secret store hospedado | **Não** |
| Token métricas local | gitignored example — **não** reutilizar fora do laptop |

### 2.7 Dependências externas (runtime)

| Dependência | Local | Entrega futura |
|---|---|---|
| PostgreSQL | Compose | Obrigatória |
| Stripe | mock local/CI; stripe em prod planejado | Conta + webhooks públicos |
| DNS / HTTPS | — | Necessário para webhooks Stripe e cookies Secure |
| Observabilidade | Compose local | Separar de “observabilidade de entrega” (fora 4.1) |

### 2.8 Observabilidade (já concluída — não reabrir)

Cadeia local FASE 4.1 intacta. **Não** é a lacuna bloqueante para entrega.

---

## 3. Cinco frentes — respostas

### Deploy — *Como API + Web chegam a um ambiente executável fora do PC?*

**Hoje:** não chegam. Só desenvolvimento local.  
**Documentado:** ADR-010 deixa hosting como “decisão satélite” (Vercel/Netlify/CF para web preview; staging/prod sem provider escolhido). Roadmap Sprint 14: “CI/CD, staging, production, Docker”.

### Ambientes — *Dev → Staging → Prod coerente?*

**Hoje:** Local + CI. Staging/Prod **planejados** na matriz de payments/env, **não materializados**.  
**Divergência:** git-flow docs (`develop`/`main`) ≠ prática (`master`).

### CI/CD — *Construir, testar e publicar artefatos?*

| Capacidade | Hoje |
|---|---|
| Testar / lint | **Sim** |
| Build de produção no CI | **Não** (não há step `build`) |
| Publicar artefato (image/tarball) | **Não** |
| Deploy | **Não** |

### Infraestrutura — *Onde vivem API, Web, Postgres, obs?*

**Hoje:** tudo no laptop do developer (API/Web host; Postgres+obs em Docker).  
**Não há** topologia de staging/prod.

### Segurança operacional — *Secrets, TLS, acesso, /metrics?*

App e docs locais estão maduros para **fail-closed**. Falta posicionar secrets em store de host, TLS terminado, e política de `/metrics` **fora** do laptop (não reutilizar token local).

---

## 4. Estado pretendido (só o que o repo já congela)

```text
GitHub (Actions = orquestrador — ADR-010)
        │
        ├─ CI em PR (lint/test/build…)
        ├─ Preview web (provider TBD)
        ├─ Staging ← develop (docs) / TBD
        └─ Production ← main/tag (docs) / TBD
              web + api + prisma migrate
              secrets em GitHub Environments / host store
```

Hosting concreto **não** está escolhido no ADR (explícito).

---

## 5. Divergências (doc ↔ realidade)

| Tema | Doc diz | Repo faz |
|---|---|---|
| Branch de integração | `develop` | Trabalha em `master` |
| Branch de produção | `main` | `master` |
| CD staging/prod | ADR-010 / release process | Inexistente |
| Docker app | Roadmap Sprint 14 | Só Postgres/obs no Compose |
| Staging API URL | `staging-api.corredoradf.com.br` | Aspiracional |
| CI “build” | ADR checklist | Lint/test sem `next build`/`nest build` |
| Observabilidade “Não” (trechos antigos) | Alguns docs legados | 4.1 local **Sim** (runbook já atualizado em D4) |

---

## 6. Lacunas (priorizadas para entrega)

| # | Lacuna | Bloqueia entrega? |
|---|---|---|
| L1 | **Topologia de execução** fora do PC (onde rodam web, api, db) | **Sim** — raiz |
| L2 | **Modelo de ambientes** real (staging/prod) + alinhamento git-flow | **Sim** |
| L3 | **CD mínimo** + secrets em Environment/host | **Sim** (depois de L1/L2) |
| L4 | Artefato reproduzível (image ou build pack) | Sim (forma depende de L1) |
| L5 | URL pública + TLS (webhooks Stripe, cookies) | Sim para payments reais |
| L6 | Observabilidade **hospedada** | Não bloqueia MVP local; pós-entrega |
| L7 | Harden CI com `build` de produção | Qualidade; não substitui L1 |

**Suspeita confirmada:** a maior lacuna **não** é observabilidade. É **deploy / ambiente executável**.

---

## 7. Riscos se avançar sem decisão

| Risco | Por quê |
|---|---|
| Escolher K8s/Vercel/AWS cedo demais | Empilha infra sem topologia acordada |
| Dockerfile “por enquanto” sem ADR | Vira path dependency acidental |
| Abrir CD com secrets antes de Environments | Vazamento / processo frágil |
| Reabrir FASE 3 para “facilitar deploy” | Quebra disciplina de contratos |
| Tratar Compose local como staging | Mistura DX com homologação |

---

## 8. Opções arquiteturais (só menu — **não** escolher neste audit)

| Opção | Ideia | Prós | Contras |
|---|---|---|---|
| **A. PaaS split** | Web (Vercel/CF/Netlify) + API (Railway/Fly/Render/…) + Postgres gerenciado | Rápido p/ MVP; casa com ADR-010 preview | Dois hosts; rede/CORS/webhook |
| **B. Compose em um VPS** | Um servidor: web+api+db(+obs opcional) via Compose | Uma topologia; próximo do Compose atual | Ops manual; TLS; backup |
| **C. Containers + orquestrador** | Dockerfiles + K8s/ECS/… | Escala | Excesso para estágio atual |
| **D. Monolito de edge** | Tudo em um único PaaS Node (se couber) | Simples | Nest+Next+Postgres raramente “um clique” |

ADR-010 **permite** A–C desde que Actions orquestre; **não** impõe K8s.

---

## 9. Recomendação — menor próximo marco

### Não fazer agora
Qualquer implementação de Docker/CD/cloud/receiver/métricas/reabrir 3 ou 4.1.

### Fazer como **4.2-B** (feito — ADR proposto)

**FASE 4.2-B — Deployment Topology Decision:** [ADR-011](../architecture/adr/ADR-011-deployment-topology.md)

Decisão proposta: **VPS + Docker Compose** para o primeiro staging.  
Próximo após **Aceito**: **4.2-C** — menor PR de implementação (Compose de aplicação + docs), sem produção.

---

## 10. Critérios de aceite deste audit (4.2-A)

- [x] Inventário ADRs / apps / infra / CI / env / secrets / docs staging-prod
- [x] Estado real vs pretendido
- [x] Divergências e lacunas
- [x] Riscos e opções (sem escolha forçada de vendor)
- [x] Recomendação do menor próximo marco
- [x] **Zero** código / Dockerfile / CD / cloud neste PR

---

## 11. Relacionados

- [ADR-010](../architecture/adr/ADR-010-cicd-github-actions.md)
- [environment.md](../setup/environment.md)
- [10-release-process.md](../engineering/10-release-process.md)
- [03-git-flow.md](../engineering/03-git-flow.md)
- [roadmap.md](../roadmap.md) (Sprint 14)
- Platform 4.1: [docs/platform/](./)
