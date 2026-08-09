# Observabilidade local — Alert Rules (FASE 4.1-D3)

**Status:** Stable (local rules)  
**Escopo:** `rule_files` com os **5** alertas do [payment-alerts.md](../observability/payment-alerts.md) (D3-A)  
**Fora de escopo:** receivers reais, mudança de Alertmanager routing, dashboards, `apps/*`, métricas novas, contrato D3-A

Infra AM: [alertmanager-local.md](./alertmanager-local.md). Auditoria prévia: [alert-rules-audit.md](./alert-rules-audit.md).

**Freeze:** se precisar alterar aplicação ou contratos da Fase 3 → interromper e reportar.

---

## 1. Honesty

| Claim | Today |
|---|---|
| Prometheus `rule_files` | **Sim** — `infrastructure/observability/rules/payments-alerts.yml` |
| Catálogo | Exatamente 5 alertas D3-A |
| Alertmanager | Intocado (dummy `ops-local`) |
| Grafana Alerting | **Não** |

---

## 2. Threshold semantics (política operacional)

| Valor | Significado |
|---|---|
| `0.1` /s | ≈ **6** signature rejects / minuto |
| `0.05` /s | ≈ **3** `PAYMENT_NOT_FOUND` retryables / minuto |
| `900` s | **15** minutos — idade do RECEIVED mais antigo |
| `2` s | p95 processamento webhook (`outcome=applied`) |
| `for` | Duração **sustentada** (não confundir com a janela `[5m]`/`[10m]` do `rate`) |

Não interpretar `0.1` como “10%”.

---

## 3. Regras (espelho)

| alertname | severity | Agregação |
|---|---|---|
| `payment_signature_rejected_spike` | critical | `sum by (provider) (rate(...))` |
| `payment_ledger_received_stuck` | warning | `max by (provider)` **and** age — **nunca sum** |
| `payment_retryable_elevated` | warning | `code="PAYMENT_NOT_FOUND"` |
| `payment_webhook_latency_high` | warning | `histogram_quantile` + `sum by (provider, le)` |
| `payment_processing_error_spike` | critical | soma das rates de `processing_error` + `verify_error` por `provider` |

Nomes de métricas = Metrics Contract / `payment-metrics.ts` (sem aliases).

---

## 4. Arquivos

```text
infrastructure/observability/
  prometheus.yml                 # rule_files: /etc/prometheus/rules/*.yml
  rules/
    payments-alerts.yml
    README.md
```

Compose monta `./observability/rules` → `/etc/prometheus/rules:ro`.

---

## 5. Validar

```bash
docker compose -f infrastructure/docker-compose.yml up -d alert-webhook alertmanager prometheus
```

1. Prometheus → **Status → Rules**: group `payments_ops_v1`, 5 rules, estado OK.
2. `http://localhost:9090/api/v1/rules` contém os cinco `alertname`.
3. Alertmanager / dashboards / `apps/*` **sem** mudança neste marco.

Reload (se já estava up):

```bash
curl -sS -X POST http://localhost:9090/-/reload
# ou
docker compose -f infrastructure/docker-compose.yml restart prometheus
```

---

## 6. Próximo

**4.1-D4** — polish receivers + runbooks (silence / ops). Sem paging real.
