# Fase 2 — Ação extensionista

Documentação da execução da atividade: da identificação de necessidades ao MVP acadêmico funcional.

## Justificativa

A corrida de rua no Distrito Federal mobiliza corredores, eventos, organizadores, assessorias, influenciadores e parceiros, mas as informações sobre provas, inscrições, kits e serviços relacionados circulam de forma **fragmentada** em múltiplos canais digitais.

A atividade extensionista parte de observação de campo — contato com Jenifer ([@corredoradf](https://www.instagram.com/corredoradf/)) e participação em corrida de rua — para propor uma solução tecnológica que **centralize e organize** essas informações, alinhada ao eixo de Transformação Digital da disciplina.

A proposta justifica-se como aplicação de conhecimentos de Ciência da Computação a um problema real da comunidade local, com escopo acadêmico deliberadamente limitado: demonstrar jornada funcional do corredor, sem caracterizar o entregável como produto comercial ou sistema de gestão para pequenos negócios.

## Objetivo geral

Desenvolver uma proposta tecnológica que centralize e organize informações relevantes ao ecossistema de corrida de rua no Distrito Federal, demonstrando integração entre frontend, backend, autenticação e persistência de dados, com validação de jornada real em ambiente local.

## Objetivos específicos

1. Diagnosticar necessidades do ecossistema de corrida de rua no DF a partir de observação de campo e contato comunitário.
2. Definir escopo de MVP acadêmico focado na jornada do corredor autenticado.
3. Desenvolver interface web com identidade visual inicial e navegação da demonstração acadêmica.
4. Implementar autenticação, sessão e logout com integração entre frontend e API.
5. Disponibilizar listagem, detalhes de corridas, inscrição e acompanhamento de kits com persistência em PostgreSQL.
6. Validar a jornada **Descobrir → Autenticar → Inscrever → Acompanhar → Sair** em ambiente local (checkpoint F6).
7. Documentar resultados, limites e evidências da atividade extensionista de forma transparente.

## Resultados esperados

| Resultado | Descrição |
|---|---|
| Diagnóstico documentado | Contexto, problema, público e relação com ODS 8 registrados na Fase 1 |
| MVP funcional | Plataforma web executável localmente com jornada principal do corredor |
| Integração técnica | Frontend (Next.js), API (NestJS) e banco (PostgreSQL) operando em conjunto |
| Validação demonstrável | Smoke F6 e roteiro de demonstração acadêmica |
| Transparência acadêmica | Limites explícitos: ambiente local, sem deploy público, sem produto comercial |
| Evidências | Documentação das três fases, referências e material audiovisual conforme exigência institucional |

## Materiais utilizados

### Materiais da atividade extensionista

| Material | Uso na atividade |
|---|---|
| Material didático *Transformação Digital para Pequenos Negócios* (Gran Cursos Online) | Eixo teórico e orientação curricular da disciplina |
| Contato com Jenifer / [@corredoradf](https://www.instagram.com/corredoradf/) | Observação do contexto comunitário de corrida no DF |
| Participação em corrida de rua | Diagnóstico in loco da fragmentação de informações |
| Documentação interna do projeto | ADRs, guias de UX, roteiro e checkpoint da demo acadêmica |

### Ferramentas técnicas de desenvolvimento

Ferramentas de implementação, versionamento e execução local — detalhadas na seção [Solução tecnológica](#solução-tecnológica) abaixo (Next.js, NestJS, PostgreSQL, Prisma, Git, GitHub, Docker Compose, entre outras).

## Metodologia de desenvolvimento

O trabalho seguiu ciclos iterativos de diagnóstico, escopo, implementação, testes e validação documental, com congelamento explícito do MVP antes da apresentação acadêmica.

## Etapas executadas

| # | Etapa | Descrição |
|---|---|---|
| 1 | Diagnóstico da realidade local | Observação do ecossistema de corrida no DF |
| 2 | Observação do contexto | Contato com @corredoradf e participação em prova |
| 3 | Identificação das necessidades | Fragmentação de informações sobre eventos e kits |
| 4 | Levantamento de requisitos | Jornada mínima e catálogo de funcionalidades |
| 5 | Planejamento da experiência do usuário | Home visitante vs autenticada, navegação da demo |
| 6 | Definição da identidade visual | Marca Corredora DF e Butterfly UI (design system interno) |
| 7 | Desenvolvimento da Home | Hero, eventos em destaque, footer da jornada |
| 8 | Implementação da autenticação | Login, sessão HttpOnly, logout |
| 9 | Integração frontend/backend | Next.js consumindo API NestJS |
| 10 | Implementação das corridas | Listagem e navegação para detalhes |
| 11 | Detalhes dos eventos | Página por slug, informações da prova |
| 12 | Inscrição | Registro persistido via API |
| 13 | Acompanhamento dos kits | Meus kits somente leitura |
| 14 | Perfil | Identidade básica do usuário autenticado |
| 15 | Testes | Suítes automatizadas Web/API + smoke manual |
| 16 | Validação da jornada | F6 — navegador, API, PostgreSQL, sessão |
| 17 | Documentação e preparação | Roteiro, checkpoint, evidência audiovisual |

## Solução tecnológica

### Frontend

| Tecnologia | Uso |
|---|---|
| [Next.js](../architecture/adr/ADR-004-nextjs-app-router.md) | App Router, rotas públicas em português |
| React | Componentes e estados de interface |
| TypeScript | Tipagem estática |
| Tailwind CSS | Estilização utilitária |
| Butterfly UI | Design system interno ([ADR-003](../architecture/adr/ADR-003-butterfly-ui-design-system.md)) |

### Backend

| Tecnologia | Uso |
|---|---|
| [NestJS](../architecture/adr/ADR-005-nestjs-backend.md) | API REST modular |
| Node.js | Runtime do servidor |
| [Prisma](https://www.prisma.io/docs) | ORM e migrations |

### Banco de dados

| Tecnologia | Uso |
|---|---|
| [PostgreSQL](../architecture/adr/ADR-006-postgresql.md) | Persistência relacional |

### Ferramentas e processo

| Ferramenta | Uso |
|---|---|
| Git | Controle de versão |
| GitHub | Repositório remoto e colaboração |
| VS Code / Cursor | Ambiente de desenvolvimento |
| Turborepo | Monorepo ([ADR-002](../architecture/adr/ADR-002-monorepo-turborepo.md)) |
| Docker Compose | PostgreSQL local (desenvolvimento) |

Documentação de ambiente: [setup/environment.md](../setup/environment.md).

## Arquitetura (visão simplificada)

```text
Corredor (navegador)
        │
        ▼
   Next.js / Web (:3000)
        │
   HTTP + cookie HttpOnly
        │
        ▼
   NestJS / API (:3001)
        │
      Prisma
        │
        ▼
   PostgreSQL (:5433 local)
```

Contratos da API: [docs/api/README.md](../api/README.md).

## Natureza do entregável

A solução atual é um **MVP acadêmico funcional**:

- demonstra jornada de ponta a ponta com persistência real;
- não equivale a produto comercial pronto para produção;
- não inclui deploy público, cadastro aberto, nem todas as superfícies previstas no backlog de produto.

Roteiro de demonstração: [faculdade-mvp-demo-script.md](../testing/faculdade-mvp-demo-script.md).

## Congelamento (F6)

Após validação, F1–F5 e o escopo da demo foram **congelados**. Alterações de código, infraestrutura ou novas funcionalidades ficam suspensas até nova autorização explícita pós-apresentação.

Detalhes: [faculdade-mvp-f6-checkpoint.md](../testing/faculdade-mvp-f6-checkpoint.md).
