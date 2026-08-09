# Alertmanager ops local — Receivers + Runbooks (FASE 4.1-D4)

**Status:** Stable (documentação operacional local)  
**Escopo:** mapa alerta→severity→receiver, silence, smoke sem paging real, anti-storm, troubleshooting  
**Fora de escopo:** Slack / Teams / e-mail / PagerDuty / secrets / novas regras / mudança de `group_*` / `apps/*` / produção

**Regra de ouro:** se implementar isto exigir secret, canal externo, nova regra ou alterar `group_wait` / `group_interval` / `repeat_interval` → **parar e reportar** (não expandir escopo).

Provisioning: [alertmanager-local.md](./alertmanager-local.md) · Rules: [alert-rules-local.md](./alert-rules-local.md) · Audit: [receivers-runbooks-audit.md](./receivers-runbooks-audit.md)

O YAML funcional (`alertmanager.yml`) permanece o de **4.1-D2** — D4 não o altera.

---

## 1. Honesty

| Claim | Today |
|---|---|
| Receiver de entrega | **Só** `ops-local` → dummy `alert-webhook` (stdout Compose) |
| Paging / Slack / Teams / e-mail / PagerDuty | **Não** |
| Secrets de notificação no Git | **Proibido** — nenhum |
| Silences | Runtime na UI/API AM — **não** versionados no Git |
| `duplicate` como alerta | **Não** — volume de duplicate sozinho **não** é incidente (contrato D3-A) |

---

## 2. Mapa operacional (congelado)

| Alerta | Severity | Receiver | Ação |
|---|---|---|---|
| `payment_signature_rejected_spike` | critical | `ops-local` | Investigar assinatura/secret — [runbook §11](../ops/payments-runbook.md#11-troubleshooting--webhook-401) |
| `payment_processing_error_spike` | critical | `ops-local` | Investigar API/DB — [runbook §12](../ops/payments-runbook.md#12-troubleshooting--webhook-500) |
| `payment_ledger_received_stuck` | warning | `ops-local` | Verificar RECEIVED/aging — [§13](../ops/payments-runbook.md#13-troubleshooting--persistent-received) · [§14](../ops/payments-runbook.md#14-payment_not_found) |
| `payment_retryable_elevated` | warning | `ops-local` | Investigar `PAYMENT_NOT_FOUND` — [§12](../ops/payments-runbook.md#12-troubleshooting--webhook-500) · [§14](../ops/payments-runbook.md#14-payment_not_found) |
| `payment_webhook_latency_high` | warning | `ops-local` | Verificar latência API/DB — [§12](../ops/payments-runbook.md#12-troubleshooting--webhook-500) |

Rotas AM discriminam `severity`, mas **ambos** os caminhos entregam em `ops-local` (preparação para paging futuro sem redesign).

---

## 3. Receiver `ops-local` (comportamento)

1. Prometheus avalia `rule_files` e envia firings ao Alertmanager.
2. AM agrupa (`alertname` + `provider`) e, após `group_wait`, notifica o receiver.
3. `ops-local` faz POST HTTP para `http://alert-webhook:8080/` (rede Compose).
4. O container `alert-webhook` **loga** o body no stdout — essa é a “notificação” local.

Não há canal humano externo. Operação = UI AM (`:9093`) + `docker compose ... logs alert-webhook`.

---

## 4. Anti-storm (parâmetros congelados — só documentar)

| Parâmetro | Valor | Efeito |
|---|---|---|
| `group_by` | `alertname`, `provider` | Não mistura providers |
| `group_wait` | **30s** | Espera batch antes da 1ª notificação do grupo |
| `group_interval` | **5m** | Intervalo mínimo entre notificações de update do mesmo grupo |
| `repeat_interval` | **4h** | Reenvio periódico enquanto o alerta continua firing |

**Não recalibrar** estes valores neste marco.

Expectativa local: um spike sustentado gera entrega no dummy após ~30s; updates no mesmo grupo não spamam a cada evaluation (30s); repeats no máximo a cada 4h.

`payment_webhook_duplicate_total` **não** tem regra — storm de replay idempotente não gera alerta próprio.

---

## 5. Semântica de silence (importante)

Silence **não** impede o Alertmanager de **receber** ou **listar** o alerta.

| Camada | Com silence ativo (matchers batem) |
|---|---|
| Prometheus → AM | Continua enviando / AM continua ciente |
| UI Alertmanager (Alerts) | Alerta pode permanecer **visível** |
| Receivers (`ops-local`) | **Não** recebe nova notificação daquele alerta |

Ou seja: silence bloqueia **entrega ao receiver**, não a existência do alerta no AM.

Matchers típicos: `alertname=…`, `provider=…`, `severity=…`.  
Sempre definir `endsAt`. Silences **eternos** são proibidos em processo. Estado de silence **não** vai para o Git.

UI: [http://localhost:9093/#/silences](http://localhost:9093/#/silences)

---

## 6. Smoke test local (sem paging real)

Pré-requisito:

```bash
docker compose -f infrastructure/docker-compose.yml up -d alert-webhook alertmanager prometheus
```

### 6.1 Antes do silence — AM recebe **e** dummy é notificado

```bash
curl -sS -X POST http://localhost:9093/api/v2/alerts \
  -H "Content-Type: application/json" \
  -d "[{
    \"labels\":{\"alertname\":\"smoke_local\",\"severity\":\"warning\",\"provider\":\"stripe\"},
    \"annotations\":{\"summary\":\"4.1-D4 smoke before silence\"}
  }]"
```

1. Aguardar `group_wait` (~**30s**).
2. UI AM → Alerts: `smoke_local` **visível**.
3. Logs do dummy mostram POST:

```bash
docker compose -f infrastructure/docker-compose.yml logs --tail=80 alert-webhook
```

### 6.2 Durante o silence — AM ainda vê; dummy **não** recebe de novo

1. Criar silence (UI ou API) com matchers p.ex. `alertname=smoke_local`, `provider=stripe`, e `endsAt` em poucos minutos.
2. Disparar de novo o mesmo POST §6.1 (ou equivalente).
3. Confirmar na UI: alerta permanece / reaparece no AM.
4. Confirmar nos logs: **sem** nova entrega correspondente ao segundo disparo (após o silence estar ativo).
5. Deixar o silence expirar (não depender de delete manual como processo padrão).

**Proibido neste teste:** configurar Slack/Teams/e-mail/PagerDuty; commit de webhook URL com secret; loops agressivos de POST.

---

## 7. Troubleshooting / validação

| Sintoma | Verificação |
|---|---|
| Dummy sem log após smoke | Esperou `group_wait` 30s? `alert-webhook` up? |
| AM sem alerta após POST | JSON de labels válido? API `/api/v2/alerts` |
| Silence “não funciona” | Confundiu “sumir do AM” com “parar receiver”? Ver §5 |
| Rules não disparam | Target Prometheus UP? `METRICS_ENABLED`? Ver [alert-rules-local.md](./alert-rules-local.md) |
| Suspeita de storm no log | Conferir `group_interval` / `repeat_interval`; não alterar YAML — investigar causa |
| Quer canal externo | **Fora de escopo** — reportar; não improvisar no Git |

---

## 8. Relacionados

- Runbook pagamentos: [payments-runbook.md §10.6](../ops/payments-runbook.md#106-dashboards--alerts-fase-35-d3-a)
- Contrato alertas: [payment-alerts.md](../observability/payment-alerts.md)
- Config AM (intocada neste PR): `infrastructure/observability/alertmanager/alertmanager.yml`
