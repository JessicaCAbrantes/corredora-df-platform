# Alert Rules — Platform Audit (FASE 4.1-D3)

**Status:** Approved → implemented in [alert-rules-local.md](./alert-rules-local.md)  
**Escopo:** verificar PromQL vs métricas existentes; congelar expressões/`for`/labels  
**Fora de escopo na auditoria:** YAML live (feito no PR de regras); receivers reais; `apps/*`

Consome: [payment-alerts.md](../observability/payment-alerts.md) · [payment-metrics.md](../observability/payment-metrics.md)

---

## 1. Veredito

| Pergunta | Resposta |
|---|---|
| 5 alertas materializáveis sem métricas novas? | **Sim** |
| Gauges ledger com `max by (provider)`? | **Sim** — nunca `sum()` |
| Reabrir Fase 3? | **Não** |

---

## 2. Expressões aprovadas (Tech Lead)

### Signature
`sum by (provider) (rate(payment_signature_rejected_total[5m])) > 0.1` · `for: 5m` · critical  
Sem braço “qualquer ocorrência”.

### Ledger
```
max by (provider) (payment_ledger_received_total) > 0
and
max by (provider) (payment_ledger_received_age_seconds) > 900
```
`for: 2m` · warning · sem segundo alerta “elevated critical”.

### Retryable
`sum by (provider) (rate(payment_retryable_total{code="PAYMENT_NOT_FOUND"}[10m])) > 0.05` · `for: 10m` · warning

### Latency
```
histogram_quantile(
  0.95,
  sum by (provider, le) (
    rate(payment_webhook_processing_duration_seconds_bucket{outcome="applied"}[5m])
  )
) > 2
```
`for: 5m` · warning

### Processing error (uma regra)
Soma das rates dos dois counters do contrato por `provider` (nomes exatos):
`payment_webhook_processing_error_total` · `payment_webhook_verify_error_total`  
`for: 5m` · critical

---

## 3. Threshold semantics

| Valor | Significado |
|---|---|
| `0.1`/s | ≈ 6 rejects/min |
| `0.05`/s | ≈ 3 retryables/min |
| `900`s | 15 min oldest RECEIVED |
| `2`s | p95 applied |
| `for` | duração sustentada |

Documentado em plataforma (não altera o texto frozen do contrato D3-A neste PR).

---

## 4. Fora

Slack/Teams/e-mail/PagerDuty · Grafana Alerting · HA · K8s · mudança AM · dashboards · `apps/*`
