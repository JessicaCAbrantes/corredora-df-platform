# Observabilidade local — Grafana (FASE 4.1-C1 / C2)

**Status:** Stable (local provisioning + payments dashboard)  
**Escopo:** Grafana no Compose + datasource Prometheus + dashboard `payments-ops-v1` (contrato D3-A)  
**Fora de escopo:** Alertmanager, SSO, produção, mudanças na app

Consome o Prometheus de [observability-local.md](./observability-local.md). Fluxo edit → export → commit: [dashboard-as-code.md](./dashboard-as-code.md) (FASE 4.1-C3). A aplicação (FASE 3.4 / 3.5) permanece congelada.

---

## 1. Honesty

| Claim | Today |
|---|---|
| Grafana local (Compose) | **Sim** — (FASE 4.1-C1) |
| Dashboard `payments-ops-v1` | **Sim** — JSON em `infrastructure/observability/grafana/dashboards/payments-ops-v1.json` (FASE 4.1-C2) |
| Dashboard as code (processo) | **Sim** — [dashboard-as-code.md](./dashboard-as-code.md) (FASE 4.1-C3) |
| Alertmanager / Grafana Cloud | **Não** Cloud — AM local: [alertmanager-local.md](./alertmanager-local.md) (4.1-D2) |
| Produção / SSO | **Não** |

---

## 2. Portas (congeladas)

| Serviço | URL |
|---|---|
| Next.js (web) | `http://localhost:3000` |
| API | `http://localhost:3001` |
| **Grafana** | `http://localhost:3002` |
| Prometheus | `http://localhost:9090` |

---

## 3. Subir / login

Pré-requisito: bearer + API metrics (ver [observability-local.md](./observability-local.md) §3).

```bash
cp infrastructure/observability/secrets/bearer_token.example \
   infrastructure/observability/secrets/bearer_token

docker compose -f infrastructure/docker-compose.yml up -d prometheus grafana
```

1. Abra [http://localhost:3002](http://localhost:3002)
2. Login local default: `admin` / `admin` (troque na primeira entrada)
3. **Connections → Data sources → Prometheus** deve existir e estar **default**
4. Em Explore, rode `up{job="corredora-api"}` (target Prometheus UP + API com métricas)
5. Abra o dashboard **Payments — Operational** (folder `Corredora DF`, uid `payments-ops-v1`)

Parar:

```bash
docker compose -f infrastructure/docker-compose.yml stop grafana
```

---

## 4. Estrutura (dashboards as code)

```text
infrastructure/observability/grafana/
  provisioning/
    datasources/datasource.yml
    dashboards/dashboards.yml
  dashboards/                 # mounted RO → /var/lib/grafana/dashboards
    README.md
    payments-ops-v1.json      # uid congelado payments-ops-v1
```

| Convenção | Valor |
|---|---|
| Datasource uid | `prometheus` |
| Provider folder | `Corredora DF` |
| Dashboard uid | **`payments-ops-v1`** (nunca auto-gerado) |
| Refresh | **30s** |
| Source of truth | Git (mount read-only) |

Painéis oficiais: Checkout Funnel, Webhook Outcomes, Webhook Latency, Ledger Health — ver [Dashboard Contract](../observability/payment-dashboards.md).

Para alterar o JSON oficial: [dashboard-as-code.md](./dashboard-as-code.md) (edit → export → commit).

---

## 5. O que C1/C2/C3 não incluem

- Alertas / Alertmanager
- Plugins extras
- Auth externa / SSO
- Qualquer alteração em `apps/*`
- Métricas ou painéis fora do contrato D3-A

---

## 6. Próximo

**4.1-D3** — Alert Rules ([alertmanager-audit.md](./alertmanager-audit.md) · [alertmanager-local.md](./alertmanager-local.md)).
