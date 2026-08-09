# ADR-011: Deployment Topology (primeiro staging)

## Status

Proposto — 2026-08-09 (FASE 4.2-B)  
Depende de: [deployment-environment-audit.md](../../platform/deployment-environment-audit.md) (4.2-A), [ADR-010](./ADR-010-cicd-github-actions.md)

## Contexto

FASE 3 (aplicação) e FASE 4.1 (observabilidade local) estão **congeladas** e coerentes no laptop. A auditoria 4.2-A mostrou que a lacuna bloqueante para entrega/uso **não** é observabilidade — é a ausência de topologia de execução fora do PC.

ADR-010 fixa **GitHub Actions** como orquestrador de CI/CD, mas deixa o **provider de hosting** como decisão satélite. Documentos antigos citam `develop`/`main` e staging aspiracional; o GitHub real usa **`master`**.

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

> **Escopo temporal (congelado):** VPS + Docker Compose é a decisão para o **primeiro ambiente real** (staging).  
> **Não** é obrigação arquitetural permanente nem “a arquitetura definitiva”.  
> Evoluir para PaaS split, orquestrador gerenciado ou outra topologia exige **novo ADR** — não reinterpretar silenciosamente este documento.

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
         ├── PostgreSQL
         ├── GET /metrics  (fail-closed; Bearer; token ≠ local laptop)
         └── Logs (stdout / host — sem stack obs hospedada neste corte)
```

**TLS:** obrigatório em staging público. A tecnologia concreta do proxy (Caddy, Nginx, Traefik, …) **não** é fixada aqui — fica para o escopo de **4.2-C**.

### Princípios do primeiro corte

1. **Um** host (VPS), **um** Compose de aplicação (web + api + postgres + proxy TLS).
2. Compose **local** de FASE 4.1 (Postgres + obs) permanece DX no laptop — **não** é o staging.
3. Staging tem **URL pública HTTPS**, **banco separado**, **secrets separados** (nunca no Git).
4. Deploy inicial pode ser **manual** (SSH + `compose up` / pull de imagem ou build no host); CD via Actions vem **depois** (ADR-010), orquestrando o mesmo Compose — sem mudar a topologia.
5. Observabilidade **hospedada** (Prometheus/Grafana/AM remotos) fica **fora** do primeiro staging; `/metrics` pode permanecer desligado (`METRICS_ENABLED=false`) até política de scrape no host.

### Staging mínimo — critérios de “saudável”

| Critério | Esperado |
|---|---|
| URL | HTTPS para Web e API (domínios ou subdomínios dedicados de staging) |
| Banco | Postgres **só** de staging (não o volume local do developer) |
| Secrets | `DATABASE_URL`, `AUTH_SECRET`, Stripe (se ligado), etc. só no host/secret store — **zero** no Git |
| Schema | `prisma migrate deploy` aplicado |
| Health | `GET /health/live` e `GET /health/ready` → 200 |
| Smoke | Login + um caminho autenticado de leitura |
| Payments | Matriz fail-closed: staging tratado como prod para mock (`PAYMENT_PROVIDER=stripe` quando payments reais; senão documentar mock **não** em `NODE_ENV=production`) |
| `/metrics` | Default off **ou** Bearer com token de staging (nunca o `local-corredora-metrics-dev-token`) |

### Produção

**Direção apenas — não provisionar neste ADR:**

- Mesma topologia (VPS + Compose + TLS + web + api + postgres).
- Ambiente **separado** (segundo VPS ou projeto Compose isolado + secrets + DB próprios).
- Release via tag/PR aprovado em `master` (ver git flow abaixo); CD automático é fase posterior sob ADR-010.
- Checklist de payments/DB já existentes em `docs/ops` e `docs/database` continuam válidos.

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

Ritual: branch → PR pequeno → review → merge em `master` → sync local → checkpoint.  
Cloud Agents / automação **não** commitam em `master` nem contornam proteção de branch.

### Fora do primeiro corte (explícito)

Kubernetes · Terraform completo · autoscaling · HA · multi-region · CDN avançada · blue/green · canary · service mesh · OTel · Redis/Kafka · observabilidade adicional hospedada · receivers de paging · reabrir FASE 3 / 4.1 / contratos.

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

- Escolha exata de distro VPS / Caddy vs Nginx / registry de imagens é detalhe de implementação (4.2-C+), não deste ADR
- Migração futura para PaaS split ou orquestrador exige **novo ADR** (não silencioso)

## Próximos passos (após aceite deste ADR)

1. Tech Lead **aceita** este ADR (status → Aceito).
2. **4.2-C** (só então): menor PR de implementação — ex. Compose de aplicação + docs de deploy staging (ainda sem produção).
3. Alinhar checklists de release ao fluxo `master` (já iniciado nos docs de engineering neste marco).
4. CD GitHub Environments — marco posterior, sem mudar a topologia.

## Freeze

Até a topologia estar **Aceita** e o escopo de 4.2-C aprovado: não alterar `apps/api`, `apps/web`, contratos FASE 3, métricas, dashboards, Alertmanager, regras de alerta, domínio de pagamentos.

## Relacionados

- Audit: [deployment-environment-audit.md](../../platform/deployment-environment-audit.md)
- CI/CD: [ADR-010](./ADR-010-cicd-github-actions.md)
- Env/secrets: [environment.md](../../setup/environment.md)
- Git: [03-git-flow.md](../../engineering/03-git-flow.md)
- Release: [10-release-process.md](../../engineering/10-release-process.md)
