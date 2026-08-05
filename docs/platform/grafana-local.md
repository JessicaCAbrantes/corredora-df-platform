# Observabilidade local — Grafana (FASE 4.1-C1)

**Status:** Stable (local provisioning)  
**Escopo:** Grafana no Compose + datasource Prometheus + provider de dashboards (pasta pronta)  
**Fora de escopo:** dashboards de pagamento (4.1-C2), Alertmanager, SSO, produção, mudanças na app

Consome o Prometheus de [observability-local.md](./observability-local.md). A aplicação (FASE 3.4 / 3.5) permanece congelada.

---

## 1. Honesty

| Claim | Today |
|---|---|
| Grafana local (Compose) | **Sim** (este marco) |
| Datasource Prometheus provisionado | **Sim** (`uid: prometheus`) |
| Dashboard `payments-ops-v1` | **Não** — 4.1-C2 |
| Alertmanager / Grafana Cloud | **Não** |
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

Parar:

```bash
docker compose -f infrastructure/docker-compose.yml stop grafana
```

---

## 4. Estrutura (dashboards as code — skeleton)

```text
infrastructure/observability/grafana/
  provisioning/
    datasources/datasource.yml
    dashboards/dashboards.yml
  dashboards/                 # mounted RO → /var/lib/grafana/dashboards
    README.md
    .gitkeep                  # C2 adiciona payments-ops-v1.json
```

| Convenção | Valor |
|---|---|
| Datasource uid | `prometheus` |
| Provider folder | `Corredora DF` |
| Futuro dashboard uid | **`payments-ops-v1`** (nunca auto-gerado) |
| Refresh padrão (C2) | **30s** |
| Source of truth | Git (mount read-only); UI pode editar localmente, mas o JSON no repo manda |

---

## 5. O que C1 não inclui

- JSON do dashboard Payments
- Alertas
- Plugins extras
- Auth externa / SSO
- Qualquer alteração em `apps/*`

---

## 6. Próximo

**4.1-C2** — adicionar `payments-ops-v1.json` com os quatro painéis do [Dashboard Contract](../observability/payment-dashboards.md).
