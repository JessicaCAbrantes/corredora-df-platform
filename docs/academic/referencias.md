# Referências

Bibliografia e documentação utilizada ou citada no projeto Corredora DF. Referências externas listadas apenas quando documentadas no repositório ou no contexto acadêmico do projeto.

## ODS e contexto extensionista

| Referência | Descrição |
|---|---|
| [ODS 8 — Trabalho Decente e Crescimento Econômico](https://sdgs.un.org/goals/goal8) | Objetivo de Desenvolvimento Sustentável relacionado ao ecossistema local do projeto |
| [Documentação da Atividade Extensionista](./atividade-extensionista.md) | Identificação, escopo e estrutura acadêmica |
| [Fase 1 — Diagnóstico](./fase-1-diagnostico.md) | Contexto de campo e público-alvo |
| [Corredora DF (@corredoradf)](https://www.instagram.com/corredoradf/) | Contexto comunitário observado na atividade |
| GRAN CURSOS ONLINE. *Atividade Extensionista 6: TI — Transformação Digital para Pequenos Negócios*. Material didático da disciplina. Faculdade Gran Cursos Online. Material institucional da disciplina; acesso conforme ambiente acadêmico. | Eixo teórico de Transformação Digital aplicado ao ecossistema local do projeto |

## Desenvolvimento web e arquitetura

Documentação interna (decisões registradas em ADRs):

| Referência | Tópico |
|---|---|
| [ADR-001 — Feature First](../architecture/adr/ADR-001-arquitetura-feature-first.md) | Organização do código |
| [ADR-002 — Monorepo Turborepo](../architecture/adr/ADR-002-monorepo-turborepo.md) | Estrutura do repositório |
| [ADR-004 — Next.js App Router](../architecture/adr/ADR-004-nextjs-app-router.md) | Frontend |
| [ADR-005 — NestJS](../architecture/adr/ADR-005-nestjs-backend.md) | Backend |
| [ADR-006 — PostgreSQL](../architecture/adr/ADR-006-postgresql.md) | Banco de dados |
| [ADR-007 — API REST](../architecture/adr/ADR-007-api-rest.md) | Contratos HTTP |
| [ADR-011 — Deployment Topology](../architecture/adr/ADR-011-deployment-topology.md) | Topologia de deploy (fase posterior ao MVP acadêmico) |
| [Índice de ADRs](../architecture/adr/README.md) | Decisões arquiteturais completas |
| [Michael Nygard — Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) | Metodologia ADR (citada no repositório) |

## Experiência do usuário e produto

| Referência | Tópico |
|---|---|
| [Product Vision](../product/product-vision.md) | Visão estratégica do produto |
| [User Journeys](../product/user-journeys.md) | Jornadas de usuário |
| [Home — Information Architecture](../product/home-information-architecture.md) | Arquitetura da Home |
| [UX — README](../ux/README.md) | Princípios de UX |
| [Design System — Butterfly UI](../design-system/README.md) | Identidade visual e componentes |

## Acessibilidade

| Referência | Tópico |
|---|---|
| [ADR-009 — Acessibilidade](../architecture/adr/ADR-009-acessibilidade.md) | Requisito arquitetural WCAG 2.1 AA |
| [Engineering — Accessibility](../engineering/05-accessibility.md) | Padrões de implementação |
| [WCAG 2.1 nível AA](https://www.w3.org/TR/WCAG21/) | Diretriz W3C (citada na documentação de engenharia) |

## Banco de dados e API

| Referência | Tópico |
|---|---|
| [Database — README](../database/README.md) | Modelagem e operação |
| [Seeding](../database/seeding.md) | Dados de demonstração (seed) |
| [API — README](../api/README.md) | Contratos REST |
| [Auth API](../api/auth.md) | Autenticação |
| [Events API](../api/events.md) | Corridas e inscrições |
| [Prisma Documentation](https://www.prisma.io/docs) | ORM utilizado (referência técnica da stack) |

## Engenharia de software

| Referência | Tópico |
|---|---|
| [Engineering Handbook](../engineering/engineering-handbook.md) | Manual de engenharia |
| [Git Flow](../engineering/03-git-flow.md) | Fluxo de branches |
| [Testing](../engineering/07-testing.md) | Estratégia de testes |
| [Security](../engineering/08-security.md) | Segurança |
| [Conventional Commits](https://www.conventionalcommits.org/) | Padrão de mensagens de commit (citado no repositório) |
| [Semantic Versioning](https://semver.org/) | Versionamento (citado no repositório) |

## Demonstração acadêmica (MVP congelado)

| Referência | Tópico |
|---|---|
| [Roteiro da demonstração](../testing/faculdade-mvp-demo-script.md) | Passos, credenciais seed, plano B |
| [Checkpoint F6](../testing/faculdade-mvp-f6-checkpoint.md) | Freeze e validação |
| [Repositório GitHub](https://github.com/JessicaCAbrantes/corredora-df-platform) | Código-fonte e histórico |

## Configuração local

| Referência | Tópico |
|---|---|
| [Environment setup](../setup/environment.md) | Variáveis e ambiente |
| [Observabilidade local](../platform/observability-local.md) | Prometheus (opcional, fora da demo principal) |
| [Grafana local](../platform/grafana-local.md) | Dashboards locais (opcional) |
