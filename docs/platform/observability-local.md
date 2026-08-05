# Observabilidade local — Prometheus (FASE 4.1-B)

**Status:** Stable (local platform)  
**Escopo:** scrape local de `GET /metrics` da API via Prometheus no Docker Compose  
**Fora de escopo:** Alertmanager, Dockerfile da API, CD, Kubernetes, produção

A **aplicação** (FASE 3.4 / 3.5) permanece congelada. Este documento descreve o **Prometheus local**. Grafana: [grafana-local.md](./grafana-local.md).

---

## 1. Honesty

| Claim | Today |
|---|---|
| Prometheus local (Compose) | **Sim** (FASE 4.1-B) |
| Grafana local (Compose) | **Sim** — [grafana-local.md](./grafana-local.md) (FASE 4.1-C1) |
| Alertmanager | **Não** (4.1-D) |
| API containerizada | **Não** — API roda no host |
| Staging / produção | **Não** |
| Token no repo | Apenas `bearer_token.example` (local-only). O arquivo `bearer_token` é gitignored |

---

## 2. Pré-requisitos

1. Docker / Docker Compose
2. API Nest rodando no host em `http://localhost:3001` (`pnpm --filter api dev`)
3. Postgres (Compose) se a API precisar do DB — independente do scrape

---

## 3. Bearer + `METRICS_ENABLED` (obrigatório)

Scrape **não** é aberto. Prometheus envia Bearer; a API exige o mesmo valor.

### 3.1 Secret local do Prometheus

```bash
cp infrastructure/observability/secrets/bearer_token.example \
   infrastructure/observability/secrets/bearer_token
```

Valor de desenvolvimento (exemplo):

```text
local-corredora-metrics-dev-token
```

**Nunca** reutilize esse token em staging/produção.

### 3.2 API (processo no host)

Em `apps/api/.env` (não commitado):

```env
METRICS_ENABLED=true
METRICS_BEARER_TOKEN=local-corredora-metrics-dev-token
```

Reinicie a API após alterar o `.env`.

| Configuração | Comportamento |
|---|---|
| `METRICS_ENABLED=false` (default) | `GET /metrics` → **404** (target down no Prometheus) |
| `true` sem token | Boot da API **falha** |
| `true` + Bearer errado | **401** |
| `true` + Bearer correto | **200** + Prometheus text 0.0.4 |

Contrato da app: [`docs/observability/payment-metrics.md`](../observability/payment-metrics.md) · [`docs/setup/environment.md`](../setup/environment.md).

---

## 4. Subir / parar

Na raiz do monorepo (ou em `infrastructure/`):

```bash
# Subir Postgres + Prometheus (+ Grafana se desejado)
docker compose -f infrastructure/docker-compose.yml up -d

# Só Prometheus
docker compose -f infrastructure/docker-compose.yml up -d prometheus

# Prometheus + Grafana
docker compose -f infrastructure/docker-compose.yml up -d prometheus grafana

# Parar
docker compose -f infrastructure/docker-compose.yml stop prometheus grafana

# Parar tudo
docker compose -f infrastructure/docker-compose.yml down
```

UI Prometheus: [http://localhost:9090](http://localhost:9090)  
UI Grafana: [http://localhost:3002](http://localhost:3002) — ver [grafana-local.md](./grafana-local.md)

---

## 5. Target e parâmetros congelados

| Parâmetro | Valor |
|---|---|
| Job | `corredora-api` |
| Target | `host.docker.internal:3001` |
| Path | `/metrics` |
| Scheme | `http` |
| `scrape_interval` | **30s** |
| `evaluation_interval` | **30s** |
| Retenção TSDB | **15d** (`--storage.tsdb.retention.time=15d`) |
| Config | `infrastructure/observability/prometheus.yml` |

Labels estáticas do job: `service=api`, `env=local`.

`extra_hosts: host.docker.internal:host-gateway` cobre Docker Engine no Linux; Docker Desktop (Windows/macOS) já resolve o hostname.

---

## 6. Validar o scrape

1. API up com métricas habilitadas.
2. Smoke manual:

```bash
curl -sS -H "Authorization: Bearer local-corredora-metrics-dev-token" \
  http://localhost:3001/metrics | head
```

3. Em Prometheus → **Status → Targets**: `corredora-api` deve estar **UP**.
4. Explorar: `payment_confirmed_total`, `payment_ledger_received_total`, `payment_webhook_processing_duration_seconds_bucket`.

### Agregação (contrato operacional)

| Tipo | Em queries futuras (Grafana) |
|---|---|
| Counter | `sum` / `rate` / `increase` |
| Histogram | `histogram_quantile` |
| Gauge DB-backed (`payment_ledger_received_*`) | **`max()`** — nunca `sum()` entre réplicas |

---

## 7. Troubleshooting

| Sintoma | Verificação |
|---|---|
| Compose falha ao montar `bearer_token` | Rodar o `cp` do §3.1 |
| Target **DOWN** | API escutando em `:3001`? Firewall? |
| Target DOWN + 404 no curl | `METRICS_ENABLED=true` na API? |
| Target DOWN + 401 | Token do arquivo = `METRICS_BEARER_TOKEN`? |
| Linux sem Desktop | Confirmar `extra_hosts` / `host-gateway` |
| Séries vazias | Gerar tráfego (checkout/webhook mock) ou aguardar sampler de ledger (~30s) |

---

## 8. O que não fazer neste marco

- Não abrir `/metrics` sem Bearer.
- Não apontar este Compose para staging/produção.
- Não adicionar Alertmanager neste PR (4.1-D).
- Não alterar contratos da aplicação (3.4 / 3.5).

---

## 9. Próximo

**4.1-C2** — dashboard `payments-ops-v1` no Grafana ([grafana-local.md](./grafana-local.md) · [payment-dashboards.md](../observability/payment-dashboards.md)).
