# Alertmanager — Platform Audit (FASE 4.1-D1)

**Status:** Stable (audit / decisions frozen)  
**Escopo:** inventário + ownership + catálogo + severidades + receivers locais + agrupamento + silences — **somente documentação**  
**Fora de escopo:** YAML de Alertmanager, regras Prometheus live, receivers reais (Slack/Teams/PagerDuty/e-mail), HA, produção, `apps/*`

Este documento **congela decisões** antes de qualquer provisioning (4.1-D2). Consome o [Alert Contract D3-A](../observability/payment-alerts.md). Não redefine o catálogo de alertas.

---

## 1. Honesty (pós-D2 — tip local)

| Claim | Today |
|---|---|
| Prometheus local (Compose) | **Sim** — `prom/prometheus:v2.55.1` · `:9090` |
| Grafana + `payments-ops-v1` | **Sim** |
| Dashboard as code | **Sim** |
| `rule_files` / recording rules | **Não** (4.1-D3) |
| Alertmanager container | **Sim** — [alertmanager-local.md](./alertmanager-local.md) (4.1-D2) |
| `alerting:` no `prometheus.yml` | **Sim** (wire AM; sem regras ainda) |
| Slack / Teams / PagerDuty / e-mail | **Não** |
| Paging / on-call | **Não** |
| O que este documento faz | Congela **como** a plataforma notifica localmente — provisioning em D2; regras em D3 |

Contrato semântico da app: [payment-alerts.md](../observability/payment-alerts.md) (FASE 3.5-D3-A). Expressões lá são **intended**; D3 materializa regras Prometheus; D2 sobe o Alertmanager.

---

## 2. Inventário (somente leitura)

### 2.1 Prometheus

| Item | Valor congelado (4.1-B) |
|---|---|
| Imagem | `prom/prometheus:v2.55.1` |
| Porta | `9090` |
| Config | `infrastructure/observability/prometheus.yml` |
| `scrape_interval` | **30s** |
| `evaluation_interval` | **30s** |
| Retenção | **15d** |
| Job | `corredora-api` → `host.docker.internal:3001/metrics` + Bearer |
| Labels estáticas | `service=api`, `env=local` |

**Ausências relevantes para D:**

- Sem bloco `alerting:`
- Sem `rule_files:`
- Sem serviço Alertmanager no Compose

### 2.2 Regras disponíveis

| Tipo | Estado |
|---|---|
| Recording rules | Nenhuma |
| Alerting rules (Prometheus) | Nenhuma (chegarão em **4.1-D3**) |
| Grafana unified alerting | **Fora de escopo** desta fase — motor oficial = Prometheus → Alertmanager |

### 2.3 Dashboards

| Dashboard | UID | Painéis ligados a alertas |
|---|---|---|
| Payments — Operational | `payments-ops-v1` | `webhook_outcomes`, `webhook_latency`, `ledger_health` |

Contrato: [payment-dashboards.md](../observability/payment-dashboards.md) · JSON: `infrastructure/observability/grafana/dashboards/payments-ops-v1.json`.

### 2.4 Métricas utilizáveis pelos alertas D3-A

Todas já existem no contrato de métricas e no export `/metrics` (quando habilitado):

| Alerta | Métricas | Agregação obrigatória |
|---|---|---|
| `payment_signature_rejected_spike` | `payment_signature_rejected_total` | `sum(rate(...)) by (provider)` |
| `payment_ledger_received_stuck` | `payment_ledger_received_total`, `payment_ledger_received_age_seconds` | **`max(...)` by (provider)** — nunca `sum()` |
| `payment_retryable_elevated` | `payment_retryable_total` | `sum(rate(...{code="PAYMENT_NOT_FOUND"})) by (provider)` |
| `payment_webhook_latency_high` | `payment_webhook_processing_duration_seconds_bucket` | `histogram_quantile` + `sum(rate(...)) by (le, provider)` |
| `payment_processing_error_spike` | `payment_webhook_processing_error_total`, `payment_webhook_verify_error_total` | `sum(rate(...)) by (provider)` |

**Não alertar (contrato §5):** `payment_webhook_duplicate_total` sozinho; `payment_permanent_ack_total` sozinho; conversão de negócio; labels de ID.

Pré-requisito operacional: API com `METRICS_ENABLED=true` + Bearer alinhado + target Prometheus **UP** — senão não há série para avaliar.

---

## 3. Ownership (RACI operacional — local)

| Artefato | Owner (decide) | Maintainer (PR) | Consulta |
|---|---|---|---|
| Catálogo de alertas (nomes, severidade, condição intended) | Tech Lead + contrato D3-A | App/docs — **congelado**; plataforma **não** inventa alertas | Cursor / engenharia |
| Regras Prometheus (`*.yml` de alerts) | Tech Lead | Plataforma (4.1-D3) | Contrato D3-A |
| Alertmanager config (rotas, receivers, inhibit) | Tech Lead | Plataforma (4.1-D2 / D4) | Ops |
| Silences | On-call / Tech Lead (UI AM ou API) | Documentado em D1/D4 — sem UI custom | — |
| Runbooks (§11–14) | Tech Lead / Ops | `docs/ops/payments-runbook.md` | Alerts contract |
| Dashboard JSON | Plataforma (as code) | Fluxo [dashboard-as-code.md](./dashboard-as-code.md) | D3-A dashboards |
| Código da API / métricas | **Congelado** (FASE 3) | Só defect real | — |

Regra: **plataforma consome o contrato**; mudança de nome/significado de alerta → revisão do D3-A primeiro.

---

## 4. Catálogo de alertas (validação D3-A — sem inventar)

Os **cinco** alertas oficiais. Ordem = contrato.

| Alert name | Severity (contrato) | Dashboard panel | Runbook |
|---|---|---|---|
| `payment_signature_rejected_spike` | `critical` | `webhook_outcomes` | §11 webhook 401 |
| `payment_ledger_received_stuck` | `warning` (elevar a `critical` se idade cresce e confirmações param) | `ledger_health` | §13 · §14 |
| `payment_retryable_elevated` | `warning` | `webhook_outcomes` | §12 · §14 |
| `payment_webhook_latency_high` | `warning` | `webhook_latency` | §12 |
| `payment_processing_error_spike` | `critical` | `webhook_outcomes` | §12 |

Condições intended: [payment-alerts.md §4](../observability/payment-alerts.md#4-alert-catalog). Thresholds iniciais são **starting points** — tune só com baseline + nota no contrato.

**D1 confirma:** nenhum sexto alerta neste roadmap 4.1-D.

---

## 5. Severidades (congeladas)

| Severidade | Label Prometheus/AM | Uso |
|---|---|---|
| **Warning** | `severity: warning` | Operação acompanha; investigar em breve; sem paging real nesta fase |
| **Critical** | `severity: critical` | Ação imediata; quebra de pagamento provavelmente visível ao usuário |

Mapeamento inicial (espelha D3-A):

| Severity | Alerts |
|---|---|
| `critical` | `payment_signature_rejected_spike`, `payment_processing_error_spike` |
| `warning` | `payment_ledger_received_stuck`, `payment_retryable_elevated`, `payment_webhook_latency_high` |

Rotas (D2/D4) **devem** discriminar por `severity` mesmo que o receiver local seja o mesmo (log/webhook dummy) — prepara o caminho para paging sem redesign.

---

## 6. Receivers (fase local — congelados)

### 6.1 Permitidos em 4.1-D

| Receiver | Propósito |
|---|---|
| **Webhook dummy** | HTTP local que aceita POST do Alertmanager e registra o payload (container ou processo host) |
| **Arquivo / log** | Persistência legível no volume ou stdout do dummy — prova de entrega |
| (Opcional) **null / blackhole** | Só se necessário para testes de rota sem I/O |

### 6.2 Explicitamente fora (até decisão futura)

Slack · Teams · PagerDuty · e-mail · SMS · Grafana OnCall · qualquer paging real.

Um único receiver local “ops-local” basta para D2–D4; rotas separam por severity **no config**, mesmo com o mesmo destino.

---

## 7. Agrupamento (congelado para D2)

Valores iniciais para ambiente **local**. Mudança exige nota neste doc ou no provisioning futuro.

| Parâmetro | Valor | Racional |
|---|---|---|
| `group_by` | `['alertname', 'provider']` | Alinha ao label fechado do contrato; evita misturar providers |
| `group_wait` | `30s` | Alinha a `evaluation_interval` / scrape 30s |
| `group_interval` | `5m` | Batch de updates do mesmo grupo sem spam |
| `repeat_interval` | `4h` | Local: relembra sem inundar logs do dummy |

`route` raiz: receiver local default; filhos por `severity` (warning vs critical) apontando ao mesmo (ou a logs distintos) — detalhe de YAML em D2/D4.

`inhibit_rules`: **não** nesta fase (pode entrar depois se critical inibir warning do mesmo `alertname`+`provider`).

---

## 8. Silences

| Tópico | Decisão D1 |
|---|---|
| Motor | Alertmanager nativo (UI `:9093` prevista + API HTTP) |
| UI custom / produto | **Não** |
| Quem cria | Tech Lead / operador local durante manutenção ou teste ruidoso |
| Documentar | Matchers típicos: `alertname=…`, `provider=…`, `severity=…` |
| Duração | Sempre com fim explícito; silences eternos proibidos em processo |
| Relação com Git | Silences **não** versionados no repo (estado runtime) — só o *procedimento* é documentado |

Fluxo (documental):

```text
Identificar alerta ruidoso / janela de manutenção
        │
        ▼
Alertmanager UI → Silences → matchers + endsAt
        │
        ▼
Validar que notificações param no receiver local
        │
        ▼
Ao fim da janela: silence expira (não depender de delete manual)
```

Detalhamento operacional com screenshots/comandos: **4.1-D4** (Receivers + Runbooks).

---

## 9. Portas e layout (D2 implementado)

| Serviço | Porta |
|---|---|
| API | 3001 |
| Grafana | 3002 |
| Prometheus | 9090 |
| **Alertmanager** | **9093** |

```text
infrastructure/observability/
  prometheus.yml              # alerting → alertmanager:9093 (D2); rule_files (D3)
  alertmanager/
    alertmanager.yml          # D2
  rules/
    payments-alerts.yml       # D3 — só catálogo D3-A
```

Detalhe operacional: [alertmanager-local.md](./alertmanager-local.md).
---

## 10. Fora do escopo (toda a 4.1-D)

- Grafana Cloud / Prometheus remoto
- Kubernetes / ServiceMonitor / Prometheus Operator
- HA Alertmanager / clustering
- Produção / staging gerenciado
- Paging real · Slack · Teams · PagerDuty · e-mail
- Grafana-managed alert rules como fonte oficial
- Novos alertas além dos cinco do D3-A
- Mudanças na aplicação ou nos contratos de métricas/eventos
- Alteração de queries do dashboard fora do fluxo as-code

---

## 11. Roadmap 4.1-D (granularidade por PR)

```text
4.1-D1  Alertmanager Audit          ✅ docs
        │
        ▼
4.1-D2  Alertmanager Provisioning   ← Compose + alertmanager.yml + wire Prometheus
        │
        ▼
4.1-D3  Alert Rules                 rule_files com os 5 alertas D3-A
        │
        ▼
4.1-D4  Receivers + Runbooks        polish silence + links ops (dummy já em D2)
```

Uma capacidade nova por PR. Sem misturar infra + regras + receivers reais no mesmo PR.

---

## 12. Critérios de aceite deste marco (D1)

- [x] Inventário Prometheus / regras / dashboard / métricas documentado
- [x] Ownership explícito
- [x] Catálogo = exatamente os 5 alertas D3-A
- [x] Severidades warning / critical congeladas
- [x] Receivers locais (webhook dummy / arquivo / log) — sem integrações reais
- [x] `group_by` / `group_wait` / `group_interval` / `repeat_interval` congelados
- [x] Fluxo de silences documentado (sem UI nova)
- [x] Fora de escopo e roadmap D2–D4 explícitos
- [x] **Nenhum** YAML Alertmanager / regra live neste PR

---

## 13. Relacionados

- Contrato: [payment-alerts.md](../observability/payment-alerts.md)
- Métricas: [payment-metrics.md](../observability/payment-metrics.md)
- Dashboards: [payment-dashboards.md](../observability/payment-dashboards.md)
- Prometheus local: [observability-local.md](./observability-local.md)
- Grafana: [grafana-local.md](./grafana-local.md)
- Runbook: [payments-runbook.md](../ops/payments-runbook.md)
