# Platform

Documentação da **plataforma operacional** (FASE 4+): coleta, armazenamento e visualização/alerta dos sinais produzidos pela aplicação.

A aplicação (FASE 3) permanece congelada — esta pasta **consome** contratos, não os redefine.

| Document | Description |
|---|---|
| [observability-local.md](./observability-local.md) | Prometheus local via Compose (FASE 4.1-B) |
| [grafana-local.md](./grafana-local.md) | Grafana local + provisioning + dashboard (FASE 4.1-C1 / C2) |
| [dashboard-as-code.md](./dashboard-as-code.md) | Fluxo edit → export → commit (FASE 4.1-C3) |

Contratos da aplicação (somente leitura):

- [Payment metrics](../observability/payment-metrics.md)
- [Dashboards](../observability/payment-dashboards.md)
- [Alerts](../observability/payment-alerts.md)
