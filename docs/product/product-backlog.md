# Product Backlog — Plataforma Corredora DF

**PB-029** · Fonte oficial para planejamento de Sprints e criação de User Stories.

| Campo | Valor |
|---|---|
| **Status** | Aprovado |
| **Versão** | 1.1 |
| **Última atualização** | 2026-07-13 |
| **Audiência** | Produto, engenharia, design, QA e stakeholders |
| **Priorização** | MoSCoW (Must / Should / Could / Won't) |

---

## 1. Referências

Este backlog consolida:

| Documento | Uso |
|---|---|
| [product-vision.md](./product-vision.md) | Missão, personas, North Star, KPIs |
| [home-information-architecture.md](./home-information-architecture.md) | Escopo da Home |
| [user-journeys.md](./user-journeys.md) | Jornadas J1–J5 e indicadores |
| [roadmap.md](../roadmap.md) | Cadência de sprints 01–15 |
| [adr/](../adr/) | Decisões arquiteturais |
| [engineering/](../engineering/) | Padrões de entrega |
| [api/](../api/) | Contratos por domínio |
| [architecture/](../architecture/README.md) | Fronteiras apps/web · api · packages |

**North Star:** Inscrições confirmadas em eventos por mês.

### Convenções

| Termo | Significado |
|---|---|
| **Must** | Obrigatório no MVP |
| **Should** | Importante; entra no MVP se houver capacidade |
| **Could** | Desejável; pós-MVP ou se sobrar sprint |
| **Won't** | Fora do escopo atual (registrado) |
| **Planned** | Ainda não iniciada |
| **In Progress** | Em execução |
| **Done** | Entregue |

---

## 2. Resumo por Épico

| Épico | Features | Must | Should | Could | Won't | Done | In Progress | Planned |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| EP-01 Fundação | 9 | 9 | 0 | 0 | 0 | 2 | 1 | 6 |
| EP-02 Experiência Pública | 8 | 4 | 2 | 2 | 0 | 0 | 0 | 8 |
| EP-03 Área do Corredor | 7 | 5 | 1 | 0 | 1 | 0 | 0 | 7 |
| EP-04 Administração | 5 | 3 | 1 | 0 | 1 | 0 | 0 | 5 |
| EP-05 Marketplace | 4 | 2 | 1 | 0 | 1 | 0 | 0 | 4 |
| EP-06 Comunidade | 5 | 2 | 1 | 1 | 1 | 0 | 0 | 5 |
| EP-07 Analytics | 4 | 1 | 1 | 1 | 1 | 0 | 0 | 4 |
| **Total** | **42** | **26** | **7** | **4** | **5** | **2** | **1** | **39** |

---

## 3. EP-01 — Fundação

| Campo | Detalhe |
|---|---|
| **Objetivo** | Estabelecer bases técnicas, design system, layout, qualidade e deploy para desenvolver o produto com velocidade e consistência |
| **Valor para o usuário** | Experiência estável, acessível, rápida e confiável em qualquer módulo |
| **Valor para o negócio** | Reduz risco técnico, acelera entregas e viabiliza o MVP em produção |
| **Dependências** | Nenhuma (épico base) |
| **Sprint sugerida** | 01–03 (core) · 13–14 (testes e deploy) |

### Resumo EP-01

| Features | Must | Should | Could | Won't | Status predominante |
|---:|---:|---:|---:|---:|---|
| 9 | 9 | 0 | 0 | 0 | Parcial (2 Done · 1 In Progress) |

### Features

#### F-01.01 — Monorepo e arquitetura frontend

| Campo | Detalhe |
|---|---|
| **Descrição** | Workspace pnpm + Turborepo; `apps/web` App Router; Feature-Based Design; packages e docs enterprise |
| **Prioridade** | Must |
| **Critérios de aceite** | Monorepo buildável; web sobe; features em `features/`; estrutura alinhada ao manual de engenharia |
| **Dependências** | — |
| **Status** | Done |

#### F-01.02 — Butterfly UI (design system)

| Campo | Detalhe |
|---|---|
| **Descrição** | Tokens, temas light/dark, componentes base, Navbar, Hero; integração Tailwind; pacote `@corredora/ui` |
| **Prioridade** | Must |
| **Critérios de aceite** | Tokens com valores; componentes exportáveis; playground funcional; estilos `butterfly-*` aplicados |
| **Dependências** | F-01.01 |
| **Status** | In Progress |

#### F-01.03 — Layout e AppShell

| Campo | Detalhe |
|---|---|
| **Descrição** | AppShell, Navbar/Header, Footer, MobileMenu; navegação tipada em `constants/navigation.ts` |
| **Prioridade** | Must |
| **Critérios de aceite** | Layout responsivo; menu completo; footer com links legais; drawer &lt; md |
| **Dependências** | F-01.02 |
| **Status** | Planned |

#### F-01.04 — Contratos de API

| Campo | Detalhe |
|---|---|
| **Descrição** | Documentação API-first em `docs/api/`; response pattern, erros, paginação, versionamento `/api/v1` |
| **Prioridade** | Must |
| **Critérios de aceite** | Domínios principais documentados; gaps da Home formalizados |
| **Dependências** | F-01.01 |
| **Status** | Done |

#### F-01.05 — Acessibilidade e performance

| Campo | Detalhe |
|---|---|
| **Descrição** | Baseline WCAG 2.1 AA e performance Server-first |
| **Prioridade** | Must |
| **Critérios de aceite** | Um h1/página; foco visível; contraste; auditoria Home no release |
| **Dependências** | F-01.02, F-01.03 |
| **Status** | Planned |

#### F-01.06 — Segurança e LGPD

| Campo | Detalhe |
|---|---|
| **Descrição** | Práticas de segurança, consentimento, termos e privacidade |
| **Prioridade** | Must |
| **Critérios de aceite** | Legais linkados; secrets fora do git; auth segura |
| **Dependências** | F-01.03, F-03.01 |
| **Status** | Planned |

#### F-01.07 — Testes e qualidade

| Campo | Detalhe |
|---|---|
| **Descrição** | Unitários, integração e E2E (Playwright) nas jornadas críticas |
| **Prioridade** | Must |
| **Critérios de aceite** | E2E Home→evento→inscrição; login; cupom; smoke pós-deploy |
| **Dependências** | Features das jornadas |
| **Status** | Planned |

#### F-01.08 — CI/CD e deploy

| Campo | Detalhe |
|---|---|
| **Descrição** | Pipeline, staging, produção, Docker; release v1.0.0 |
| **Prioridade** | Must |
| **Critérios de aceite** | Deploy staging + production; checklist de release |
| **Dependências** | F-01.07 |
| **Status** | Planned |

#### F-01.09 — Backend NestJS + PostgreSQL

| Campo | Detalhe |
|---|---|
| **Descrição** | `apps/api` NestJS, Prisma, PostgreSQL; endpoints alinhados aos contratos |
| **Prioridade** | Must |
| **Critérios de aceite** | Events, auth, partners, coupons, kits operacionais em `/api/v1` |
| **Dependências** | F-01.04 |
| **Status** | Planned |

---

## 4. EP-02 — Experiência Pública

| Campo | Detalhe |
|---|---|
| **Objetivo** | Entregar a face pública da plataforma — descoberta de valor sem login obrigatório |
| **Valor para o usuário** | Entende o produto, encontra corridas, parceiros e conteúdo sem fricção |
| **Valor para o negócio** | Topo do funil: aquisição, SEO e conversão para cadastro/inscrição |
| **Dependências** | EP-01 |
| **Sprint sugerida** | 04–06 · 08 · 10 |

### Resumo EP-02

| Features | Must | Should | Could | Won't | Status predominante |
|---:|---:|---:|---:|---:|---|
| 8 | 4 | 2 | 2 | 0 | Planned |

### Features

#### F-02.01 — Home (Information Architecture)

| Campo | Detalhe |
|---|---|
| **Descrição** | Página `/` com as 11 seções oficiais (Navbar → Footer) em `features/home/` |
| **Prioridade** | Must |
| **Critérios de aceite** | Seções conforme IA; um h1; `#main-content`; estados vazios; CTA por seção |
| **Dependências** | F-01.02, F-01.03 |
| **Status** | Planned |

#### F-02.02 — Listagem e detalhe de corridas

| Campo | Detalhe |
|---|---|
| **Descrição** | `/corridas` com filtros; `/corridas/{slug}` com detalhe completo |
| **Prioridade** | Must |
| **Critérios de aceite** | Paginação; filtros; status de inscrição; empty state; SEO básico |
| **Dependências** | F-02.01, F-01.09 |
| **Status** | Planned |

#### F-02.03 — Evento em destaque e próximas corridas

| Campo | Detalhe |
|---|---|
| **Descrição** | Seções da Home: um destaque + 3–6 próximas; fallback sem featured |
| **Prioridade** | Must |
| **Critérios de aceite** | Um destaque; exclusão do destaque da lista; “Ver todas” → `/corridas` |
| **Dependências** | F-02.01, F-02.02 |
| **Status** | Planned |

#### F-02.04 — Vitrine e detalhe de parceiros

| Campo | Detalhe |
|---|---|
| **Descrição** | `/parceiros`, `/parceiros/{slug}`, logo wall na Home |
| **Prioridade** | Must |
| **Critérios de aceite** | Apenas ativos; categorias; CTA para cupom quando houver |
| **Dependências** | F-01.03, F-05.01 |
| **Status** | Planned |

#### F-02.05 — Blog público

| Campo | Detalhe |
|---|---|
| **Descrição** | `/blog`, `/blog/{slug}`, 3 artigos na Home |
| **Prioridade** | Should |
| **Critérios de aceite** | Listagem; categorias; reading time; SEO meta |
| **Dependências** | F-01.03; ideal F-04.03 |
| **Status** | Planned |

#### F-02.06 — Concierge

| Campo | Detalhe |
|---|---|
| **Descrição** | Formulário `/concierge`; links no Footer e fluxos de kit |
| **Prioridade** | Should |
| **Critérios de aceite** | Formulário acessível; validação; confirmação; LGPD |
| **Dependências** | F-01.03 |
| **Status** | Planned |

#### F-02.07 — Newsletter

| Campo | Detalhe |
|---|---|
| **Descrição** | Captura de e-mail na Home; consentimento; stub até API |
| **Prioridade** | Could |
| **Critérios de aceite** | Campo e-mail; consentimento; feedback sucesso/erro |
| **Dependências** | F-02.01 |
| **Status** | Planned |

#### F-02.08 — Ads / banners

| Campo | Detalhe |
|---|---|
| **Descrição** | Banners `GET /ads` com tracking de impressão/clique |
| **Prioridade** | Could |
| **Critérios de aceite** | Posição `home_banner`; impression/click registrados |
| **Dependências** | F-05.02 |
| **Status** | Planned |

---

## 5. EP-03 — Área do Corredor

| Campo | Detalhe |
|---|---|
| **Objetivo** | Habilitar conta, inscrição, kits, cupons e perfil — jornada autenticada |
| **Valor para o usuário** | Conclui inscrição, gerencia kits/benefícios e acompanha sua conta |
| **Valor para o negócio** | North Star (inscrições) e retenção D30 |
| **Dependências** | EP-01 · EP-02 · F-01.09 |
| **Sprint sugerida** | 05 · 07 · 11 |

### Resumo EP-03

| Features | Must | Should | Could | Won't | Status predominante |
|---:|---:|---:|---:|---:|---|
| 7 | 5 | 1 | 0 | 1 | Planned |

### Features

#### F-03.01 — Autenticação

| Campo | Detalhe |
|---|---|
| **Descrição** | Cadastro, login, logout, sessão e returnUrl |
| **Prioridade** | Must |
| **Critérios de aceite** | Fluxos auth; erros claros; rotas protegidas; returnUrl |
| **Dependências** | F-01.09, F-01.06 |
| **Status** | Planned |

#### F-03.02 — Inscrição em evento

| Campo | Detalhe |
|---|---|
| **Descrição** | Confirmar/cancelar inscrição; estados full/closed/already registered |
| **Prioridade** | Must |
| **Critérios de aceite** | Confirmação; erros da API; badge “Já inscrito”; CTA para kit |
| **Dependências** | F-02.02, F-03.01 |
| **Status** | Planned |

#### F-03.03 — Retirada de kits

| Campo | Detalhe |
|---|---|
| **Descrição** | `/kits` e detalhe; status; tamanho; janela de retirada (gap API) |
| **Prioridade** | Must |
| **Critérios de aceite** | Lista pendentes; empty state; conteúdo educativo para anônimo |
| **Dependências** | F-03.02 |
| **Status** | Planned |

#### F-03.04 — Cupons do corredor

| Campo | Detalhe |
|---|---|
| **Descrição** | Listar, detalhar e resgatar cupons; teaser anônimo na Home |
| **Prioridade** | Must |
| **Critérios de aceite** | Resgate; validade; empty state; CTA de cadastro no teaser |
| **Dependências** | F-03.01, F-05.01 |
| **Status** | Planned |

#### F-03.05 — Perfil do corredor

| Campo | Detalhe |
|---|---|
| **Descrição** | `/profile` — dados básicos, avatar, preferências |
| **Prioridade** | Must |
| **Critérios de aceite** | Ver/editar dados; logout; link no Navbar autenticado |
| **Dependências** | F-03.01 |
| **Status** | Planned |

#### F-03.06 — Notificações in-app

| Campo | Detalhe |
|---|---|
| **Descrição** | Lista, contagem não lidas, marcar como lida |
| **Prioridade** | Should |
| **Critérios de aceite** | Badge no Navbar; lista; marcar lida |
| **Dependências** | F-03.01 |
| **Status** | Planned |

#### F-03.07 — Wishlist de eventos

| Campo | Detalhe |
|---|---|
| **Descrição** | Salvar interesse em evento sem inscrição imediata |
| **Prioridade** | Won't |
| **Critérios de aceite** | Salvar/remover; lista no perfil (pós-MVP) |
| **Dependências** | F-02.02 |
| **Status** | Planned |

---

## 6. EP-04 — Administração

| Campo | Detalhe |
|---|---|
| **Objetivo** | Dar à equipe Corredora DF controle operacional de conteúdo, eventos e usuários |
| **Valor para o usuário** | Informações confiáveis e atualizadas (indireto) |
| **Valor para o negócio** | Escala operacional; mitiga risco de conteúdo desatualizado |
| **Dependências** | EP-01 · F-03.01 · F-01.09 |
| **Sprint sugerida** | 12 |

### Resumo EP-04

| Features | Must | Should | Could | Won't | Status predominante |
|---:|---:|---:|---:|---:|---|
| 5 | 3 | 1 | 0 | 1 | Planned |

### Features

#### F-04.01 — Painel admin e RBAC

| Campo | Detalhe |
|---|---|
| **Descrição** | Área `/admin` (ou `apps/admin`); roles; dashboard e navegação |
| **Prioridade** | Must |
| **Critérios de aceite** | Acesso só admin; dashboard básico; Sidebar admin |
| **Dependências** | F-03.01 |
| **Status** | Planned |

#### F-04.02 — CRUD de eventos e kits

| Campo | Detalhe |
|---|---|
| **Descrição** | Publicar/atualizar eventos e kits; featured; janelas de retirada |
| **Prioridade** | Must |
| **Critérios de aceite** | CRUD; validações; refletido no público |
| **Dependências** | F-04.01, F-02.02 |
| **Status** | Planned |

#### F-04.03 — CRUD de blog, parceiros e cupons

| Campo | Detalhe |
|---|---|
| **Descrição** | Gestão de posts, parceiros e cupons sem redeploy |
| **Prioridade** | Must |
| **Critérios de aceite** | Publicar/desativar; vínculo cupom↔parceiro |
| **Dependências** | F-04.01 |
| **Status** | Planned |

#### F-04.04 — Gestão de usuários e moderação

| Campo | Detalhe |
|---|---|
| **Descrição** | Listar usuários; roles; moderar posts da comunidade |
| **Prioridade** | Should |
| **Critérios de aceite** | Lista usuários; ações de moderação |
| **Dependências** | F-04.01, EP-06 |
| **Status** | Planned |

#### F-04.05 — Self-service de organizador

| Campo | Detalhe |
|---|---|
| **Descrição** | Organizador publica e gerencia eventos sem a equipe |
| **Prioridade** | Won't |
| **Critérios de aceite** | Onboarding; permissões de organizador (pós-MVP) |
| **Dependências** | F-04.02 |
| **Status** | Planned |

---

## 7. EP-05 — Marketplace

| Campo | Detalhe |
|---|---|
| **Objetivo** | Fortalecer e monetizar o ecossistema de parceiros (vitrine, cupons, campanhas) |
| **Valor para o usuário** | Benefícios tangíveis e marcas relevantes do DF |
| **Valor para o negócio** | Receita, CAC indireto e meta de parceiros ativos |
| **Dependências** | EP-02 · EP-03 |
| **Sprint sugerida** | 06–07 · pós-MVP (dashboard) |

### Resumo EP-05

| Features | Must | Should | Could | Won't | Status predominante |
|---:|---:|---:|---:|---:|---|
| 4 | 2 | 1 | 0 | 1 | Planned |

### Features

#### F-05.01 — Modelo de parceiros e benefícios

| Campo | Detalhe |
|---|---|
| **Descrição** | Entidade partner, benefits e vínculo a eventos/cupons |
| **Prioridade** | Must |
| **Critérios de aceite** | Partner ativo com benefits; link para cupom quando existir |
| **Dependências** | F-02.04, F-04.03 |
| **Status** | Planned |

#### F-05.02 — Campanhas e cupons patrocinados

| Campo | Detalhe |
|---|---|
| **Descrição** | Cupons com partnerId; featured; tracking básico de resgate |
| **Prioridade** | Must |
| **Critérios de aceite** | Criar cupom no admin; resgate; métricas básicas |
| **Dependências** | F-03.04, F-05.01 |
| **Status** | Planned |

#### F-05.03 — Dashboard do parceiro

| Campo | Detalhe |
|---|---|
| **Descrição** | Área do parceiro com impressões, cliques e resgates |
| **Prioridade** | Won't |
| **Critérios de aceite** | Login parceiro; métricas cupom/ads (pós-MVP) |
| **Dependências** | F-05.02, EP-07 |
| **Status** | Planned |

#### F-05.04 — Pricing e contratos comerciais

| Campo | Detalhe |
|---|---|
| **Descrição** | Modelo de cobrança (patrocínio, featured, fee) documentado |
| **Prioridade** | Should |
| **Critérios de aceite** | Pricing aprovado; pelo menos 1 pacote vendável no launch |
| **Dependências** | Negócios + F-04.01 |
| **Status** | Planned |

---

## 8. EP-06 — Comunidade

| Campo | Detalhe |
|---|---|
| **Objetivo** | Criar espaço social nativo: feed, interação, grupos e rankings |
| **Valor para o usuário** | Pertencimento, troca de experiências e motivação |
| **Valor para o negócio** | Retenção, MAU e diferencial vs listagens genéricas |
| **Dependências** | F-03.01 · seed de conteúdo |
| **Sprint sugerida** | 09 |

### Resumo EP-06

| Features | Must | Should | Could | Won't | Status predominante |
|---:|---:|---:|---:|---:|---|
| 5 | 2 | 1 | 1 | 1 | Planned |

### Features

#### F-06.01 — Feed de posts

| Campo | Detalhe |
|---|---|
| **Descrição** | `/comunidade`; criar/listar posts; teaser na Home |
| **Prioridade** | Must |
| **Critérios de aceite** | Feed autenticado; criar post; empty state com seed; teaser anônimo |
| **Dependências** | F-03.01 |
| **Status** | Planned |

#### F-06.02 — Curtidas e comentários

| Campo | Detalhe |
|---|---|
| **Descrição** | Like, comentários e detalhe do post |
| **Prioridade** | Must |
| **Critérios de aceite** | Like toggle; comentário; contagens atualizadas |
| **Dependências** | F-06.01 |
| **Status** | Planned |

#### F-06.03 — Grupos

| Campo | Detalhe |
|---|---|
| **Descrição** | Listar grupos; join; segmentos por distância/região |
| **Prioridade** | Should |
| **Critérios de aceite** | Listar; join; empty state |
| **Dependências** | F-06.01 |
| **Status** | Planned |

#### F-06.04 — Rankings

| Campo | Detalhe |
|---|---|
| **Descrição** | Rankings de participação/atividade |
| **Prioridade** | Could |
| **Critérios de aceite** | Ranking visível para autenticados |
| **Dependências** | F-06.01 |
| **Status** | Planned |

#### F-06.05 — Integração pós-prova / grupo do evento

| Campo | Detalhe |
|---|---|
| **Descrição** | Prompt pós-evento e grupo vinculado à corrida |
| **Prioridade** | Won't |
| **Critérios de aceite** | Prompt pós-evento; join sugerido (pós-MVP) |
| **Dependências** | F-03.02, F-06.03 |
| **Status** | Planned |

---

## 9. EP-07 — Analytics

| Campo | Detalhe |
|---|---|
| **Objetivo** | Instrumentar funis, North Star e KPIs para decisões orientadas a dados |
| **Valor para o usuário** | Produto melhorado com base em evidências (indireto) |
| **Valor para o negócio** | Medir sucesso; provar valor a parceiros; priorizar backlog |
| **Dependências** | Features instrumentáveis (EP-02 a EP-06) |
| **Sprint sugerida** | 13–15 · contínuo pós-MVP |

### Resumo EP-07

| Features | Must | Should | Could | Won't | Status predominante |
|---:|---:|---:|---:|---:|---|
| 4 | 1 | 1 | 1 | 1 | Planned |

### Features

#### F-07.01 — Instrumentação de funil

| Campo | Detalhe |
|---|---|
| **Descrição** | Eventos de tracking das jornadas críticas + `source` em cadastros |
| **Prioridade** | Should |
| **Critérios de aceite** | Eventos principais logados; schema documentado |
| **Dependências** | F-02.01, F-03.02 |
| **Status** | Planned |

#### F-07.02 — Documento de métricas e baselines

| Campo | Detalhe |
|---|---|
| **Descrição** | `docs/product/metrics.md` com KPIs, owners e baselines |
| **Prioridade** | Must |
| **Critérios de aceite** | Doc publicado; cadência de revisão definida |
| **Dependências** | F-07.01 (dados); pode iniciar o doc antes |
| **Status** | Planned |

#### F-07.03 — Dashboard interno de produto

| Campo | Detalhe |
|---|---|
| **Descrição** | Visão semanal de North Star e funil (admin ou ferramenta BI) |
| **Prioridade** | Could |
| **Critérios de aceite** | Inscrições/mês; funil; resgates |
| **Dependências** | F-07.01, F-04.01 |
| **Status** | Planned |

#### F-07.04 — Relatórios para organizador/parceiro

| Campo | Detalhe |
|---|---|
| **Descrição** | Exports e dashboards B2B (inscrições, ROI de campanha) |
| **Prioridade** | Won't |
| **Critérios de aceite** | Export CSV ou dashboard mínimo (médio prazo) |
| **Dependências** | F-05.03, F-04.05 |
| **Status** | Planned |

---

## 10. Escopo MVP

### Inclui (Must + Should preferenciais)

- Fundação completa (UI, layout, API, testes, deploy, backend)
- Home, eventos (listagem/detalhe/inscrição), kits (consulta)
- Parceiros (vitrine), cupons (resgate), auth e perfil
- Admin CRUD mínimo
- Comunidade (feed + like/comentário)
- Blog e Concierge (Should)
- `metrics.md` + instrumentação básica (Should/Must doc)

### Fora do MVP (Won't)

- Wishlist de eventos
- Self-service de organizador
- Dashboard do parceiro
- Relatórios B2B avançados
- Integração pós-prova / grupo do evento

---

## 11. Gaps de API (bloqueadores)

| Gap | Features | Prioridade |
|---|---|---|
| `GET /events?featured=true` | F-02.03 | Must |
| Pickup window em kits | F-03.03 | Must |
| `GET /users/me/registrations` | F-03.03, F-03.05 | Must |
| `GET /coupons/featured` | F-02.01, F-03.04 | Should |
| Preview comunidade público | F-02.01, F-06.01 | Should |
| `POST /newsletter/subscribe` | F-02.07 | Could |

---

## 12. Roadmap de alto nível (Épicos × Sprints)

```text
Sprint   EP-01   EP-02   EP-03   EP-04   EP-05   EP-06   EP-07
────────────────────────────────────────────────────────────────
S01 ✅   ████
S02 🔜   ████
S03      ████
S04              ████
S05              ████    ████
S06              ████                   ████
S07                      ████           ████
S08              ████
S09                                                 ████
S10              ████
S11                      ████
S12                              ████
S13      ████                                           ████
S14      ████
S15      ████                                           ████
────────────────────────────────────────────────────────────────
         Fundação  Pública  Corredor  Admin  Market  Comun. Analytics
```

### Tabela Épico × Sprint

| Épico | Sprints previstas | Entrega principal |
|---|---|---|
| **EP-01 Fundação** | 01 ✅ · 02 🔜 · 03 · 13 · 14 · 15 | Monorepo, Butterfly UI, Layout, testes, deploy, API |
| **EP-02 Experiência Pública** | 04 · 05 · 06 · 08 · 10 | Home, eventos, parceiros, concierge, blog |
| **EP-03 Área do Corredor** | 05 · 07 · 11 | Inscrição, kits, cupons, auth, perfil |
| **EP-04 Administração** | 12 | Painel e CRUDs |
| **EP-05 Marketplace** | 06 · 07 · pós-MVP | Parceiros + cupons; dashboard depois |
| **EP-06 Comunidade** | 09 | Feed, interação, grupos |
| **EP-07 Analytics** | 13 · 15 · pós-MVP | Funil, metrics, dashboards |

### Ordem de planejamento sugerida

| Sprint | Épico(s) | Features a storyificar |
|---|---|---|
| 02 | EP-01 | F-01.02 |
| 03 | EP-01 | F-01.03, F-01.05 (parcial) |
| 04 | EP-02 | F-02.01, F-02.03, F-02.07 (UI) |
| 05 | EP-02, EP-03 | F-02.02, F-03.02, F-03.03 |
| 06 | EP-02, EP-05 | F-02.04, F-05.01 |
| 07 | EP-03, EP-05 | F-03.04, F-05.02 |
| 08 | EP-02 | F-02.06 |
| 09 | EP-06 | F-06.01, F-06.02, F-06.03 |
| 10 | EP-02 | F-02.05 |
| 11 | EP-03 | F-03.01, F-03.05, F-03.06 |
| 12 | EP-04 | F-04.01–F-04.04 |
| 13 | EP-01, EP-07 | F-01.07, F-07.01 |
| 14 | EP-01 | F-01.08, F-01.09 (fechamento) |
| 15 | EP-01, EP-07 | F-01.05 audit, F-07.02, release |

---

## 13. Governança

| Regra | Descrição |
|---|---|
| **Fonte única** | Features entram neste documento antes do planning |
| **Stories** | Derivadas de Features Must/Should da sprint |
| **IDs estáveis** | `EP-0N` e `F-XX.YY` em PRs e User Stories |
| **Revisão** | Atualizar Status ao fim de cada sprint |
| **Mudança MoSCoW** | Alinhar com North Star e [product-vision.md](./product-vision.md) |

---

> Próximo artefato: `docs/product/user-stories.md` — User Stories INVEST por sprint, derivadas das features Must deste backlog.
