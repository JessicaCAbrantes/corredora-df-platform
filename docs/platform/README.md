# Platform

Documentação da **plataforma operacional** (FASE 4+): coleta, armazenamento e (futuro) visualização/alerta dos sinais produzidos pela aplicação.

A aplicação (FASE 3) permanece congelada — esta pasta **consome** contratos, não os redefine.

| Document | Description |
|---|---|
| [observability-local.md](./observability-local.md) | Prometheus local via Compose (FASE 4.1-B) |
| [grafana-local.md](./grafana-local.md) | Grafana local + provisioning (FASE 4.1-C1) |

Contratos da aplicação (somente leitura):

- [Payment metrics](../observability/payment-metrics.md)
- [Dashboards](../observability/payment-dashboards.md)
- [Alerts](../observability/payment-alerts.md)
