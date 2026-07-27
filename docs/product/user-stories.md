# User Story Catalog — Plataforma Corredora DF

**PB-032** · Catálogo oficial de User Stories do MVP.

| Campo | Valor |
|---|---|
| **Status** | Aprovado |
| **Versão** | 1.0 |
| **Última atualização** | 2026-07-13 |
| **Audiência** | Product Owner, engenharia, UX, QA |
| **Escopo** | Features **Must** e **Should** do MVP ([product-backlog.md](./product-backlog.md)) |

---

## 1. Decisões de product ownership

| Decisão | Justificativa |
|---|---|
| **Somente MVP** | Stories Won't (wishlist, dashboard parceiro, self-service organizador) ficam fora deste catálogo |
| **Formato INVEST** | Independente o suficiente para sprint planning; Negotiable nos detalhes UX; Valuable ao usuário; Estimável; Small (≤ 8 SP ideal; 13 só excepcionalmente); Testável via Gherkin |
| **ID estável** | `US-<DOMÍNIO>-<NN>` — rastreável em PRs, commits e board |
| **MoSCoW na Story** | Herda da Feature; Should marcado explicitamente |
| **Fibonacci** | 1, 2, 3, 5, 8, 13 — complexidade + incerteza (API gaps elevam pontos) |
| **1 Story = 1 resultado** | Evita “épicos disfarçados”; Home composta em várias stories |
| **Gherkin PT-BR** | Critérios legíveis para QA e negócio |
| **Auth antes de writes** | Stories de inscrição/cupons/comunidade dependem de US-AUTH-*; planning pode adiantar auth mínimo |
| **Fundação embutida** | Butterfly UI / AppShell já no EP-01; stories de produto assumem F-01.02–03 em andamento |
| **Analytics** | Cada story lista eventos; instrumentação global é US-ANL-* (Should) |

### Referências usadas

[product-vision.md](./product-vision.md) · [product-backlog.md](./product-backlog.md) · [feature-catalog.md](./feature-catalog.md) · [feature-specifications.md](./feature-specifications.md) · [user-journeys.md](./user-journeys.md)

### Legenda de campos

| Campo | Conteúdo |
|---|---|
| **História** | “Como… quero… para…” |
| **Prioridade** | Must / Should |
| **SP** | Story Points (Fibonacci) |
| **UX** | Requisitos de experiência |
| **Tech** | Requisitos técnicos |
| **Analytics** | Eventos a disparar |
| **Testes** | Unit / integração / E2E mínimos |

---

## 2. Índice por Feature

| Feature | Stories | SP (soma) | Sprint sugerida |
|---|---|---:|---|
| Fundação (habilitadoras MVP) | US-FND-01…03 | 16 | 02–03, 13–14 |
| Home | US-HOME-01…05 | 21 | 04 |
| Events | US-EVT-01…04 | 21 | 05 |
| Kits | US-KIT-01…03 | 13 | 05 |
| Partners | US-PTR-01…03 | 13 | 06 |
| Coupons | US-CPN-01…03 | 13 | 07 |
| Concierge (contato) | US-CNG-01 | 5 | 08 |
| Community | US-COM-01…04 | 21 | 09 |
| Blog | US-BLG-01…02 | 8 | 10 |
| Auth | US-AUTH-01…04 | 18 | 11 |
| Profile | US-PRF-01…02 | 8 | 11 |
| Admin | US-ADM-01…05 | 26 | 12 |
| Analytics | US-ANL-01…02 | 8 | 13–15 |
| **Total MVP** | **42 stories** | **~191 SP** | 02–15 |

> Estimativa agregada para capacidade de planning — recalibrar após 2 sprints de velocity.

---

## 3. Fundação (habilitadoras)

### US-FND-01 — Butterfly UI utilizável no app

| Campo | Conteúdo |
|---|---|
| **Epic** | EP-01 |
| **Feature** | F-01.02 Butterfly UI |
| **Título** | Design system com tokens e componentes base no playground |
| **História** | Como desenvolvedor frontend, quero consumir `@corredora/ui` com tokens e componentes base, para construir telas do MVP com consistência visual |
| **Prioridade** | Must · **SP** | 8 |
| **Dependências** | F-01.01 Done |
| **Critérios de aceite** | **Given** o pacote `@corredora/ui` **When** abro `/playground` **Then** vejo Button, Navbar e Hero renderizados com classes `butterfly-*` estilizadas e tokens aplicados |
| **UX** | Contraste previsto; componentes focáveis |
| **Tech** | Tokens preenchidos; peer React 19; export via package |
| **Analytics** | — |
| **Testes** | Visual playground; typecheck do pacote |

### US-FND-02 — AppShell, Navbar e Footer públicos

| Campo | Conteúdo |
|---|---|
| **Epic** | EP-01 |
| **Feature** | F-01.03 Layout |
| **Título** | Cascas de navegação em todas as páginas públicas |
| **História** | Como visitante, quero ver navegação e rodapé consistentes, para me orientar na plataforma |
| **Prioridade** | Must · **SP** | 5 |
| **Dependências** | US-FND-01 |
| **Critérios de aceite** | **Given** qualquer rota pública **When** a página carrega **Then** vejo Navbar com itens padrão, Footer com links legais e menu mobile &lt; md |
| **UX** | Mobile drawer; item ativo; CTAs Entrar/Cadastrar |
| **Tech** | `constants/navigation.ts` preenchido; AppShell no `layout.tsx` |
| **Analytics** | `click_nav_item` |
| **Testes** | E2E smoke navegação; a11y landmarks |

### US-FND-03 — Pipeline de testes E2E das jornadas críticas

| Campo | Conteúdo |
|---|---|
| **Epic** | EP-01 |
| **Feature** | F-01.07 Testes |
| **Título** | E2E das jornadas J1–J3 no CI |
| **História** | Como time de QA/engenharia, quero E2E automatizados das jornadas críticas, para evitar regressões no MVP |
| **Prioridade** | Must · **SP** | 3 |
| **Dependências** | US-EVT-03, US-AUTH-01, US-CPN-02 (podem ser stubs) |
| **Critérios de aceite** | **Given** o CI em PR **When** o pipeline roda **Then** executa smoke E2E Home→evento e login gate |
| **UX** | — |
| **Tech** | Playwright em `tests/`; job CI |
| **Analytics** | — |
| **Testes** | Meta-teste: pipeline verde |

---

## 4. Home

### US-HOME-01 — Hero oficial na Home

| Campo | Conteúdo |
|---|---|
| **Epic** | EP-02 |
| **Feature** | Home / Hero (F-02.01) |
| **Título** | Exibir Butterfly Hero com CTAs e único h1 |
| **História** | Como corredor iniciante, quero entender a proposta da Corredora DF e ir para corridas ou comunidade, para começar minha jornada |
| **Prioridade** | Must · **SP** | 3 |
| **Dependências** | US-FND-01, US-FND-02 |
| **Critérios de aceite** | **Given** estou em `/` **When** a página carrega **Then** vejo um único h1, subtítulo, descrição, dois CTAs e scroll indicator para `#main-content` |
| **UX** | Overlay contraste; placeholder imagem; mobile-first |
| **Tech** | `@corredora/ui` Hero; RSC |
| **Analytics** | `view_home` · `click_hero_cta` |
| **Testes** | E2E h1 único; CTA → `/corridas` |

### US-HOME-02 — Evento em destaque

| Campo | Conteúdo |
|---|---|
| **Epic** | EP-02 |
| **Feature** | Evento em Destaque (F-02.03) |
| **Título** | Destacar uma corrida prioritária na Home |
| **História** | Como corredor em decisão, quero ver um evento em evidência, para ir ao detalhe sem comparar várias opções |
| **Prioridade** | Must · **SP** | 5 |
| **Dependências** | US-HOME-01; API featured ou mock + fallback |
| **Critérios de aceite** | **Given** existe evento featured ou com inscrição aberta **When** acesso `/` **Then** vejo um card de destaque com CTA para `/corridas/{slug}`. **Given** não há featured **When** acesso `/` **Then** usa fallback do próximo evento aberto ou oculta a seção |
| **UX** | Layout dominante; badge status |
| **Tech** | `getHomeData`; exclusão do ID na lista de próximas |
| **Analytics** | `view_featured_event` · `click_featured_event` · `featured_fallback_used` |
| **Testes** | Unit fallback; E2E clique destaque |

### US-HOME-03 — Próximas corridas na Home

| Campo | Conteúdo |
|---|---|
| **Epic** | EP-02 |
| **Feature** | Home (F-02.01) |
| **Título** | Listar 3–6 próximas corridas com link Ver todas |
| **História** | Como visitante, quero ver próximas provas na Home, para explorar o calendário rapidamente |
| **Prioridade** | Must · **SP** | 3 |
| **Dependências** | US-HOME-02 |
| **Critérios de aceite** | **Given** há eventos futuros **When** rolo a Home **Then** vejo até 6 cards (sem o destaque) e CTA “Ver todas” → `/corridas`. **Given** lista vazia **When** rolo **Then** vejo empty state |
| **UX** | Carrossel &lt; md; grid ≥ md |
| **Tech** | `GET /events` filtrado |
| **Analytics** | `click_upcoming_event` |
| **Testes** | Unit exclusão featured; E2E Ver todas |

### US-HOME-04 — Seções teaser Kits, Cupons, Parceiros, Comunidade, Blog

| Campo | Conteúdo |
|---|---|
| **Epic** | EP-02 |
| **Feature** | Home (F-02.01) |
| **Título** | Compor seções teaser do restante da IA |
| **História** | Como visitante, quero entrever kits, cupons, parceiros, comunidade e blog, para entender o ecossistema |
| **Prioridade** | Must · **SP** | 8 |
| **Dependências** | US-HOME-01; mocks até APIs prontas |
| **Critérios de aceite** | **Given** estou na Home **When** rolo até o footer **Then** vejo seções com h2, CTA principal cada uma e empty/hide conforme IA §3.4 |
| **UX** | Um objetivo por seção; teaser sem código de cupom |
| **Tech** | Seções em `features/home/components`; Promise.all |
| **Analytics** | `click_partners_logo` · `click_coupons_teaser` · `click_community_teaser` · `click_blog_from_home` |
| **Testes** | Integração getHomeData parcial; E2E scroll depth smoke |

### US-HOME-05 — Newsletter na Home (UI)

| Campo | Conteúdo |
|---|---|
| **Epic** | EP-02 |
| **Feature** | Newsletter (F-02.07) |
| **Título** | Capturar e-mail com consentimento LGPD |
| **História** | Como visitante, quero assinar novidades de corridas, para ser avisado sem criar conta completa |
| **Prioridade** | Should · **SP** | 2 |
| **Dependências** | US-HOME-04 |
| **Critérios de aceite** | **Given** estou na seção Newsletter **When** envio e-mail válido com consentimento **Then** vejo confirmação (ou stub sucesso). **When** envio inválido **Then** vejo erro acessível |
| **UX** | Consentimento explícito; link privacidade |
| **Tech** | Stub → `POST /newsletter/subscribe` |
| **Analytics** | `newsletter_submit` |
| **Testes** | Unit validação e-mail |

---

## 5. Events

### US-EVT-01 — Listagem de corridas com filtros

| Campo | Conteúdo |
|---|---|
| **Epic** | EP-02 |
| **Feature** | Corridas (F-02.02) |
| **Título** | Listar e filtrar eventos |
| **História** | Como corredor iniciante, quero filtrar corridas por categoria e data, para achar uma prova adequada |
| **Prioridade** | Must · **SP** | 5 |
| **Dependências** | US-FND-02; API events |
| **Critérios de aceite** | **Given** existem eventos **When** acesso `/corridas` e aplico filtro `category=5k` **Then** vejo apenas eventos correspondentes paginados. **Given** zero resultados **Then** empty state |
| **UX** | Labels nos filtros; mobile empilhado |
| **Tech** | RSC + searchParams; `GET /events` |
| **Analytics** | `view_events_list` · `apply_event_filter` |
| **Testes** | Integração filtros; E2E Journey 1 parcial |

### US-EVT-02 — Detalhe do evento

| Campo | Conteúdo |
|---|---|
| **Epic** | EP-02 |
| **Feature** | Corridas (F-02.02) |
| **Título** | Ver detalhe completo da corrida |
| **História** | Como corredor, quero ver data, local, distância e status de inscrição, para decidir se me inscrevo |
| **Prioridade** | Must · **SP** | 5 |
| **Dependências** | US-EVT-01 |
| **Critérios de aceite** | **Given** um slug válido **When** abro `/corridas/{slug}` **Then** vejo dados do evento e CTA de inscrição conforme status. **Given** slug inválido **Then** 404 |
| **UX** | CTA visível no mobile; hierarquia headings |
| **Tech** | `GET /events/:id`; SEO meta |
| **Analytics** | `view_event_detail` |
| **Testes** | E2E detalhe; 404 |

### US-EVT-03 — Inscrição em evento

| Campo | Conteúdo |
|---|---|
| **Epic** | EP-03 |
| **Feature** | Corridas / Inscrição (F-03.02) |
| **Título** | Confirmar inscrição autenticada |
| **História** | Como corredor autenticado, quero me inscrever em uma prova, para garantir minha vaga |
| **Prioridade** | Must · **SP** | 8 |
| **Dependências** | US-EVT-02, US-AUTH-02 |
| **Critérios de aceite** | **Given** estou logado e inscrição aberta **When** confirmo inscrição **Then** vejo sucesso e opção de ir ao kit. **Given** não logado **When** clico Inscrever **Then** sou levado a login com `returnUrl`. **Given** evento lotado **Then** mensagem `EVENT_FULL` |
| **UX** | Feedback claro; badge Já inscrito |
| **Tech** | `POST /events/:id/register`; Client Component CTA |
| **Analytics** | `start_registration` · `complete_registration` · `auth_gate_hit` |
| **Testes** | E2E Journey 1 completo; erros API |

### US-EVT-04 — Cancelar inscrição

| Campo | Conteúdo |
|---|---|
| **Epic** | EP-03 |
| **Feature** | Corridas (F-03.02) |
| **Título** | Cancelar inscrição existente |
| **História** | Como corredor inscrito, quero cancelar minha inscrição, para liberar a vaga se não puder ir |
| **Prioridade** | Must · **SP** | 3 |
| **Dependências** | US-EVT-03 |
| **Critérios de aceite** | **Given** estou inscrito **When** cancelo com confirmação **Then** status volta a permitir nova inscrição |
| **UX** | Confirm dialog acessível |
| **Tech** | `DELETE /events/:id/register` |
| **Analytics** | `cancel_registration` |
| **Testes** | Integração cancelamento |

---

## 6. Kits (Concierge / Retirada)

### US-KIT-01 — Lista de kits do corredor

| Campo | Conteúdo |
|---|---|
| **Epic** | EP-03 |
| **Feature** | Retirada de Kits (F-03.03) |
| **Título** | Ver kits pendentes de retirada |
| **História** | Como corredor inscrito, quero ver meus kits pendentes, para saber o que retirar |
| **Prioridade** | Must · **SP** | 5 |
| **Dependências** | US-EVT-03; gap registrations |
| **Critérios de aceite** | **Given** estou logado com inscrição **When** abro `/kits` **Then** vejo cards com evento e status. **Given** anônimo **Then** vejo conteúdo educativo + CTA Entrar. **Given** sem kits **Then** empty → Explorar corridas |
| **UX** | Diferenciar auth states (Journey 2) |
| **Tech** | Mock até `/users/me/registrations` |
| **Analytics** | `view_kits_list` |
| **Testes** | E2E Journey 2 estados |

### US-KIT-02 — Detalhe do kit e tamanho

| Campo | Conteúdo |
|---|---|
| **Epic** | EP-03 |
| **Feature** | Retirada de Kits (F-03.03) |
| **Título** | Ver local/horário e informar tamanho |
| **História** | Como corredor, quero saber onde retirar o kit e informar meu tamanho de camiseta, para estar pronto no dia |
| **Prioridade** | Must · **SP** | 5 |
| **Dependências** | US-KIT-01 |
| **Critérios de aceite** | **Given** abro um kit **When** a página carrega **Then** vejo itens, local/horário (ou fallback) e posso salvar tamanho com feedback |
| **UX** | `<time datetime>`; form com labels |
| **Tech** | Pickup fields gap; PATCH tamanho a definir |
| **Analytics** | `view_kit_detail` · `save_kit_size` |
| **Testes** | Unit form; E2E salvar tamanho |

### US-KIT-03 — Atalho pós-inscrição para kit

| Campo | Conteúdo |
|---|---|
| **Epic** | EP-03 |
| **Feature** | Kits (F-03.03) |
| **Título** | CTA de kit após inscrição confirmada |
| **História** | Como corredor recém-inscrito, quero ir direto ao kit, para preparar a retirada |
| **Prioridade** | Must · **SP** | 3 |
| **Dependências** | US-EVT-03, US-KIT-02 |
| **Critérios de aceite** | **Given** inscrição concluída **When** vejo a confirmação **Then** há CTA para `/corridas/{slug}/kit` ou `/kits/{id}` |
| **UX** | Banner pós-sucesso |
| **Tech** | Deep link estável |
| **Analytics** | `click_kit_from_registration` |
| **Testes** | E2E pós-inscrição |

---

## 7. Partners

### US-PTR-01 — Listagem de parceiros

| Campo | Conteúdo |
|---|---|
| **Epic** | EP-02 / EP-05 |
| **Feature** | Parceiros (F-02.04, F-05.01) |
| **Título** | Explorar parceiros ativos |
| **História** | Como corredor, quero ver parceiros do ecossistema, para conhecer benefícios disponíveis |
| **Prioridade** | Must · **SP** | 5 |
| **Dependências** | US-FND-02 |
| **Critérios de aceite** | **Given** parceiros ativos **When** abro `/parceiros` **Then** vejo grid com logo/nome/categoria. Inativos não aparecem |
| **UX** | Alt = nome; filtros categoria (Should na mesma story se couber) |
| **Tech** | `GET /partners?active=true` |
| **Analytics** | `view_partners_list` |
| **Testes** | E2E Journey 4 entrada |

### US-PTR-02 — Detalhe do parceiro

| Campo | Conteúdo |
|---|---|
| **Epic** | EP-05 |
| **Feature** | Parceiros (F-05.01) |
| **Título** | Ver benefícios e CTAs do parceiro |
| **História** | Como corredor, quero ver benefícios de um parceiro, para decidir resgatar cupom ou visitar o site |
| **Prioridade** | Must · **SP** | 5 |
| **Dependências** | US-PTR-01 |
| **Critérios de aceite** | **Given** slug válido **When** abro detalhe **Then** vejo descrição, benefits e CTAs. Link externo com `rel=noopener` |
| **UX** | Indicação link externo |
| **Tech** | `GET /partners/:id` |
| **Analytics** | `view_partner_detail` · `click_partner_website` · `click_partner_coupon` |
| **Testes** | E2E detalhe |

### US-PTR-03 — Logo wall na Home

| Campo | Conteúdo |
|---|---|
| **Epic** | EP-02 |
| **Feature** | Parceiros / Home |
| **Título** | Exibir logos de parceiros na Home |
| **História** | Como visitante, quero ver marcas associadas, para confiar na plataforma |
| **Prioridade** | Must · **SP** | 3 |
| **Dependências** | US-HOME-04, US-PTR-01 |
| **Critérios de aceite** | **Given** há parceiros ativos **When** vejo a seção **Then** logos linkam ao detalhe |
| **UX** | Scroll horizontal mobile |
| **Tech** | Reuso PartnerLogoWall |
| **Analytics** | `click_partners_logo` |
| **Testes** | Visual/a11y alt |

---

## 8. Coupons

### US-CPN-01 — Listar cupons autenticado

| Campo | Conteúdo |
|---|---|
| **Epic** | EP-03 / EP-05 |
| **Feature** | Cupons (F-03.04) |
| **Título** | Ver cupons disponíveis |
| **História** | Como corredor autenticado, quero ver cupons ativos, para economizar em provas ou parceiros |
| **Prioridade** | Must · **SP** | 5 |
| **Dependências** | US-AUTH-02 |
| **Critérios de aceite** | **Given** estou logado **When** abro `/cupons` **Then** vejo cupons ativos. **Given** anônimo **Then** redirect login com returnUrl ou teaser |
| **UX** | Badge validade |
| **Tech** | `GET /coupons` |
| **Analytics** | `view_coupons_list` |
| **Testes** | E2E gate auth |

### US-CPN-02 — Resgatar cupom

| Campo | Conteúdo |
|---|---|
| **Epic** | EP-03 / EP-05 |
| **Feature** | Cupons (F-03.04, F-05.02) |
| **Título** | Resgatar cupom elegível |
| **História** | Como corredor, quero resgatar um cupom, para usar o benefício |
| **Prioridade** | Must · **SP** | 5 |
| **Dependências** | US-CPN-01 |
| **Critérios de aceite** | **Given** cupom ativo **When** clico Resgatar **Then** vejo confirmação e status Resgatado. **Given** já resgatado/expirado **Then** ação bloqueada com mensagem |
| **UX** | Feedback sucesso/erro |
| **Tech** | `POST /coupons/:id/redeem` |
| **Analytics** | `redeem_coupon` |
| **Testes** | E2E Journey 3; idempotência |

### US-CPN-03 — Validar código manual

| Campo | Conteúdo |
|---|---|
| **Epic** | EP-05 |
| **Feature** | Cupons (F-05.02) |
| **Título** | Validar código promocional |
| **História** | Como corredor, quero validar um código que recebi, para descobrir se posso resgatar |
| **Prioridade** | Must · **SP** | 3 |
| **Dependências** | US-CPN-01 |
| **Critérios de aceite** | **Given** código válido **When** submeto **Then** vejo cupom correspondente. **Given** inválido **Then** erro claro |
| **UX** | Label no input |
| **Tech** | `POST /coupons/validate` |
| **Analytics** | `validate_coupon_code` |
| **Testes** | Unit + integração |

---

## 9. Concierge (contato)

### US-CNG-01 — Formulário de atendimento

| Campo | Conteúdo |
|---|---|
| **Epic** | EP-02 |
| **Feature** | Concierge (F-02.06) |
| **Título** | Enviar dúvida via Concierge |
| **História** | Como corredor, quero enviar uma mensagem de suporte, para resolver dúvidas que o self-service não cobre |
| **Prioridade** | Should · **SP** | 5 |
| **Dependências** | US-FND-02 |
| **Critérios de aceite** | **Given** estou em `/concierge` **When** envio formulário válido **Then** vejo confirmação. Campos inválidos mostram erros acessíveis |
| **UX** | LGPD; link a partir de Kits/Footer |
| **Tech** | Endpoint a definir; stub aceitável no MVP |
| **Analytics** | `concierge_submit` · `click_concierge_from_kit` |
| **Testes** | Unit validação; E2E submit stub |

---

## 10. Community

### US-COM-01 — Feed de posts

| Campo | Conteúdo |
|---|---|
| **Epic** | EP-06 |
| **Feature** | Comunidade (F-06.01) |
| **Título** | Ver e criar posts no feed |
| **História** | Como corredor autenticado, quero ver e publicar no feed, para participar da comunidade DF |
| **Prioridade** | Must · **SP** | 8 |
| **Dependências** | US-AUTH-02; seed conteúdo |
| **Critérios de aceite** | **Given** logado **When** abro `/comunidade` **Then** vejo feed e posso publicar. **Given** anônimo **Then** teaser + CTA cadastro. **Given** feed vazio **Then** empty com seed/CTA |
| **UX** | Composer acessível |
| **Tech** | `GET/POST /community/posts` |
| **Analytics** | `view_community_feed` · `create_post` |
| **Testes** | E2E Journey 5 parcial |

### US-COM-02 — Curtir e comentar

| Campo | Conteúdo |
|---|---|
| **Epic** | EP-06 |
| **Feature** | Comunidade (F-06.02) |
| **Título** | Interagir em um post |
| **História** | Como corredor, quero curtir e comentar posts, para interagir com outros atletas |
| **Prioridade** | Must · **SP** | 5 |
| **Dependências** | US-COM-01 |
| **Critérios de aceite** | **Given** um post **When** curto **Then** contagem atualiza e `aria-pressed` reflete estado. **When** comento **Then** o comentário aparece na lista |
| **UX** | Nomes acessíveis nas ações |
| **Tech** | like + comments endpoints |
| **Analytics** | `like_post` · `comment_post` |
| **Testes** | E2E Journey 5 |

### US-COM-03 — Entrar em grupos

| Campo | Conteúdo |
|---|---|
| **Epic** | EP-06 |
| **Feature** | Comunidade (F-06.03) |
| **Título** | Listar e entrar em grupos |
| **História** | Como corredor, quero entrar em um grupo por distância/região, para me conectar com pares |
| **Prioridade** | Should · **SP** | 5 |
| **Dependências** | US-COM-01 |
| **Critérios de aceite** | **Given** grupos existentes **When** entro em um **Then** vejo confirmação de membership |
| **UX** | Empty state grupos |
| **Tech** | `GET /community/groups` · `POST .../join` |
| **Analytics** | `join_group` |
| **Testes** | Integração join |

### US-COM-04 — Teaser comunidade na Home

| Campo | Conteúdo |
|---|---|
| **Epic** | EP-06 / EP-02 |
| **Feature** | Home + Community |
| **Título** | Preview de comunidade na Home |
| **História** | Como visitante, quero entrever a comunidade, para me motivar a criar conta |
| **Prioridade** | Must · **SP** | 3 |
| **Dependências** | US-HOME-04, US-COM-01 |
| **Critérios de aceite** | **Given** Home **When** vejo seção Comunidade **Then** vejo preview/teaser e CTA para `/comunidade` |
| **UX** | Sem interação social anônima no MVP |
| **Tech** | featured gap → seed estático ok |
| **Analytics** | `click_community_teaser` |
| **Testes** | E2E CTA |

---

## 11. Blog

### US-BLG-01 — Listagem e artigo

| Campo | Conteúdo |
|---|---|
| **Epic** | EP-02 |
| **Feature** | Blog (F-02.05) |
| **Título** | Ler artigos do blog |
| **História** | Como corredor iniciante, quero ler dicas de treino, para me preparar melhor |
| **Prioridade** | Should · **SP** | 5 |
| **Dependências** | US-FND-02 |
| **Critérios de aceite** | **Given** posts publicados **When** abro `/blog` e um slug **Then** vejo listagem e artigo com meta SEO e reading time |
| **UX** | Hierarquia headings no conteúdo |
| **Tech** | `GET /blog/posts` · `GET /blog/posts/:slug`; ISR |
| **Analytics** | `view_blog_list` · `view_blog_post` |
| **Testes** | SEO smoke; 404 |

### US-BLG-02 — Blog na Home

| Campo | Conteúdo |
|---|---|
| **Epic** | EP-02 |
| **Feature** | Blog / Home |
| **Título** | Mostrar 3 artigos recentes na Home |
| **História** | Como visitante, quero ver conteúdo recente na Home, para aprofundar sem sair da entrada |
| **Prioridade** | Should · **SP** | 3 |
| **Dependências** | US-HOME-04, US-BLG-01 |
| **Critérios de aceite** | **Given** ≥1 post **When** vejo seção Blog **Then** vejo até 3 cards com link ao slug |
| **UX** | Categoria visível |
| **Tech** | perPage=3 |
| **Analytics** | `click_blog_from_home` |
| **Testes** | Unit mapping |

---

## 12. Auth

### US-AUTH-01 — Cadastro

| Campo | Conteúdo |
|---|---|
| **Epic** | EP-03 |
| **Feature** | Autenticação (F-03.01) |
| **Título** | Criar conta de corredor |
| **História** | Como visitante, quero me cadastrar, para acessar inscrição, cupons e comunidade |
| **Prioridade** | Must · **SP** | 5 |
| **Dependências** | API auth; F-01.06 |
| **Critérios de aceite** | **Given** dados válidos **When** submeto cadastro **Then** conta é criada e sou autenticado ou direcionado ao login. E-mail duplicado retorna erro claro |
| **UX** | Labels; autocomplete; termos/privacidade |
| **Tech** | `POST /auth/register` |
| **Analytics** | `view_register` · `register_success` |
| **Testes** | E2E cadastro |

### US-AUTH-02 — Login, sessão e logout

| Campo | Conteúdo |
|---|---|
| **Epic** | EP-03 |
| **Feature** | Auth (F-03.01) |
| **Título** | Entrar e sair com sessão segura |
| **História** | Como corredor, quero entrar e sair da minha conta, para usar áreas autenticadas com segurança |
| **Prioridade** | Must · **SP** | 5 |
| **Dependências** | US-AUTH-01 |
| **Critérios de aceite** | **Given** credenciais válidas **When** faço login **Then** acesso rotas autenticadas. **When** faço logout **Then** sessão encerra. Credenciais inválidas → erro |
| **UX** | Erros não revelam se e-mail existe (Should segurança) |
| **Tech** | login/logout/refresh; cookie httpOnly preferencial (ADR) |
| **Analytics** | `login_success` · `login_error` · `logout` |
| **Testes** | E2E sessão |

### US-AUTH-03 — Proteção de rotas e returnUrl

| Campo | Conteúdo |
|---|---|
| **Epic** | EP-03 |
| **Feature** | Auth (F-03.01) |
| **Título** | Guardar destino após login forçado |
| **História** | Como corredor anônimo, quero voltar para a página que tentei acessar após entrar, para não perder o contexto |
| **Prioridade** | Must · **SP** | 5 |
| **Dependências** | US-AUTH-02 |
| **Critérios de aceite** | **Given** acesso `/cupons` anônimo **When** faço login **Then** retorno a `/cupons`. `returnUrl` externo é rejeitado |
| **UX** | Mensagem “Entre para continuar” |
| **Tech** | Whitelist paths; middleware/guard |
| **Analytics** | `auth_gate_hit` |
| **Testes** | E2E returnUrl; open-redirect negativo |

### US-AUTH-04 — Recuperação de senha

| Campo | Conteúdo |
|---|---|
| **Epic** | EP-03 |
| **Feature** | Auth (F-03.01) |
| **Título** | Redefinir senha esquecida |
| **História** | Como corredor, quero redefinir minha senha, para recuperar acesso à conta |
| **Prioridade** | Must · **SP** | 3 |
| **Dependências** | US-AUTH-02 |
| **Critérios de aceite** | **Given** e-mail cadastrado **When** solicito reset **Then** recebo fluxo de token (ou mensagem genérica). Token válido permite nova senha |
| **UX** | Mensagens genéricas anti-enumeration |
| **Tech** | forgot/reset endpoints |
| **Analytics** | `password_reset_request` · `password_reset_success` |
| **Testes** | Integração token inválido/expirado |

---

## 13. Profile

### US-PRF-01 — Ver e editar perfil

| Campo | Conteúdo |
|---|---|
| **Epic** | EP-03 |
| **Feature** | Perfil (F-03.05) |
| **Título** | Atualizar dados do perfil |
| **História** | Como corredor autenticado, quero editar meu perfil, para manter meus dados corretos |
| **Prioridade** | Must · **SP** | 5 |
| **Dependências** | US-AUTH-02 |
| **Critérios de aceite** | **Given** estou em `/perfil` **When** altero nome e salvo **Then** vejo sucesso e dados persistidos |
| **UX** | Form labels; erros por campo |
| **Tech** | `GET/PATCH /users/me` |
| **Analytics** | `view_profile` · `update_profile` |
| **Testes** | E2E edição |

### US-PRF-02 — Avatar e link no Navbar

| Campo | Conteúdo |
|---|---|
| **Epic** | EP-03 |
| **Feature** | Perfil (F-03.05) |
| **Título** | Acessar perfil pelo Navbar autenticado |
| **História** | Como corredor logado, quero acessar meu perfil pelo menu, para gerenciar minha conta |
| **Prioridade** | Must · **SP** | 3 |
| **Dependências** | US-PRF-01, US-FND-02 |
| **Critérios de aceite** | **Given** sessão ativa **When** vejo Navbar **Then** há entrada Perfil e logout. Avatar com alt |
| **UX** | Estado autenticado vs anônimo distintos |
| **Tech** | AuthProvider + Navbar props |
| **Analytics** | `upload_avatar` (se houver upload) |
| **Testes** | E2E navegação perfil |

---

## 14. Admin

### US-ADM-01 — Shell admin e RBAC

| Campo | Conteúdo |
|---|---|
| **Epic** | EP-04 |
| **Feature** | Administração (F-04.01) |
| **Título** | Acessar painel somente como admin |
| **História** | Como administrador, quero um painel protegido, para operar a plataforma com segurança |
| **Prioridade** | Must · **SP** | 5 |
| **Dependências** | US-AUTH-02 |
| **Critérios de aceite** | **Given** role admin **When** acesso `/admin` **Then** vejo dashboard. **Given** runner **Then** 403 |
| **UX** | Sidebar admin; desktop-first |
| **Tech** | Role guard API + UI |
| **Analytics** | `admin_login` |
| **Testes** | E2E 403 |

### US-ADM-02 — CRUD de eventos e kits

| Campo | Conteúdo |
|---|---|
| **Epic** | EP-04 |
| **Feature** | Admin (F-04.02) |
| **Título** | Publicar e atualizar corridas e kits |
| **História** | Como admin, quero cadastrar eventos e kits, para manter o calendário atualizado |
| **Prioridade** | Must · **SP** | 8 |
| **Dependências** | US-ADM-01 |
| **Critérios de aceite** | **Given** formulário válido **When** publico evento **Then** ele aparece em `/corridas`. Consigo vincular kit e marcar featured |
| **UX** | Validação clara; confirmação delete |
| **Tech** | CRUD API; invalidação cache público |
| **Analytics** | `admin_create_event` · `admin_update_event` |
| **Testes** | E2E criar→listar público |

### US-ADM-03 — CRUD parceiros e cupons

| Campo | Conteúdo |
|---|---|
| **Epic** | EP-04 / EP-05 |
| **Feature** | Admin (F-04.03) |
| **Título** | Gerir parceiros e cupons |
| **História** | Como admin, quero criar parceiros e cupons vinculados, para ativar benefícios |
| **Prioridade** | Must · **SP** | 5 |
| **Dependências** | US-ADM-01, US-PTR-01 |
| **Critérios de aceite** | **Given** crio parceiro e cupom com `partnerId` **When** publico **Then** aparecem nas áreas públicas/autenticadas conforme regra |
| **UX** | Vínculo explícito cupom↔parceiro |
| **Tech** | CRUD partners/coupons |
| **Analytics** | `admin_create_coupon` |
| **Testes** | E2E vínculo |

### US-ADM-04 — CRUD blog

| Campo | Conteúdo |
|---|---|
| **Epic** | EP-04 |
| **Feature** | Admin (F-04.03) |
| **Título** | Publicar artigos no blog |
| **História** | Como admin, quero publicar posts, para alimentar SEO e educação |
| **Prioridade** | Must · **SP** | 5 |
| **Dependências** | US-ADM-01 |
| **Critérios de aceite** | **Given** post publicado **When** visitante abre slug **Then** conteúdo está disponível. Draft não lista no público |
| **UX** | Preview opcional |
| **Tech** | blog CRUD; sanitize HTML |
| **Analytics** | `admin_publish_post` |
| **Testes** | Draft vs published |

### US-ADM-05 — Moderação e usuários (mínimo)

| Campo | Conteúdo |
|---|---|
| **Epic** | EP-04 |
| **Feature** | Admin (F-04.04) |
| **Título** | Listar usuários e moderar post |
| **História** | Como admin, quero listar usuários e remover post ofensivo, para manter a comunidade segura |
| **Prioridade** | Should · **SP** | 3 |
| **Dependências** | US-ADM-01, US-COM-01 |
| **Critérios de aceite** | **Given** post reportável **When** moderador remove **Then** some do feed |
| **UX** | Confirm destrutivo |
| **Tech** | DELETE admin community |
| **Analytics** | `admin_moderate_post` |
| **Testes** | Integração moderação |

---

## 15. Analytics

### US-ANL-01 — Instrumentação do funil principal

| Campo | Conteúdo |
|---|---|
| **Epic** | EP-07 |
| **Feature** | F-07.01 |
| **Título** | Disparar eventos do funil Home→inscrição |
| **História** | Como product manager, quero eventos de analytics no funil crítico, para medir a North Star |
| **Prioridade** | Should · **SP** | 5 |
| **Dependências** | US-HOME-01, US-EVT-03 |
| **Critérios de aceite** | **Given** usuário percorre Home→detalhe→inscrição **When** conclusões ocorrem **Then** eventos documentados são emitidos com propriedades mínimas (`source`, `event_id`) |
| **UX** | Sem impacto perceptível |
| **Tech** | Helper analytics; schema no repo |
| **Analytics** | (define o próprio contrato) |
| **Testes** | Unit spy de dispatch |

### US-ANL-02 — Documento de métricas

| Campo | Conteúdo |
|---|---|
| **Epic** | EP-07 |
| **Feature** | F-07.02 |
| **Título** | Publicar `metrics.md` com baselines |
| **História** | Como stakeholder, quero KPIs oficiais documentados, para alinhar sucesso do MVP |
| **Prioridade** | Must · **SP** | 3 |
| **Dependências** | Product Vision §7 |
| **Critérios de aceite** | **Given** release MVP **When** consulto `docs/product/metrics.md` **Then** vejo North Star, KPIs, owners e cadência de revisão |
| **UX** | — |
| **Tech** | Markdown versionado |
| **Analytics** | — |
| **Testes** | Review de doc |

---

## 16. Matriz de rastreabilidade Epic → Feature → Story

| Epic | Feature (Backlog / Catálogo) | Stories |
|---|---|---|
| **EP-01 Fundação** | F-01.02 Butterfly UI | US-FND-01 |
| | F-01.03 Layout / AppShell | US-FND-02 |
| | F-01.07 Testes | US-FND-03 |
| **EP-02 Experiência Pública** | Home (F-02.01) | US-HOME-01, US-HOME-03, US-HOME-04 |
| | Evento em Destaque (F-02.03) | US-HOME-02 |
| | Newsletter (F-02.07) | US-HOME-05 |
| | Corridas listagem/detalhe (F-02.02) | US-EVT-01, US-EVT-02 |
| | Parceiros vitrine (F-02.04) | US-PTR-01, US-PTR-03 |
| | Concierge (F-02.06) | US-CNG-01 |
| | Blog (F-02.05) | US-BLG-01, US-BLG-02 |
| **EP-03 Área do Corredor** | Inscrição (F-03.02) | US-EVT-03, US-EVT-04 |
| | Kits (F-03.03) | US-KIT-01, US-KIT-02, US-KIT-03 |
| | Cupons corredor (F-03.04) | US-CPN-01, US-CPN-02 |
| | Auth (F-03.01) | US-AUTH-01…04 |
| | Perfil (F-03.05) | US-PRF-01, US-PRF-02 |
| **EP-04 Administração** | Painel RBAC (F-04.01) | US-ADM-01 |
| | CRUD eventos/kits (F-04.02) | US-ADM-02 |
| | CRUD blog/parceiros/cupons (F-04.03) | US-ADM-03, US-ADM-04 |
| | Usuários/moderação (F-04.04) | US-ADM-05 |
| **EP-05 Marketplace** | Modelo parceiros (F-05.01) | US-PTR-01, US-PTR-02 |
| | Cupons patrocinados (F-05.02) | US-CPN-02, US-CPN-03, US-ADM-03 |
| **EP-06 Comunidade** | Feed (F-06.01) | US-COM-01, US-COM-04 |
| | Likes/comentários (F-06.02) | US-COM-02 |
| | Grupos (F-06.03) | US-COM-03 |
| **EP-07 Analytics** | Instrumentação (F-07.01) | US-ANL-01 |
| | Metrics doc (F-07.02) | US-ANL-02 |

### Mapa Story → Jornada

| Jornada | Stories principais |
|---|---|
| J1 Encontrar corrida | US-HOME-01…03 · US-EVT-01…03 · US-AUTH-03 |
| J2 Retirada de kit | US-KIT-01…03 · US-EVT-03 |
| J3 Cupons | US-CPN-01…03 · US-AUTH-03 |
| J4 Parceiros | US-PTR-01…03 |
| J5 Comunidade | US-COM-01…04 · US-AUTH-01 |

---

## 17. Ordem sugerida no board (por sprint)

| Sprint | Stories (ordem) |
|---|---|
| 02 | US-FND-01 |
| 03 | US-FND-02 |
| 04 | US-HOME-01 → 02 → 03 → 04 → 05 |
| 05 | US-EVT-01 → 02 · US-AUTH-01…03 (mínimo) · US-EVT-03 → 04 · US-KIT-01…03 |
| 06 | US-PTR-01 → 02 → 03 |
| 07 | US-CPN-01 → 02 → 03 |
| 08 | US-CNG-01 |
| 09 | US-COM-01 → 02 → 04 → 03 |
| 10 | US-BLG-01 → 02 |
| 11 | US-AUTH-04 · US-PRF-01 → 02 (fechar auth) |
| 12 | US-ADM-01 → 02 → 03 → 04 → 05 |
| 13 | US-FND-03 · US-ANL-01 |
| 14–15 | US-ANL-02 · hardening (F-01.08 fora deste catálogo de stories de produto) |

**Decisão de planning:** Auth mínimo (US-AUTH-01…03) entra na Sprint 05 se a inscrição bloquear — mesmo o roadmap listando Login na 11. Documentar split “Auth MVP” vs “Auth completo + Profile” no board.

---

## 18. Definition of Ready / Done (Story)

> **Fonte oficial:** [definition-of-ready-and-done.md](../engineering/definition-of-ready-and-done.md) (PB-035).

### Ready (resumo)

- [ ] ID, Epic, Feature e Gherkin preenchidos
- [ ] Dependências conhecidas (API gap = spike ou mock aceito)
- [ ] UX acordado (ou link wireframe/spec)
- [ ] SP estimado no planning

### Done (resumo)

- [ ] Critérios Given/When/Then passam
- [ ] UX + Tech + Analytics da story atendidos
- [ ] Testes listados executados
- [ ] Status no board; DoD da Feature ([feature-catalog.md](./feature-catalog.md) §15) ao fechar o conjunto

---

## 19. Fora deste catálogo (Won't MVP)

Não storyificadas aqui (constam só no backlog):

- Wishlist de eventos  
- Self-service organizador  
- Dashboard do parceiro  
- Rankings avançados / pós-prova  
- Relatórios B2B  

---

> Manter IDs estáveis. Novas stories Must recebem próximo `NN` do domínio. Recalibrar SP após velocity real das Sprints 02–04.
