# Observabilidade local — Alertmanager (FASE 4.1-D2)

**Status:** Stable (local provisioning)  
**Escopo:** Alertmanager no Compose + `alertmanager.yml` + wire Prometheus → AM + webhook dummy interno  
**Fora de escopo:** receivers reais, HA, produção, `apps/*`

**Freeze (FASE 3):** a aplicação e os contratos permanecem congelados. Se precisar alterá-los → interromper e reportar.

Decisões: [alertmanager-audit.md](./alertmanager-audit.md).  
Ops (silence / smoke / mapa): [alertmanager-ops.md](./alertmanager-ops.md) (FASE 4.1-D4).  
Rules: [alert-rules-local.md](./alert-rules-local.md).

---

## Critério de conclusão (4.1-D2)

| Critério | Esperado |
|---|---|
| Compose | `prometheus` + `alertmanager` sobem |
| Wire | Prometheus → `alertmanager:9093` |
| Docs | Este arquivo |
| Receivers | Nenhum receiver real |

---

## 1. Honesty

| Claim | Today |
|---|---|
| Alertmanager local | **Sim** — `:9093` |
| Prometheus → Alertmanager | **Sim** |
| Receiver dummy `ops-local` | **Sim** → `alert-webhook` |
| Alert rules D3-A | **Sim** — [alert-rules-local.md](./alert-rules-local.md) |
| Slack / Teams / PagerDuty / e-mail | **Não** |
| Ops silence / smoke documentados | **Sim** — [alertmanager-ops.md](./alertmanager-ops.md) |

---

## 2. Portas

| Serviço | URL |
|---|---|
| Grafana | `http://localhost:3002` |
| Prometheus | `http://localhost:9090` |
| **Alertmanager** | `http://localhost:9093` |

`alert-webhook` sem porta no host.

---

## 3. Arquivos / parâmetros

```text
infrastructure/observability/alertmanager/alertmanager.yml
```

| Parâmetro | Valor |
|---|---|
| `group_by` | `alertname`, `provider` |
| `group_wait` | `30s` |
| `group_interval` | `5m` |
| `repeat_interval` | `4h` |
| Receiver | `ops-local` → `http://alert-webhook:8080/` |

Detalhe operacional (mapa, silence, anti-storm, smoke): **[alertmanager-ops.md](./alertmanager-ops.md)**.

---

## 4. Subir / parar

```bash
cp infrastructure/observability/secrets/bearer_token.example \
   infrastructure/observability/secrets/bearer_token

docker compose -f infrastructure/docker-compose.yml up -d alert-webhook alertmanager prometheus
```

Parar: `docker compose -f infrastructure/docker-compose.yml stop alertmanager alert-webhook`

---

## 5. Validação rápida (wiring)

1. UI AM `:9093` sobe.
2. Prometheus `activeAlertmanagers` → `alertmanager:9093`.
3. Smoke + silence: seguir [alertmanager-ops.md §6](./alertmanager-ops.md#6-smoke-test-local-sem-paging-real)  
   (silence **não** apaga o alerta do AM — só bloqueia entrega ao receiver).

---

## 6. Troubleshooting (wiring)

Ver [alertmanager-ops.md §7](./alertmanager-ops.md#7-troubleshooting--validação) e [observability-local.md](./observability-local.md).

---

## 7. Fora de escopo (D2/D4)

Receivers reais · secrets de paging · mudança de `group_*` · produção / HA · `apps/*`
