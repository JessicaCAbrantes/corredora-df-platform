# ADR-011: Deployment Topology (primeiro staging)

## Status

**Aceito** — 2026-08-09 (FASE 4.2-C0)

Depende de: [deployment-environment-audit.md](../../platform/deployment-environment-audit.md) (4.2-A), [deployment-infrastructure-audit.md](../../platform/deployment-infrastructure-audit.md) (4.2-C), [ADR-010](./ADR-010-cicd-github-actions.md)

### Registro de aceite

| Campo | Valor |
|---|---|
| Decisão | **Aceita** formalmente pela Tech Lead |
| Data | 2026-08-09 |
| Marco | FASE 4.2-C0 (documentação do aceite) |
| Topologia | **VPS + Docker Compose** — primeiro ambiente real/staging |
| Branch oficial | **`master`** (não introduzir `develop` / `main`) |
| Produção neste marco | **Não** provisionar |
| Staging vs produção | Ambientes **separados** (secrets, DB, host/projeto Compose) |
| Auditoria 4.2-C | Aprovada como somente leitura — ver [deployment-infrastructure-audit.md](../../platform/deployment-infrastructure-audit.md) |

> VPS + Docker Compose é a decisão para o **primeiro ambiente fora do laptop (staging)**.  
> **Não** é obrigação arquitetural permanente nem a topologia definitiva de produção.  
> Evoluir para PaaS split, orquestrador gerenciado ou outra topologia exige **novo ADR**.

## Contexto

FASE 3 (aplicação) e FASE 4.1 (observabilidade local) estão **congeladas** e coerentes no laptop. A auditoria 4.2-A mostrou que a lacuna bloqueante para entrega/uso **não** é observabilidade — é a ausência de topologia de execução fora do PC.

A auditoria 4.2-C (infraestrutura de deployment, somente leitura) confirmou: builds e health existem; faltam Dockerfiles de app, Compose de aplicação, TLS, secrets de host e CD — sem redesenhar contratos FASE 3 / 4.1.

ADR-010 fixa **GitHub Actions** como orquestrador de CI/CD, mas deixa o **provider de hosting** como decisão satélite. Documentos antigos que citam `develop`/`main` são **históricos**; o GitHub real usa **`master`**.

## Problema

Qual é a **menor infraestrutura** capaz de colocar o Corredora DF em um **staging real**, reproduzível e seguro — sem projetar a arquitetura “ideal daqui a cinco anos”?

## Alternativas

| Alternativa | Ideia | Prós | Contras |
|---|---|---|---|
| **A. PaaS split** | Web (Vercel/CF/Netlify) + API (Railway/Fly/Render/…) + Postgres gerenciado | Rápido; preview web fácil | Vários vendors; CORS/webhook/secrets espalhados; longe do Compose atual |
| **B. VPS + Docker Compose** | Um servidor: proxy TLS + web + api + postgres | Uma topologia; reutiliza músculo Compose (4.1); secrets num lugar; HTTPS único para Stripe | Ops de um VPS; menos “magia” PaaS |
| **C. Containers gerenciados (ECS/K8s/…)** | Orquestração gerenciada | Escala | Excesso para o primeiro staging |
| **D. Tudo num único PaaS Node** | Um produto hospeda web+api+db | Simples se couber | Nest+Next+Postgres raramente encaixa limpo |

## Decisão

Adotar **B — VPS + Docker Compose** como topologia do **primeiro ambiente fora do laptop (staging)**.

### Topologia (staging)

```text
Internet
   │
   ▼
HTTPS — reverse proxy + TLS (obrigatório se exposto à Internet)
   │
   ├── Web  (Next.js — apps/web)
   │
   └── API  (NestJS — apps/api)
         │
         ├── PostgreSQL (privado)
         ├── GET /metrics  (fail-closed; Bearer; token ≠ local laptop; não público)
         └── Logs (stdout / host — sem stack obs hospedada neste corte)
```

**TLS:** obrigatório em staging público. **Preferência** para o primeiro staging: **Caddy** (detalhe de implementação nos marcos 4.2-C2+; não neste C0).

### Princípios do primeiro corte

1. **Um** host (VPS), **um** Compose de **aplicação** (web + api + postgres + proxy TLS), **separado** do Compose local de FASE 4.1.
2. Compose **local** de FASE 4.1 (Postgres + obs) permanece DX no laptop — **não** é o staging e **não** deve ser reutilizado como stack de staging.
3. Staging tem **URL pública HTTPS**, **banco separado**, **secrets separados** (nunca no Git).
4. Deploy inicial pode ser **manual** (SSH + build no VPS ou pull); registry e CD via Actions vêm **depois** (ADR-010), orquestrando a mesma topologia — sem mudá-la.
5. Observabilidade **hospedada** fica **fora** do primeiro staging; `/metrics` permanece fail-closed (off ou Bearer de staging).
6. Migrations: etapa **explícita** de deploy (`prisma migrate deploy`), **não** implícita no boot/restart da API.

### Staging mínimo — critérios de “saudável”

| Critério | Esperado |
|---|---|
| URL | HTTPS para Web e API (domínios ou subdomínios dedicados de staging) |
| Banco | Postgres **só** de staging (não o volume local do developer) |
| Secrets | `DATABASE_URL`, `AUTH_SECRET`, Stripe (se ligado), etc. só no host/secret store — **zero** no Git |
| Schema | `prisma migrate deploy` aplicado (passo de deploy, não boot) |
| Health | `GET /health/live` e `GET /health/ready` → 200 |
| Smoke | Login + um caminho autenticado de leitura |
| Payments | Stripe **Test Mode** quando payments reais no staging; **nunca** credenciais de produção; mock proibido com `NODE_ENV=production` |
| `/metrics` | Default off **ou** Bearer com token de staging (nunca o token local de laptop) |

### Produção

**Direção apenas — não provisionar neste ADR / neste marco 4.2:**

- Mesma família de topologia (VPS + Compose + TLS + web + api + postgres), ambiente **separado**.
- Secrets + DB + host/projeto Compose próprios.
- Release via tag/PR aprovado em `master`; CD automático é fase posterior sob ADR-010.

### Git flow (honesty — alinhado ao GitHub atual)

**Não** introduzir `develop` ou `main` só porque docs/ADR antigos mencionam isso.

```text
master          → integração + linha de release (protegida)
  ├── feature/*     → produto / domínio
  ├── platform/*    → plataforma / infra docs
  ├── hardening/*   → endurecimento
  ├── docs/*        → documentação
  ├── fix/*         → correções
  └── chore/*       → manutenção
```

Ritual: auditoria → escopo → aprovação → branch → implementação → review → PR → merge em `master` → sync → checkpoint.  
Pedido no Slack **não** é autorização automática de implementação.

### Fora do primeiro corte (explícito)

Kubernetes · Terraform completo · autoscaling · HA · multi-region · CDN avançada · blue/green · canary · service mesh · OTel · Redis/Kafka · observabilidade adicional hospedada · receivers de paging · reabrir FASE 3 / 4.1 / contratos · produção neste marco · CD completo · registry (marco posterior).

## Consequências

**Positivas**

- Menor número de peças para um staging **real** (URL + TLS + DB + apps)
- Continuidade com Compose já usado no monorepo
- Fronteira clara: laptop ≠ staging ≠ produção
- ADR-010 permanece válido (Actions orquestra; Compose é o artefato de runtime)

**Negativas**

- Exige operar um VPS (patch, backup, DNS)
- Web e API no mesmo host (acoplamento de capacidade) — aceitável no primeiro corte
- Sem preview PaaS automático de PR até CD posterior

**Neutras**

- Imagens: primeiro corte pode buildar no VPS; registry é marco posterior
- Migração futura de topologia exige **novo ADR** (não silencioso)

## Próximos passos

1. [x] Tech Lead aceita este ADR (status → Aceito) — **4.2-C0**
2. [x] Auditoria 4.2-C (somente leitura) — aprovada
3. [ ] **4.2-C1** — containerização API/Web (**não** autorizado no C0; aguarda merge + aprovação de escopo)
4. [ ] 4.2-C2+ — Compose staging, secrets, TLS (Caddy), smoke — cada um com escopo aprovado
5. [ ] CD GitHub Environments — marco posterior, sem mudar a topologia

## Freeze

FASE 3 e FASE 4.1 permanecem congeladas. Não alterar contratos, endpoints, métricas, dashboards, regras de alerta, Alertmanager ou `/metrics` sem decisão explícita.

Exceção pontual **futura** (somente quando C1 for autorizado): `output: "standalone"` no Next.js — packaging/build/runtime apenas, sem mudança de comportamento.

## Relacionados

- Audit 4.2-A: [deployment-environment-audit.md](../../platform/deployment-environment-audit.md)
- Audit 4.2-C: [deployment-infrastructure-audit.md](../../platform/deployment-infrastructure-audit.md)
- CI/CD: [ADR-010](./ADR-010-cicd-github-actions.md)
- Env/secrets: [environment.md](../../setup/environment.md)
- Git: [03-git-flow.md](../../engineering/03-git-flow.md)
- Release: [10-release-process.md](../../engineering/10-release-process.md)
