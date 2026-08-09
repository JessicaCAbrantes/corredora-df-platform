# Platform

Documentação da **plataforma operacional** (FASE 4+): coleta, armazenamento e visualização/alerta dos sinais produzidos pela aplicação.

A aplicação (FASE 3) permanece congelada — esta pasta **consome** contratos, não os redefine.

| Document | Description |
|---|---|
| [observability-local.md](./observability-local.md) | Prometheus local via Compose (FASE 4.1-B) |
| [grafana-local.md](./grafana-local.md) | Grafana local + provisioning + dashboard (FASE 4.1-C1 / C2) |
| [dashboard-as-code.md](./dashboard-as-code.md) | Fluxo edit → export → commit (FASE 4.1-C3) |
| [alertmanager-audit.md](./alertmanager-audit.md) | Auditoria Alertmanager — decisões congeladas (FASE 4.1-D1) |
| [alertmanager-local.md](./alertmanager-local.md) | Alertmanager local + wire Prometheus (FASE 4.1-D2) |
| [alert-rules-audit.md](./alert-rules-audit.md) | Auditoria Alert Rules (FASE 4.1-D3) |
| [alert-rules-local.md](./alert-rules-local.md) | Prometheus rule_files — 5 alertas D3-A (FASE 4.1-D3) |
| [receivers-runbooks-audit.md](./receivers-runbooks-audit.md) | Auditoria Receivers + Runbooks (FASE 4.1-D4) |
| [alertmanager-ops.md](./alertmanager-ops.md) | Ops: mapa, silence, smoke, anti-storm (FASE 4.1-D4) |

Contratos da aplicação (somente leitura):

- [Payment metrics](../observability/payment-metrics.md)
- [Dashboards](../observability/payment-dashboards.md)
- [Alerts](../observability/payment-alerts.md)
