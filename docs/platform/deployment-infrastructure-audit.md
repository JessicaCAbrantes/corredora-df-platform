# FASE 4.2-C — Deployment Infrastructure Audit

**Status:** Audit (somente leitura) — **aprovada** · implementação **bloqueada** até escopo autorizado  
**Marco:** 4.2-C (pós ADR-011 Aceito)  
**Base:** `master` @ `8d7f3c0` (ritual de agente) + aceite formal ADR-011  
**Freeze:** FASE 3 e FASE 4.1 — não reabrir métricas, payments, dashboards, rules, Alertmanager, `/metrics` ou contratos

Este documento versiona o resultado da auditoria 4.2-C. **Nenhum** Dockerfile, Compose de aplicação, VPS, CD ou secret foi criado nesta auditoria.

---

## 1. Veredito

É **viável** materializar o primeiro staging (VPS + Compose) **consumindo** FASE 3 e 4.1, sem redesenhar contratos.

O repositório **já tem** builds (`nest build` / `next build`), health probes, Prisma migrations, inventário de env/secrets e Compose **local** (Postgres + obs).

O repositório **não tem** Dockerfiles de app, Compose de aplicação, TLS proxy de staging, manifests de staging, publish de imagem no CI, nem CD.

**Lacuna raiz:** empacotamento + orquestração staging — não domínio nem observabilidade.

---

## 2. Estado atual (resumo)

### API (`apps/api`)

- Build: `nest build` → `dist/` · Start prod: `node dist/main.js`
- Porta: `PORT` default **3001**
- Health: `/health/live`, `/health/ready` (fora do prefix `/api/v1`)
- `/metrics`: fail-closed (Bearer; default off)
- Dockerfile: **ausente**

### Web (`apps/web`)

- Build/start: `next build` / `next start` (porta **3000**)
- Env: `NEXT_PUBLIC_API_URL`
- `output: "standalone"`: **ainda não** (aprovado como exceção pontual **quando C1** for autorizado)
- Dockerfile: **ausente**

### Database

- Postgres 16 local (Compose `:5433`) · Prisma migrations versionadas
- Staging: **não existe** (DB/volume separados obrigatórios)

### Compose atual

- Serviços: postgres, prometheus, grafana, alertmanager, alert-webhook
- **Não** sobe Web/API · **≠** Compose de staging futuro

### CI/CD

- Só `.github/workflows/ci.yml` (quality + e2e API)
- Sem build de produção no gate · sem imagens · sem CD

---

## 3. O que já pode ser reutilizado

- Scripts `build` / `start:prod` / `next start`
- Health `live` / `ready`
- `prisma migrate deploy` (padrão CI — como **passo de deploy**, não boot da API)
- Matriz env + fail-closed payments/metrics
- Estratégia de secrets documentada
- Contratos FASE 3 / stack FASE 4.1 (consumo)

---

## 4. Lacunas para staging

| # | Lacuna | Marco sugerido |
|---|---|---|
| L1 | Dockerfiles API/Web (+ standalone Next) | **4.2-C1** |
| L2 | Compose de aplicação (web+api+postgres+rede) | 4.2-C2 |
| L3 | Secrets + env de staging (fora do Git) | 4.2-C3 |
| L4 | TLS / reverse proxy (preferência: Caddy) | 4.2-C4 |
| L5 | Docs deploy + smoke | 4.2-C5 |
| L6 | CD staging | 4.2-C6 (posterior) |

---

## 5. Riscos

| Risco | Nota |
|---|---|
| Next sem `standalone` | Imagens grandes / frágil |
| Monorepo pnpm no Docker | Context na raiz; layers |
| `migrate` no boot da API | Restart vira migração implícita — **evitar** |
| Misturar Compose 4.1 no VPS | Expõe obs; fora do 1º corte |
| Secrets no Git | Proibido |
| Cookie/CORS/hostnames | Login/checkout quebram se URLs inconsistentes |

---

## 6. Rede e segurança (requisitos)

| Item | Requisito |
|---|---|
| Público | **443** (e tipicamente 80→HTTPS) via proxy |
| Privado | Postgres; preferir `/metrics` interno ou off |
| Web → API | HTTPS público coerente com CORS / `NEXT_PUBLIC_API_URL` |
| API → Stripe | egress HTTPS |
| Obs 4.1 | Não expor Prometheus/Grafana/AM do laptop no VPS no 1º corte |

---

## 7. Deploy mínimo (conceitual — não implementado)

```text
pull/build images
  → start postgres
  → prisma migrate deploy   ← etapa explícita (não entrypoint da API)
  → start api
  → start web
  → smoke tests
```

Persistência: volume Postgres. Rollback conceitual: imagem/tag anterior + política de migrate.

---

## 8. Divisão proposta (não autorizada automaticamente)

| ID | Escopo | Status |
|---|---|---|
| **4.2-C0** | Docs: ADR-011 → Aceito + links de auditoria | **Autorizado / em curso** |
| **4.2-C1** | Dockerfiles API + Web somente | **Bloqueado** até merge C0 + aprovação |
| **4.2-C2** | Compose staging | Bloqueado |
| **4.2-C3** | Secrets + environment | Bloqueado |
| **4.2-C4** | TLS / Caddy | Bloqueado |
| **4.2-C5** | Smoke / validação documental | Bloqueado |
| **4.2-C6** | CD staging | Bloqueado |

**Por que C1 ≠ C2:** C1 responde só “containers reproduzíveis?”; C2 responde “orquestração com Postgres e rede privada?”.

---

## 9. Fora deste marco

K8s · HA · autoscaling · multi-region · canary · blue/green · mesh · Redis · Kafka · OTel · obs hospedada · paging · produção · CD completo · IaC cloud · mudanças de domínio/contratos/métricas/dashboards/rules/`/metrics` · migrate automático no boot · registry (primeiro corte pode buildar no VPS)

---

## 10. Critérios de aceite da auditoria 4.2-C

- [x] Somente leitura — sem implementação
- [x] Lacunas identificadas
- [x] Relatório permite decidir o primeiro PR de infraestrutura (C1)
- [x] Contratos FASE 3 / 4.1 não alterados

---

## 11. Relacionados

- [ADR-011](../architecture/adr/ADR-011-deployment-topology.md) (**Aceito**)
- [deployment-environment-audit.md](./deployment-environment-audit.md) (4.2-A)
- [environment.md](../setup/environment.md)
- [03-git-flow.md](../engineering/03-git-flow.md)
