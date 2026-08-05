# Documentação — Plataforma Corredora DF

Índice central da documentação do projeto.

## Por área

| Pasta | Propósito |
|---|---|
| [adr/](./adr/) | Atalho → ADRs oficiais |
| [architecture/](./architecture/) | Visão arquitetural + [ADRs](./architecture/adr/) |
| [api/](./api/) | Contratos REST da API |
| [database/](./database/) | Modelagem e schemas |
| [design-system/](./design-system/) | Butterfly UI |
| [devlog/](./devlog/) | Registro de progresso por sprint |
| [engineering/](./engineering/) | Manual de engenharia ([handbook](./engineering/engineering-handbook.md) + 10 guias) |
| [observability/](./observability/) | Contratos de eventos / logs (FASE 3.5-B+) |
| [ops/](./ops/) | Runbooks operacionais (pagamentos — FASE 3.4-D) |
| [platform/](./platform/) | Plataforma local / ops stack (FASE 4.1+ — Prometheus, …) |
| [product/](./product/) | Produto, roadmap, personas |
| [setup/](./setup/) | Onboarding local e variáveis de ambiente |
| [ux/](./ux/) | Experiência do usuário e navegação |

## Documentos principais

- [Environment variables](./setup/environment.md) — inventário API / Web / Docker / CI
- [Payments runbook](./ops/payments-runbook.md) — rotação de secrets, smoke, troubleshooting
- [Observabilidade local (Prometheus)](./platform/observability-local.md) — scrape local de `/metrics` (FASE 4.1-B)
- [Grafana local](./platform/grafana-local.md) — provisioning Compose (FASE 4.1-C1)
- [Payment decision events](./observability/payment-events.md) — contrato canônico de logs de pagamento
- [Roadmap](./roadmap.md) — planejamento de 15 sprints até o MVP
- [API — índice](./api/README.md) — contrato Frontend ↔ Backend
- [Engineering — estrutura](./engineering/01-folder-structure.md) — onde colocar código

## Para novos membros do time

1. Ler [README raiz](../README.md) — visão geral e stack
2. Configurar envs: [setup/environment.md](./setup/environment.md)
3. Ler [engineering/engineering-handbook.md](./engineering/engineering-handbook.md) — manual oficial
4. Ler [engineering/01-folder-structure.md](./engineering/01-folder-structure.md) — estrutura de pastas (detalhe)
5. Ler [engineering/03-git-flow.md](./engineering/03-git-flow.md) — branches e commits
6. Consultar [roadmap.md](./roadmap.md) e [product/user-stories.md](./product/user-stories.md)
7. Ver último [devlog](./devlog/) — o que foi feito recentemente

## Estado atual

**Sprint 01 — Fundação:** ✅ Concluída  
**Sprint 02 — Butterfly UI:** 🔜 Próxima
