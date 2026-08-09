# Observabilidade local — Alertmanager (FASE 4.1-D2)

**Status:** Stable (local provisioning)  
**Escopo:** Alertmanager no Compose + `alertmanager.yml` + wire Prometheus → AM + webhook dummy interno  
**Fora de escopo:** regras de alerta (4.1-D3), receivers reais, HA, produção, `apps/*`

**Freeze (FASE 3):** a aplicação e os contratos de Payments / Metrics / Logs / Correlation / Dashboards estão congelados. Se qualquer necessidade exigir alteração em `apps/api`, `apps/web` ou nos contratos da Fase 3, **interromper** a implementação e reportar o bloqueio — não criar endpoints, métricas, mudanças em `/metrics` nem outras soluções alternativas.

Decisões congeladas: [alertmanager-audit.md](./alertmanager-audit.md) (4.1-D1).  
Prometheus: [observability-local.md](./observability-local.md).

---

## Critério de conclusão (4.1-D2)

| Critério | Esperado |
|---|---|
| Compose | `prometheus` + `alertmanager` sobem corretamente |
| Wire | Prometheus aponta para Alertmanager (`alertmanager:9093`) |
| Docs | Documentação de validação local atualizada (este arquivo) |
| Receivers | Nenhum receiver real (Slack / Teams / e-mail / PagerDuty) |

---

## 1. Honesty

| Claim | Today |
|---|---|
| Alertmanager local (Compose) | **Sim** — `:9093` |
| Prometheus → Alertmanager | **Sim** — `alerting.alertmanagers` em `prometheus.yml` |
| Receiver local dummy | **Sim** — `ops-local` → serviço `alert-webhook` (stdout) |
| `rule_files` / alertas D3-A live | **Não** (4.1-D3) |
| Slack / Teams / PagerDuty / e-mail | **Não** |
| Produção / HA | **Não** |

Sem regras, o AM sobe saudável e o Prometheus conhece o destino — ainda **não** há firing de alertas de pagamento.

---

## 2. Portas (congeladas)

| Serviço | URL |
|---|---|
| Next.js | `http://localhost:3000` |
| API | `http://localhost:3001` |
| Grafana | `http://localhost:3002` |
| Prometheus | `http://localhost:9090` |
| **Alertmanager** | `http://localhost:9093` |

`alert-webhook` **não** publica porta no host (só rede Compose).

---

## 3. Arquivos

```text
infrastructure/
  docker-compose.yml
  observability/
    prometheus.yml                         # + alerting → alertmanager:9093
    alertmanager/
      alertmanager.yml                     # rotas + ops-local
      README.md
```

| Parâmetro | Valor (audit D1) |
|---|---|
| Imagem AM | `prom/alertmanager:v0.27.0` |
| Volume | `alertmanager_data` → `/alertmanager` |
| `group_by` | `alertname`, `provider` |
| `group_wait` | `30s` |
| `group_interval` | `5m` |
| `repeat_interval` | `4h` |
| Receiver | `ops-local` → `http://alert-webhook:8080/` |

Rotas filhas discriminam `severity=critical` e `severity=warning` (mesmo receiver nesta fase).

---

## 4. Subir / parar

Pré-requisito do scrape (se for validar a stack completa): bearer + API — ver [observability-local.md](./observability-local.md) §3.

```bash
cp infrastructure/observability/secrets/bearer_token.example \
   infrastructure/observability/secrets/bearer_token

# Alertmanager + dummy + Prometheus (mínimo D2)
docker compose -f infrastructure/docker-compose.yml up -d alert-webhook alertmanager prometheus

# Stack observabilidade completa
docker compose -f infrastructure/docker-compose.yml up -d prometheus grafana alertmanager alert-webhook
```

Parar:

```bash
docker compose -f infrastructure/docker-compose.yml stop alertmanager alert-webhook
```

---

## 5. Validar

1. **Alertmanager UI** — [http://localhost:9093](http://localhost:9093) carrega; Status → Config mostra o `alertmanager.yml` montado.
2. **Prometheus → AM** — Prometheus → **Status → Runtime & Build Information** / **Alertmanagers** (ou `http://localhost:9090/api/v1/alertmanagers`): target `alertmanager:9093` ativo.
3. **Dummy webhook** — logs do container (ainda sem alertas de regra, o pipe existe):

```bash
docker compose -f infrastructure/docker-compose.yml logs --tail=50 alert-webhook
```

4. **Smoke de notificação (opcional, sem regras)** — POST manual na API do AM:

```bash
curl -sS -X POST http://localhost:9093/api/v2/alerts \
  -H "Content-Type: application/json" \
  -d "[{
    \"labels\":{\"alertname\":\"smoke_local\",\"severity\":\"warning\",\"provider\":\"stripe\"},
    \"annotations\":{\"summary\":\"4.1-D2 smoke\"}
  }]"
```

Após `group_wait` (~30s), `docker compose ... logs alert-webhook` deve mostrar o POST. Remova o alerta deixando expirar ou via UI.

---

## 6. Troubleshooting

| Sintoma | Verificação |
|---|---|
| Compose falha no Prometheus | Existe `secrets/bearer_token`? (§4) |
| AM não sobe | `docker compose ... logs alertmanager` — YAML inválido? |
| Prometheus sem Alertmanager | Confirmar `alerting:` em `prometheus.yml` e recreate prometheus |
| Webhook sem log no smoke | Aguardar `group_wait` 30s; `depends_on` / nome DNS `alert-webhook` |
| Porta 9093 ocupada | Outro processo local — liberar ou ajustar só em fork local (não no repo) |

---

## 7. O que D2 não inclui

- Regras dos 5 alertas D3-A (`rule_files`) — **4.1-D3**
- Runbooks de silence / polish de receivers — **4.1-D4**
- Qualquer integração de paging real
- Mudanças em `apps/*` ou contratos de observabilidade da app

---

## 8. Próximo

**4.1-D4** — Receivers + Runbooks polish.  
Alert rules: [alert-rules-local.md](./alert-rules-local.md).
