# Feature Catalog — Plataforma Corredora DF

**PB-030** · Catálogo oficial de Features para Producto, UX, Engenharia e QA.

| Campo | Valor |
|---|---|
| **Status** | Aprovado |
| **Versão** | 1.0 |
| **Última atualização** | 2026-07-13 |
| **Audiência** | Produto, UX, engenharia, QA |
| **Fonte de verdade** | Este documento + [product-backlog.md](./product-backlog.md) |

---

## 1. Como usar

Cada Feature deste catálogo é uma unidade entregável mapeada a:

- **Épico** e **IDs** do [Product Backlog](./product-backlog.md)
- **Sprint sugerida** do [Roadmap](../roadmap.md)
- **Jornada(s)** em [user-journeys.md](./user-journeys.md)
- **Contratos** em [docs/api/](../api/)
- **Pacote frontend** em `apps/web/features/`

### Convenções de status e prioridade

| Status | Significado |
|---|---|
| Planned | Ainda não iniciada |
| In Progress | Em desenvolvimento |
| Done | Entregue |

| MoSCoW | Significado |
|---|---|
| Must | Obrigatório no MVP |
| Should | Importante no MVP se houver capacidade |
| Could | Desejável / pós-MVP próximo |
| Won't | Fora do escopo atual |

### Índice rápido

| Feature | ID Backlog | Épico | Sprint | Prioridade | Status |
|---|---|---|---|---|---|
| [Home](#2-home) | F-02.01, F-02.03 | EP-02 | 04 | Must | Planned |
| [Corridas](#3-corridas) | F-02.02, F-03.02 | EP-02 / EP-03 | 05 | Must | Planned |
| [Evento em Destaque](#4-evento-em-destaque) | F-02.03 | EP-02 | 04–05 | Must | Planned |
| [Retirada de Kits](#5-retirada-de-kits) | F-03.03 | EP-03 | 05 | Must | Planned |
| [Cupons](#6-cupons) | F-03.04, F-05.02 | EP-03 / EP-05 | 07 | Must | Planned |
| [Parceiros](#7-parceiros) | F-02.04, F-05.01 | EP-02 / EP-05 | 06 | Must | Planned |
| [Comunidade](#8-comunidade) | F-06.01–F-06.03 | EP-06 | 09 | Must | Planned |
| [Blog](#9-blog) | F-02.05 | EP-02 | 10 | Should | Planned |
| [Perfil](#10-perfil) | F-03.05 | EP-03 | 11 | Must | Planned |
| [Autenticação](#11-autenticação) | F-03.01 | EP-03 | 11 | Must | Planned |
| [Administração](#12-administração) | F-04.01–F-04.04 | EP-04 | 12 | Must | Planned |

---

## 2. Home

| Campo | Detalhe |
|---|---|
| **Nome** | Home |
| **ID** | F-02.01 · F-02.03 · F-02.07 (UI) |
| **Épico** | EP-02 — Experiência Pública |
| **Sprint sugerida** | 04 |
| **Objetivo** | Ser a porta de entrada da plataforma e orientar o visitante para as jornadas principais |
| **Descrição** | Página `/` composta conforme a [IA oficial da Home](./home-information-architecture.md): Navbar, Hero, Evento em Destaque, Próximas Corridas, Kits, Cupons, Parceiros, Comunidade, Blog, Newsletter e Footer |
| **Persona principal** | Corredor iniciante (visitante anônimo) |
| **Valor para o usuário** | Entende o produto e encontra o próximo passo (corrida, cadastro, comunidade) em uma rolagem |
| **Valor para o negócio** | Topo do funil — CTR Home→evento ≥ 20%; cadastros com `source=home` |
| **Prioridade** | Must |
| **Status** | Planned |
| **Dependências** | F-01.02 Butterfly UI · F-01.03 AppShell · mocks até F-01.09 |
| **Componentes envolvidos** | `@corredora/ui`: Layout, Navbar, Hero, Section, Container, Stack, Grid, Button · `features/home/components/*` · Footer (layout) |
| **Rotas** | `/` |
| **APIs previstas** | `GET /events?featured=true&limit=1` · `GET /events?status=active&sort=date&perPage=6` · `GET /partners?active=true&perPage=10` · `GET /blog/posts?perPage=3` · `GET /coupons/featured` (gap) · `GET /community/posts/featured` (gap) · `POST /newsletter/subscribe` (gap) · `GET /ads?position=home_banner` (Could) |
| **Modelo de dados** | Agrega `Event`, `Partner`, `Coupon` (teaser), `BlogPost`, `CommunityPost` (preview), `NewsletterSubscription` |
| **Permissões** | Público; seções autenticadas (kits/cupons/comunidade) com teaser vs dados reais |
| **Eventos de Analytics** | `view_home` · `click_hero_cta` · `click_featured_event` · `click_upcoming_event` · `click_partners_logo` · `click_coupons_teaser` · `click_community_teaser` · `newsletter_submit` · `scroll_depth` |
| **Testes previstos** | Unit: composição de seções · Integração: serviços `getHomeData` · E2E: Home carrega; CTA Hero → `/corridas`; scroll indicator → `#main-content` |
| **Requisitos de acessibilidade** | Um único `<h1>` no Hero; cada seção com `<h2>`; landmarks `<header>`/`<main>`/`<footer>`; `#main-content`; contraste no overlay do Hero; CTAs nativos |
| **Requisitos de responsividade** | Mobile-first; seções empilhadas; carrossel horizontal para grids de cards &lt; md; Navbar drawer |
| **Métricas de sucesso** | CTR Home→detalhe ≥ 20% · scroll depth ≥ 60% até Parceiros · cadastros via Home |
| **Evoluções futuras** | Home personalizada por perfil · recomendações · A/B de CTAs · ads automáticos |

**Refs:** [home-information-architecture.md](./home-information-architecture.md) · Journeys 1–5 (entradas)

---

## 3. Corridas

| Campo | Detalhe |
|---|---|
| **Nome** | Corridas |
| **ID** | F-02.02 · F-03.02 |
| **Épico** | EP-02 Experiência Pública · EP-03 Área do Corredor |
| **Sprint sugerida** | 05 |
| **Objetivo** | Permitir descobrir, comparar e inscrever-se em eventos de corrida no DF |
| **Descrição** | Listagem paginada com filtros (categoria, data, cidade, inscrição aberta); detalhe do evento; fluxo de inscrição autenticado |
| **Persona principal** | Corredor iniciante |
| **Valor para o usuário** | Escolher prova adequada (incl. 5K/10K) e garantir vaga com clareza |
| **Valor para o negócio** | Driver direto da North Star (inscrições confirmadas/mês) |
| **Prioridade** | Must |
| **Status** | Planned |
| **Dependências** | F-02.01 (entrada) · F-03.01 (auth) · F-01.09 (API) |
| **Componentes envolvidos** | `features/events/` · Card, Badge, Button, Input (filtros) · EmptyState · Section/Grid |
| **Rotas** | `/corridas` · `/corridas/{slug}` |
| **APIs previstas** | `GET /events` · `GET /events/:id` · `POST /events/:id/register` · `DELETE /events/:id/register` |
| **Modelo de dados** | `Event` · `Registration` · relação com `Kit`, `Partner` |
| **Permissões** | Listagem/detalhe: público · Inscrição/cancelamento: autenticado · CRUD: admin |
| **Eventos de Analytics** | `view_events_list` · `apply_event_filter` · `view_event_detail` · `start_registration` · `complete_registration` · `cancel_registration` |
| **Testes previstos** | Unit: filtros/helpers · Integração: serviços de events · E2E: listagem → detalhe → inscrição (Journey 1) |
| **Requisitos de acessibilidade** | Filtros com labels; status anunciado; erros de inscrição em texto; CTA de inscrição focável; hierarquia h1 (página) / h2 (seções) |
| **Requisitos de responsividade** | Grid 1 col mobile / 2–3 desktop; CTA sticky no detalhe mobile (Should) |
| **Métricas de sucesso** | CTR detalhe→inscrição ≥ 15% · taxa conclusão inscrição ≥ 70% · conversão evento→inscrição ≥ 5% |
| **Evoluções futuras** | Wishlist · lista de espera · badge “ideal para iniciantes” · recomendações · pagamento in-app |

**Refs:** Journey 1 · [events.md](../api/events.md)

---

## 4. Evento em Destaque

| Campo | Detalhe |
|---|---|
| **Nome** | Evento em Destaque |
| **ID** | F-02.03 |
| **Épico** | EP-02 — Experiência Pública |
| **Sprint sugerida** | 04–05 |
| **Objetivo** | Maximizar conversão pós-Hero promocionando uma única corrida prioritária |
| **Descrição** | Seção da Home com card amplo (capa, nome, data, cidade, distância, status); opcionalmente alimentada por flag `featured` ou fallback para próximo evento com inscrição aberta |
| **Persona principal** | Corredor iniciante / em decisão |
| **Valor para o usuário** | Decisão rápida sem comparar muitas opções |
| **Valor para o negócio** | Principal ponto de conversão Home→detalhe |
| **Prioridade** | Must |
| **Status** | Planned |
| **Dependências** | F-02.01 · F-02.02 · gap API `featured` |
| **Componentes envolvidos** | `features/home/components/FeaturedEventSection` · Card · Badge · Button · `next/image` |
| **Rotas** | Seção em `/` · destino `/corridas/{slug}` |
| **APIs previstas** | `GET /events?featured=true&limit=1` · fallback `GET /events?registrationOpen=true&sort=date&perPage=1` · alternativa `GET /ads?position=home_banner` |
| **Modelo de dados** | `Event.featured` (boolean) ou seleção editorial via Ads |
| **Permissões** | Público |
| **Eventos de Analytics** | `view_featured_event` · `click_featured_event` · `featured_fallback_used` |
| **Testes previstos** | Unit: fallback sem featured · E2E: clique no destaque navega ao detalhe · Visual: layout split ≥ lg |
| **Requisitos de acessibilidade** | Título da seção h2; imagem com alt descritivo; CTA com nome do evento no accessible name |
| **Requisitos de responsividade** | Stack mobile; split imagem+conteúdo ≥ lg; largura dominante vs cards das próximas |
| **Métricas de sucesso** | CTR destaque→detalhe ≥ 8% · não duplicar o mesmo evento em “Próximas Corridas” |
| **Evoluções futuras** | Rotação programada · destaque patrocinado · countdown para inscrição |

**Refs:** Home IA §2.3 · Journey 1

---

## 5. Retirada de Kits

| Campo | Detalhe |
|---|---|
| **Nome** | Retirada de Kits |
| **ID** | F-03.03 |
| **Épico** | EP-03 — Área do Corredor |
| **Sprint sugerida** | 05 |
| **Objetivo** | Informar onde, quando e como retirar o kit após a inscrição |
| **Descrição** | Listagem de kits pendentes para autenticados; detalhe com itens, tamanho, local e janela de retirada; conteúdo educativo para anônimos; seção na Home |
| **Persona principal** | Corredor inscrito (iniciante ou experiente) |
| **Valor para o usuário** | Reduz ansiedade e risco de no-show na retirada |
| **Valor para o negócio** | Menos tickets de suporte; melhor experiência do evento |
| **Prioridade** | Must (consulta) · Could (agendamento/QR — pós-MVP) |
| **Status** | Planned |
| **Dependências** | F-03.02 · gaps: pickup fields, `GET /users/me/registrations` |
| **Componentes envolvidos** | `features/events/` + seção Home · Badge · EmptyState · Button |
| **Rotas** | `/kits` · `/kits/{id}` · `/corridas/{slug}/kit` |
| **APIs previstas** | `GET /kits` · `GET /kits/:id` · `GET /events/:eventId/kits` · `GET /users/me/registrations` (gap) · PATCH tamanho (a definir) |
| **Modelo de dados** | `Kit` (`items`, `sizes`, `eventId`) + campos futuros `pickupLocation`, `pickupStart`, `pickupEnd` · `Registration.shirtSize` |
| **Permissões** | Ver kits de evento: público · Meus kits / salvar tamanho: autenticado · CRUD kit: admin |
| **Eventos de Analytics** | `view_kits_list` · `view_kit_detail` · `save_kit_size` · `click_kit_from_home` |
| **Testes previstos** | Unit: empty states anônimo vs autenticado · E2E: pós-inscrição → /kits (Journey 2) |
| **Requisitos de acessibilidade** | Status em texto (não só cor); local/horário em lista semântica; formulário de tamanho com label |
| **Requisitos de responsividade** | Cards empilhados no mobile; mapa (futuro) full-width |
| **Métricas de sucesso** | ≥ 60% inscritos visitam /kits antes da prova · ≥ 90% com tamanho definido · redução de tickets de kit |
| **Evoluções futuras** | Agendamento de horário · QR check-in · mapa · lembrete 48h · retirada por terceiros assistida |

**Refs:** Journey 2 · [kits.md](../api/kits.md)

---

## 6. Cupons

| Campo | Detalhe |
|---|---|
| **Nome** | Cupons |
| **ID** | F-03.04 · F-05.02 |
| **Épico** | EP-03 Área do Corredor · EP-05 Marketplace |
| **Sprint sugerida** | 07 |
| **Objetivo** | Descobrir, entender regras e resgatar benefícios promocionais |
| **Descrição** | Listagem autenticada de cupons; detalhe; resgate e validação de código; teaser na Home sem código para anônimos; vínculo a parceiros |
| **Persona principal** | Corredor experiente |
| **Valor para o usuário** | Economia em inscrições e produtos de parceiros |
| **Valor para o negócio** | Retenção; taxa de resgate ≥ 30%; valor comercial para parceiros |
| **Prioridade** | Must |
| **Status** | Planned |
| **Dependências** | F-03.01 · F-05.01 · gap `GET /coupons/featured` |
| **Componentes envolvidos** | `features/coupons/` · Card · Badge · Button · Input (código) · seção Home |
| **Rotas** | `/cupons` · `/cupons/{id}` |
| **APIs previstas** | `GET /coupons` · `GET /coupons/:id` · `POST /coupons/:id/redeem` · `POST /coupons/validate` · `GET /coupons/featured` (gap, público) |
| **Modelo de dados** | `Coupon` · `CouponRedemption` · `Partner` |
| **Permissões** | Listar/resgatar: autenticado · Featured público (futuro) · CRUD: admin |
| **Eventos de Analytics** | `view_coupons_list` · `view_coupon_detail` · `redeem_coupon` · `validate_coupon_code` · `click_coupons_teaser` |
| **Testes previstos** | Integração: redeem/validate · E2E: login → resgate (Journey 3) · anônimo → CTA cadastro |
| **Requisitos de acessibilidade** | Validade e status em texto; erros de resgate claros; código com label |
| **Requisitos de responsividade** | Grid 1–2 colunas; destaque percentual tipograficamente grande |
| **Métricas de sucesso** | Taxa de resgate ≥ 30% · uso pós-resgate ≥ 50% · cadastros via `source=cupons` |
| **Evoluções futuras** | Aplicar cupom no checkout de inscrição · cupom de boas-vindas · expiração highlight · histórico no perfil |

**Refs:** Journey 3 · [coupons.md](../api/coupons.md)

---

## 7. Parceiros

| Campo | Detalhe |
|---|---|
| **Nome** | Parceiros |
| **ID** | F-02.04 · F-05.01 |
| **Épico** | EP-02 Experiência Pública · EP-05 Marketplace |
| **Sprint sugerida** | 06 |
| **Objetivo** | Exibir o ecossistema de marcas e benefícios do DF |
| **Descrição** | Listagem e detalhe públicos; logo wall na Home; benefícios e link para cupons; categorias (equipment, nutrition, health, media) |
| **Persona principal** | Corredor iniciante/experiente (anônimo ok) |
| **Valor para o usuário** | Credibilidade e acesso a benefícios |
| **Valor para o negócio** | Aquisição/retenção de parceiros; inventário comercial; prova social |
| **Prioridade** | Must |
| **Status** | Planned |
| **Dependências** | F-01.03 · F-04.03 (CRUD) · F-05.01 |
| **Componentes envolvidos** | `features/partners/` · Avatar/logo · Card · Grid · seção Home PartnersSection |
| **Rotas** | `/parceiros` · `/parceiros/{slug}` |
| **APIs previstas** | `GET /partners` · `GET /partners/:id` · (admin POST/PATCH/DELETE) |
| **Modelo de dados** | `Partner` (`name`, `slug`, `logo`, `category`, `benefits`, `active`) |
| **Permissões** | Leitura: público · CRUD: admin |
| **Eventos de Analytics** | `view_partners_list` · `view_partner_detail` · `click_partner_benefit` · `click_partner_website` · `click_partner_coupon` |
| **Testes previstos** | E2E: Home → detalhe parceiro (Journey 4) · filtro por categoria |
| **Requisitos de acessibilidade** | Logos com alt = nome do parceiro; links externos com indicação; foco no logo wall |
| **Requisitos de responsividade** | Logo wall scroll horizontal &lt; md; grid ≥ md |
| **Métricas de sucesso** | CTR Home→detalhe ≥ 5% · cliques em benefício/cupom ≥ 20% do detalhe · ≥ 10 parceiros ativos (KPI negócio) |
| **Evoluções futuras** | Badge “cupom ativo” · tracking ads · dashboard parceiro · filtro por categoria com ícones |

**Refs:** Journey 4 · [partners.md](../api/partners.md)

---

## 8. Comunidade

| Campo | Detalhe |
|---|---|
| **Nome** | Comunidade |
| **ID** | F-06.01 · F-06.02 · F-06.03 |
| **Épico** | EP-06 — Comunidade |
| **Sprint sugerida** | 09 |
| **Objetivo** | Conectar corredores via feed, interação e grupos |
| **Descrição** | Feed de posts, detalhe, likes e comentários; grupos (Should); teaser na Home; rankings (Could) |
| **Persona principal** | Corredor experiente |
| **Valor para o usuário** | Pertencimento, motivação e troca de experiências |
| **Valor para o negócio** | Retenção; MAU; taxa de participação ≥ 15%; diferencial competitivo |
| **Prioridade** | Must (feed + interação) · Should (grupos) · Could (rankings) |
| **Status** | Planned |
| **Dependências** | F-03.01 · seed de conteúdo · gap preview público |
| **Componentes envolvidos** | `features/community/` · Avatar · Card · Button · Input · seção Home |
| **Rotas** | `/comunidade` · `/comunidade/posts/{id}` · `/comunidade/grupos` (Should) |
| **APIs previstas** | `GET/POST /community/posts` · `POST .../like` · `GET/POST .../comments` · `GET /community/groups` · `POST .../groups/:id/join` · `GET /community/rankings` · `GET /community/posts/featured` (gap) |
| **Modelo de dados** | `CommunityPost` · `Comment` · `Group` · `GroupMembership` · `Like` |
| **Permissões** | Toda interação autenticada · preview público (futuro) · moderação: admin |
| **Eventos de Analytics** | `view_community_feed` · `create_post` · `like_post` · `comment_post` · `join_group` · `view_rankings` · `click_community_teaser` |
| **Testes previstos** | E2E: login → like/comentário (Journey 5) · empty state com seed · teaser anônimo |
| **Requisitos de acessibilidade** | Autor/avatar com alt; ações de like/comentar com nomes acessíveis; formulário de post com label |
| **Requisitos de responsividade** | Feed single-column; composer sticky no mobile (Could) |
| **Métricas de sucesso** | Ativação comunidade ≥ 15% MAU · ≥ 20 posts/semana · joins em grupos ≥ 25% autenticados · retenção D30 comunidade ≥ 30% |
| **Evoluções futuras** | Grupo por evento · prompt pós-prova · onboarding “entre em 1 grupo” · denúncia · featured público |

**Refs:** Journey 5 · [community.md](../api/community.md)

---

## 9. Blog

| Campo | Detalhe |
|---|---|
| **Nome** | Blog |
| **ID** | F-02.05 |
| **Épico** | EP-02 — Experiência Pública |
| **Sprint sugerida** | 10 |
| **Objetivo** | Publicar conteúdo editorial para educação, SEO e retenção |
| **Descrição** | Listagem de artigos, detalhe por slug, categorias, seção na Home com 3 posts recentes |
| **Persona principal** | Corredor iniciante (fase de pesquisa) |
| **Valor para o usuário** | Dicas de treino, nutrição e preparo |
| **Valor para o negócio** | Tráfego orgânico; engajamento em sazonalidade baixa |
| **Prioridade** | Should |
| **Status** | Planned |
| **Dependências** | F-01.03 · F-04.03 (CRUD ideal) |
| **Componentes envolvidos** | `features/blog/` · Card · Badge · Section Home BlogSection |
| **Rotas** | `/blog` · `/blog/{slug}` |
| **APIs previstas** | `GET /blog/posts` · `GET /blog/posts/:slug` · `GET /blog/categories` · CRUD admin |
| **Modelo de dados** | `BlogPost` (`title`, `slug`, `excerpt`, `content`, `coverImage`, `category`, `author`, `publishedAt`, `readingTime`) |
| **Permissões** | Leitura: público · Escrita: admin |
| **Eventos de Analytics** | `view_blog_list` · `view_blog_post` · `click_blog_category` · `click_blog_from_home` |
| **Testes previstos** | SEO meta no detalhe · listagem + empty · link Home → artigo |
| **Requisitos de acessibilidade** | Artigo com hierarquia de headings no conteúdo; imagem com alt; tempo de leitura anunciado |
| **Requisitos de responsividade** | Tipografia confortável mobile; capa full-bleed &lt; md |
| **Métricas de sucesso** | Crescimento de pageviews · engajamento blog/sessões · entrada orgânica |
| **Evoluções futuras** | Newsletter acoplada · related posts · comentários · CMS headless |

**Refs:** Home IA §2.9 · [blog.md](../api/blog.md)

---

## 10. Perfil

| Campo | Detalhe |
|---|---|
| **Nome** | Perfil |
| **ID** | F-03.05 |
| **Épico** | EP-03 — Área do Corredor |
| **Sprint sugerida** | 11 |
| **Objetivo** | Permitir ao corredor visualizar e editar dados da conta |
| **Descrição** | Página de perfil com dados básicos, avatar e preferências; link no Navbar autenticado; base para histórico de inscrições (Should) |
| **Persona principal** | Corredor autenticado (ambas personas) |
| **Valor para o usuário** | Controle da conta e identidade na plataforma |
| **Valor para o negócio** | Dados para personalização e comunicação futuras |
| **Prioridade** | Must |
| **Status** | Planned |
| **Dependências** | F-03.01 · [users.md](../api/users.md) |
| **Componentes envolvidos** | `features/profile/` · Avatar · Input · Button · Form |
| **Rotas** | `/perfil` (ou `/profile`) |
| **APIs previstas** | `GET /users/me` · `PATCH /users/me` · (futuro) `GET /users/me/registrations` |
| **Modelo de dados** | `User` · `UserProfile` |
| **Permissões** | Autenticado (próprio usuário) · Admin pode gerir via painel |
| **Eventos de Analytics** | `view_profile` · `update_profile` · `upload_avatar` |
| **Testes previstos** | E2E: login → editar perfil → salvar · validação de campos |
| **Requisitos de acessibilidade** | Formulário com labels; erros associados aos campos; avatar com alt |
| **Requisitos de responsividade** | Formulário single column mobile |
| **Métricas de sucesso** | Taxa de perfil completo · retenção pós-cadastro |
| **Evoluções futuras** | Histórico de corridas · preferências de notificação · privacidade · integração Strava |

**Refs:** Product Vision · Persona autenticada

---

## 11. Autenticação

| Campo | Detalhe |
|---|---|
| **Nome** | Autenticação |
| **ID** | F-03.01 |
| **Épico** | EP-03 — Área do Corredor |
| **Sprint sugerida** | 11 (parcial adiantável se inscrição bloquear) |
| **Objetivo** | Identificar o usuário com segurança e habilitar jornadas autenticadas |
| **Descrição** | Cadastro, login, logout, sessão (Bearer + refresh), proteção de rotas e `returnUrl` após login forçado |
| **Persona principal** | Corredor iniciante (primeiro cadastro) |
| **Valor para o usuário** | Acesso a inscrição, kits, cupons e comunidade |
| **Valor para o negócio** | Identidade rastreável; base de MAU e North Star |
| **Prioridade** | Must |
| **Status** | Planned |
| **Dependências** | F-01.09 · F-01.06 (segurança/LGPD) |
| **Componentes envolvidos** | `features/auth/` · Input · Button · providers de sessão · Navbar Entrar/Cadastrar |
| **Rotas** | `/entrar` · `/cadastrar` · (callbacks/refresh internos) |
| **APIs previstas** | `POST /auth/register` · `POST /auth/login` · `POST /auth/refresh` · `POST /auth/logout` |
| **Modelo de dados** | `User` · `Session` / tokens |
| **Permissões** | Endpoints auth: público · rotas protegidas exigem Bearer |
| **Eventos de Analytics** | `view_login` · `view_register` · `register_success` · `login_success` · `login_error` · `logout` · `auth_gate_hit` (com `returnUrl`) |
| **Testes previstos** | E2E: cadastro → login → rota protegida · returnUrl cupons/comunidade · sessão expirada |
| **Requisitos de acessibilidade** | Forms com labels; erros anunciados; contraste; não usar CAPTCHA inacessível sem alternativa |
| **Requisitos de responsividade** | Form central mobile-first; CTAs full-width &lt; md |
| **Métricas de sucesso** | Conclusão de cadastro · abandono &lt; 40% no gate de inscrição · tempo até primeira inscrição ≤ 7 dias |
| **Evoluções futuras** | OAuth social · 2FA · magic link · recuperação de senha avançada |

**Refs:** [auth.md](../api/auth.md) · Journeys 1, 3, 5 (gates)

---

## 12. Administração

| Campo | Detalhe |
|---|---|
| **Nome** | Administração |
| **ID** | F-04.01 · F-04.02 · F-04.03 · F-04.04 |
| **Épico** | EP-04 — Administração |
| **Sprint sugerida** | 12 |
| **Objetivo** | Operar conteúdo e dados da plataforma (eventos, kits, parceiros, cupons, blog, usuários) |
| **Descrição** | Painel autenticado com RBAC admin: dashboard, CRUDs e moderação básica da comunidade |
| **Persona principal** | Administrador / equipe Corredora DF (Organizador via admin no MVP) |
| **Valor para o usuário** | Calendário e benefícios atualizados (indireto) |
| **Valor para o negócio** | Escala operacional; mitiga risco de conteúdo desatualizado |
| **Prioridade** | Must (painel + CRUDs) · Should (moderação/usuários) · Won't (self-service organizador no MVP) |
| **Status** | Planned |
| **Dependências** | F-03.01 (roles) · F-01.09 · features públicas a gerir |
| **Componentes envolvidos** | App admin (`/admin` ou `apps/admin`) · Sidebar · Breadcrumb · tabelas/forms · `features/*` serviços admin |
| **Rotas** | `/admin` · `/admin/eventos` · `/admin/kits` · `/admin/parceiros` · `/admin/cupons` · `/admin/blog` · `/admin/usuarios` |
| **APIs previstas** | CRUD admin de `/events`, `/kits`, `/partners`, `/coupons`, `/blog/posts`, `/users` · endpoints de moderação community |
| **Modelo de dados** | Todos os agregados + `User.role` (`admin`) |
| **Permissões** | Somente `admin` |
| **Eventos de Analytics** | `admin_login` · `admin_create_event` · `admin_update_event` · `admin_publish_post` · `admin_moderate_post` |
| **Testes previstos** | E2E: admin cria evento → aparece em `/corridas` · não-admin recebe 403 · CRUD cupom/parceiro |
| **Requisitos de acessibilidade** | Tabelas com headers; forms acessíveis; foco em dialogs de confirmação |
| **Requisitos de responsividade** | Desktop-first aceitável; tabelas com scroll horizontal &lt; lg |
| **Métricas de sucesso** | Tempo para publicar evento · 0 conteúdo crítico stale · cobertura CRUD dos módulos MVP |
| **Evoluções futuras** | Self-service de organizador · dashboard parceiro · auditoria · draft/publish workflow |

**Refs:** Roadmap S12 · Product Vision persona Organizador · [product-backlog.md](./product-backlog.md) EP-04

---

## 13. Matriz Feature × Épico × Sprint

| Feature | Épico(s) | Sprint | MoSCoW | Jornada |
|---|---|---|---|---|
| Home | EP-02 | 04 | Must | J1–J5 (entrada) |
| Evento em Destaque | EP-02 | 04–05 | Must | J1 |
| Corridas | EP-02, EP-03 | 05 | Must | J1 |
| Retirada de Kits | EP-03 | 05 | Must | J2 |
| Parceiros | EP-02, EP-05 | 06 | Must | J4 |
| Cupons | EP-03, EP-05 | 07 | Must | J3 |
| Comunidade | EP-06 | 09 | Must | J5 |
| Blog | EP-02 | 10 | Should | — |
| Autenticação | EP-03 | 11 | Must | J1, J3, J5 |
| Perfil | EP-03 | 11 | Must | — |
| Administração | EP-04 | 12 | Must | Operação |

---

## 14. Permissões transversais

| Nível | Features típicas |
|---|---|
| `public` | Home, Corridas (leitura), Destaque, Parceiros, Blog, Kits (info geral) |
| `authenticated` | Inscrição, Meus kits, Cupons, Comunidade, Perfil |
| `admin` | Administração (CRUD + moderação) |

Detalhes por endpoint: [api/README.md](../api/README.md).

---

## 15. Checklist de Definition of Done (Feature)

> Story-level DoR/DoD: [definition-of-ready-and-done.md](../engineering/definition-of-ready-and-done.md).

Uma Feature só é **Done** quando:

- [ ] Critérios deste catálogo atendidos
- [ ] Todas as stories **Must** da Feature estão Done
- [ ] Rotas e UI responsivas + a11y mínimos
- [ ] Serviços alinhados ao contrato API (ou mock documentado)
- [ ] Eventos de analytics instrumentados (quando F-07.01 disponível)
- [ ] Testes unitários/integração + E2E da jornada relacionada
- [ ] Documentação da feature em `apps/web/features/<nome>/README.md` atualizada
- [ ] Status atualizado neste catálogo e no [product-backlog.md](./product-backlog.md)

---

## 16. Referências

| Documento | Papel |
|---|---|
| [product-backlog.md](./product-backlog.md) | Épicos, MoSCoW, IDs |
| [product-vision.md](./product-vision.md) | Personas, North Star, KPIs |
| [home-information-architecture.md](./home-information-architecture.md) | Home |
| [user-journeys.md](./user-journeys.md) | Fluxos e indicadores |
| [roadmap.md](../roadmap.md) | Sprints |
| [api/](../api/) | Contratos |
| [database/README.md](../database/README.md) | Modelo de dados |
| [engineering/05-accessibility.md](../engineering/05-accessibility.md) | A11y |
| [engineering/07-testing.md](../engineering/07-testing.md) | Estratégia de testes |

---

> Atualizar Status e Evoluções futuras ao fim de cada sprint. Novas capacidades entram primeiro no backlog (ID) e depois neste catálogo.
