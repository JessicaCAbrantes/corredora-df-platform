# Feature Specifications — Plataforma Corredora DF

**PB-031** · Especificações técnicas oficiais para Frontend, Backend, QA e DevOps.

| Campo | Valor |
|---|---|
| **Status** | Aprovado |
| **Versão** | 1.0 |
| **Última atualização** | 2026-07-13 |
| **Complementa** | [feature-catalog.md](./feature-catalog.md) (produto) · este doc (técnico) |

---

## 1. Decisões arquiteturais (plataforma)

Estas decisões aplicam-se a **todas** as features abaixo.

| Decisão | Escolha | Justificativa |
|---|---|---|
| **App Router + RSC** | Next.js Server Components por padrão | Menos JS no cliente; SEO e LCP melhores na Home/listagens |
| **Feature-Based Design** | `apps/web/features/<domínio>/` | Domínio coeso (components, hooks, services, types); evita god-folders |
| **Design system separado** | `@corredora/ui` (`packages/ui`) | Reuso visual sem acoplar o app ao Tailwind do pacote |
| **API-first** | Contratos em `docs/api/` antes do NestJS | Front e back evoluem em paralelo com mocks tipados |
| **REST `/api/v1`** | NestJS + Prisma + PostgreSQL | CRUD previsível; Prisma acelera schema alinhado às entidades abaixo |
| **Auth Bearer + refresh** | JWT access curto + refresh | Stateless nas APIs; refresh no backend controla revogação |
| **Auth progressiva** | Leitura pública; escrita autenticada | Alinha às jornadas (descoberta sem login) |
| **Route language** | Português nas URLs públicas (`/corridas`) | SEO local DF; pastas de feature em inglês |
| **Concierge (Kits)** | Domínio de **retirada de kits** neste documento | No produto, o atendimento humano “Concierge” é módulo à parte (Sprint 08); kits são utilidade pós-inscrição sob `features/events` + `/kits` |
| **Analytics** | Eventos nomeados por domínio | Homogêneo para QA e dashboards (EP-07) |
| **Testes** | Pirâmide: unit → integração → E2E nas jornadas | [engineering/07-testing.md](../engineering/07-testing.md) |

### Camadas no frontend (por feature)

```text
app/<rota>/page.tsx          → thin route (não contém regra de negócio)
features/<x>/components/     → UI da feature
features/<x>/services/       → fetch /api/v1 (server) ou client API
features/<x>/hooks/          → estado interativo (Client Components)
features/<x>/types/          → DTOs alinhados ao contrato API
@corredora/ui                → primitivos (Button, Hero, Navbar, Layout…)
```

---

## 2. Home

| Campo | Detalhe |
|---|---|
| **Pacote** | `features/home/` |
| **Épico / Sprint** | EP-02 · Sprint 04 |
| **Objetivo** | Compor a landing oficial e orquestrar dados de múltiplos domínios sem duplicar lógica |
| **Usuários** | Visitante anônimo (primário); autenticado (seções kits/cupons/comunidade enriquecidas) |

### Componentes

| Camada | Itens |
|---|---|
| `@corredora/ui` | `Layout`, `Navbar`, `Hero`, `Section`, `Container`, `Stack`, `Grid`, `Button` |
| Feature | `HomePage`, `FeaturedEventSection`, `UpcomingEventsSection`, `KitPickupSection`, `CouponsSection`, `PartnersSection`, `CommunitySection`, `BlogSection`, `NewsletterSection` |
| Layout app | `Footer` (Sprint 03) |

**Decisão:** Home **orquestra**; não reimplementa listagens. Serviços de `events`, `partners`, `blog`, etc. são importados — single source of truth por domínio.

### Fluxo principal

```text
1. GET / (RSC)
2. HomePage chama getHomeData() em paralelo (Promise.all)
3. Render: Navbar → Hero → seções → Footer
4. CTAs navegam para rotas de domínio (/corridas/{slug}, /parceiros, …)
5. Scroll indicator → #main-content
```

### Estados da UI

| Estado | Comportamento |
|---|---|
| Loading | Streaming/Suspense por seção (ideal) ou skeleton único |
| Success | Todas as seções Must; Could ocultas se vazio |
| Empty por seção | Ocultar ou EmptyState conforme [Home IA](./home-information-architecture.md) §3.4 |
| Error parcial | Seção falha isolada; demais renderizam (degradação) |
| Auth vs anônimo | Teasers vs dados reais em Kits/Cupons/Comunidade |

### Rotas

| Rota | Tipo |
|---|---|
| `/` | RSC, público |

### APIs

```text
GET /events?featured=true&limit=1
GET /events?status=active&dateFrom=today&sort=date&perPage=6
GET /partners?active=true&perPage=10
GET /blog/posts?sort=publishedAt&perPage=3
GET /coupons/featured          # gap — até lá: mock/CMS
GET /community/posts/featured  # gap
POST /newsletter/subscribe     # gap
GET /ads?position=home_banner  # Could
```

### Entidades do banco

Leitura: `events`, `partners`, `blog_posts`, `coupons` (featured), `community_posts` (featured), `newsletter_subscriptions`, `ads`.

### Permissões

Público. Personalização condicionada a sessão (cookie/header no RSC).

### Eventos de Analytics

`view_home` · `click_hero_cta` · `click_featured_event` · `click_upcoming_event` · `newsletter_submit` · `scroll_depth`

### Testes previstos

| Tipo | Cenário |
|---|---|
| Unit | Mapeamento DTO → props de seção; exclusão do featured na lista |
| Integração | `getHomeData` com mocks paralelos |
| E2E | Hero CTA → `/corridas`; scroll → `#main-content`; h1 único |

### Performance

- Above-the-fold: Hero estático ou dados cached (`revalidate`)
- Abaixo da dobra: lazy sections / streaming
- `next/image` nas capas; LCP &lt; 2.5s

### Acessibilidade

Um `h1` no Hero; `h2` por seção; landmarks; contraste do overlay.

### Evoluções futuras

Home personalizada; A/B de CTA; edge cache por região.

---

## 3. Events

| Campo | Detalhe |
|---|---|
| **Pacote** | `features/events/` |
| **Épico / Sprint** | EP-02 / EP-03 · Sprint 05 |
| **Objetivo** | Listar, detalhar e registrar inscrição em corridas |
| **Usuários** | Corredor iniciante/experiente; admin (escrita via Admin) |

### Componentes

`EventListPage`, `EventFilters`, `EventCard`, `EventDetailPage`, `RegistrationCta`, `RegistrationStatusBadge`, `FeaturedEventCard` (consumido pela Home).

**Decisão:** Inscrição é Client Component isolado; o restante do detalhe permanece RSC para SEO.

### Fluxo principal

```text
Listagem:
  /corridas → GET /events?filters → EventCard[] → /corridas/{slug}

Detalhe + inscrição:
  GET /events/:id
  [auth?] → POST /events/:id/register → confirmação → deep link /kits
```

### Estados da UI

| Estado | Listagem | Detalhe / inscrição |
|---|---|---|
| Loading | Skeleton grid | Skeleton + CTA disabled |
| Empty | EmptyState + CTA Home | — |
| Success | Cards | Conteúdo + CTA |
| Registration closed / full | — | CTA desabilitado + mensagem API |
| Already registered | — | Badge + link kit |
| Unauthorized | — | Redirect login `?returnUrl=` |
| Error | Retry | Toast/alert inline |

### Rotas

| Rota | Descrição |
|---|---|
| `/corridas` | Listagem |
| `/corridas/{slug}` | Detalhe |

### APIs

```text
GET    /events
GET    /events/:id
POST   /events/:id/register
DELETE /events/:id/register
```

Filtros: `status`, `category`, `city`, `dateFrom`, `dateTo`, `registrationOpen`, `featured` (gap).

### Entidades do banco

```text
events
registrations  (user_id, event_id, status, shirt_size?, created_at)
events_partners (N:N opcional)
```

### Permissões

| Ação | Papel |
|---|---|
| Listar / ver | public |
| Inscrever / cancelar | authenticated |
| CRUD evento | admin |

### Eventos de Analytics

`view_events_list` · `apply_event_filter` · `view_event_detail` · `start_registration` · `complete_registration` · `cancel_registration`

### Testes previstos

E2E Journey 1; unit dos filtros; contrato de erros `EVENT_FULL`, `ALREADY_REGISTERED`.

### Performance

- Listagem: paginação offset (`page`, `perPage`); ISR/`revalidate` para catálogo público
- Detalhe: cache por slug; invalidar após update admin

### Acessibilidade

Filtros com `<label>`; status não só por cor; erros ligados ao CTA.

### Evoluções futuras

Wishlist; waitlist; pagamento; recomendação.

---

## 4. Concierge (Kits) — Retirada de Kits

> **Escopo deste spec:** utilidade pós-inscrição (**kits**). O módulo de atendimento **Concierge** (`/concierge`, formulário humano — Sprint 08) é satélite e pode linkar daqui em estados de dúvida.

| Campo | Detalhe |
|---|---|
| **Pacote** | `features/events/` (kits) + rota `/kits` · Concierge contato: `features/concierge/` |
| **Épico / Sprint** | EP-03 · Sprint 05 (kits) · Sprint 08 (contato) |
| **Objetivo** | Expor status, local e janela de retirada do kit do corredor inscrito |
| **Usuários** | Corredor autenticado com registration; anônimo (educativo) |

### Componentes

`KitListPage`, `KitCard`, `KitDetail`, `KitSizeForm`, `KitPickupSection` (Home), `ConciergeLink` (fuga para suporte).

**Decisão:** Kits vivem no bounded context de **Events** (API `/kits` ligada a `eventId`), mas a UX usa rotas `/kits` espelhando a Navbar — evita confundir com “Concierge” de atendimento.

### Fluxo principal

```text
1. Login → GET /users/me/registrations (+ kits)
2. /kits lista pendentes
3. /kits/{id} → itens, local, horário, tamanho
4. PATCH tamanho (a formalizar)
5. Dúvida → /concierge
```

### Estados da UI

| Estado | Comportamento |
|---|---|
| Anônimo | Copy educativa + CTA Entrar |
| Sem registrations | EmptyState → Explorar corridas |
| Pending pickup | Card com data/local |
| Preparing | Status “Em preparação” |
| Size missing | Form destaque |
| Error / gap API | Fallback textual + Concierge |

### Rotas

| Rota | Descrição |
|---|---|
| `/kits` | Lista |
| `/kits/{id}` | Detalhe |
| `/corridas/{slug}/kit` | Atalho pós-inscrição |
| `/concierge` | Contato (módulo aparte) |

### APIs

```text
GET /kits
GET /kits/:id
GET /events/:eventId/kits
GET /users/me/registrations   # gap Must
# Futuro: pickupLocation/Start/End no Kit ou Event
POST /concierge/messages      # contato (a definir) — Sprint 08
```

### Entidades do banco

```text
kits (event_id, name, items[], sizes[], image, pickup_*)
registrations.shirt_size
```

### Permissões

| Ação | Papel |
|---|---|
| Ver kit de evento | public |
| Meus kits / tamanho | authenticated |
| CRUD kit | admin |

### Eventos de Analytics

`view_kits_list` · `view_kit_detail` · `save_kit_size` · `click_concierge_from_kit`

### Testes previstos

E2E Journey 2; empty anônimo vs autenticado; deep link pós-inscrição.

### Performance

Página leve; dados por usuário **sem cache compartilhado** (privado).

### Acessibilidade

Status em texto; datas em formato legível (`<time datetime>`).

### Evoluções futuras

Agendamento; QR check-in; mapa; push 48h; atendimento Concierge com ticket ID.

---

## 5. Coupons

| Campo | Detalhe |
|---|---|
| **Pacote** | `features/coupons/` |
| **Épico / Sprint** | EP-03 / EP-05 · Sprint 07 |
| **Objetivo** | Listar, validar e resgatar cupons do corredor |
| **Usuários** | Corredor autenticado; anônimo (teaser Home) |

### Componentes

`CouponListPage`, `CouponCard`, `CouponDetail`, `RedeemButton`, `ValidateCodeForm`, `CouponsSection` (Home teaser).

**Decisão:** Resgate é mutação client-side com feedback otimista opcional; listagem RSC autenticada (headers). Código **nunca** no teaser público.

### Fluxo principal

```text
/cupons → GET /coupons → detalhe → POST /coupons/:id/redeem
alternativa: POST /coupons/validate (código manual)
```

### Estados da UI

| Estado | UI |
|---|---|
| Anônimo | Teaser / gate login |
| Active | Resgatável |
| Redeemed / Expired | Badge + disable |
| Empty | EmptyState → Parceiros |
| Error redeem | Mensagem API |

### Rotas

`/cupons` · `/cupons/{id}`

### APIs

```text
GET  /coupons
GET  /coupons/:id
POST /coupons/:id/redeem
POST /coupons/validate
GET  /coupons/featured   # gap Should
```

### Entidades do banco

```text
coupons (code, title, discount_*, partner_id, expires_at, status)
coupon_redemptions (user_id, coupon_id, redeemed_at)
```

### Permissões

Autenticado (list/redeem) · Admin (CRUD) · Featured público (futuro).

### Eventos de Analytics

`view_coupons_list` · `view_coupon_detail` · `redeem_coupon` · `validate_coupon_code`

### Testes previstos

E2E Journey 3; duplo resgate (idempotência/409); validação de código inválido.

### Performance

Lista pequena; cache curto ou none (dados por usuário).

### Acessibilidade

Valor/desconto em texto; formulário de código com label e `autocomplete`.

### Evoluções futuras

Aplicar no checkout de inscrição; cupom de boas-vindas; histórico no perfil.

---

## 6. Partners

| Campo | Detalhe |
|---|---|
| **Pacote** | `features/partners/` |
| **Épico / Sprint** | EP-02 / EP-05 · Sprint 06 |
| **Objetivo** | Vitrine e detalhe de parceiros com benefícios |
| **Usuários** | Público geral; admin (CRUD) |

### Componentes

`PartnerListPage`, `PartnerCard`, `PartnerDetail`, `PartnerLogoWall` (Home), `BenefitsList`.

**Decisão:** Parceiros são entidade comercial independente; cupons referenciam `partner_id` (não o inverso obrigatório na listagem).

### Fluxo principal

```text
/parceiros → GET /partners?active=true
→ /parceiros/{slug} → CTA cupom | site externo (rel=noopener)
```

### Estados da UI

Loading · Empty · Success · Inactive (404) · External link confirm (opcional).

### Rotas

`/parceiros` · `/parceiros/{slug}`

### APIs

```text
GET /partners
GET /partners/:id
POST|PATCH|DELETE /partners   # admin
```

### Entidades do banco

```text
partners (slug, logo, category, benefits[], active, website)
```

### Permissões

Leitura public · CRUD admin.

### Eventos de Analytics

`view_partners_list` · `view_partner_detail` · `click_partner_website` · `click_partner_coupon`

### Testes previstos

E2E Journey 4; apenas `active=true`; alt nos logos.

### Performance

Logo wall: sprites/images otimizadas; listagem ISR.

### Acessibilidade

`alt` = nome do parceiro; indicação de link externo.

### Evoluções futuras

Dashboard parceiro; ads click tracking; badge “cupom ativo”.

---

## 7. Community

| Campo | Detalhe |
|---|---|
| **Pacote** | `features/community/` |
| **Épico / Sprint** | EP-06 · Sprint 09 |
| **Objetivo** | Feed social, interação e grupos |
| **Usuários** | Corredor autenticado; anônimo (teaser/preview) |

### Componentes

`CommunityFeedPage`, `PostCard`, `PostComposer`, `PostDetail`, `CommentList`, `LikeButton`, `GroupList`, `JoinGroupButton`, `CommunitySection` (Home).

**Decisão:** Quase toda interação é Client Component; feed inicial pode ser RSC autenticado. Seed de conteúdo obrigatório no launch (evita empty city).

### Fluxo principal

```text
/comunidade → feed → post detail → like/comment
→ grupos → join
```

### Estados da UI

| Estado | UI |
|---|---|
| Anônimo | Teaser + CTA cadastro |
| Empty feed | Seed / empty com CTA publicar |
| Post pending moderation | Feedback ao autor (futuro) |
| Error mutate | Rollback UI + toast |

### Rotas

`/comunidade` · `/comunidade/posts/{id}` · `/comunidade/grupos`

### APIs

```text
GET|POST /community/posts
POST     /community/posts/:id/like
GET|POST /community/posts/:id/comments
GET      /community/groups
POST     /community/groups/:id/join
GET      /community/rankings
GET      /community/posts/featured  # gap
```

### Entidades do banco

```text
community_posts, comments, likes
groups, group_memberships
```

### Permissões

Autenticado (CRUD próprio) · Admin (moderação) · Featured público (futuro).

### Eventos de Analytics

`view_community_feed` · `create_post` · `like_post` · `comment_post` · `join_group`

### Testes previstos

E2E Journey 5; autorização delete (autor vs outro); rate limit smoke (futuro).

### Performance

Feed paginado; lazy comments; sem realtime no MVP (poll/refresh manual).

**Decisão:** Sem WebSocket no MVP — reduz complexidade DevOps; revalidação on focus.

### Acessibilidade

Composer com label; botão like com `aria-pressed`.

### Evoluções futuras

Realtime; grupo por evento; rankings; denúncia.

---

## 8. Blog

| Campo | Detalhe |
|---|---|
| **Pacote** | `features/blog/` |
| **Épico / Sprint** | EP-02 · Sprint 10 |
| **Objetivo** | Conteúdo editorial público com SEO |
| **Usuários** | Visitantes; admin (publicação) |

### Componentes

`BlogListPage`, `BlogPostCard`, `BlogPostPage`, `CategoryFilter`, `BlogSection` (Home).

**Decisão:** MD/HTML sanitizado no backend; front renderiza conteúdo já confiável. Slugs estáveis para SEO.

### Fluxo principal

```text
/blog → GET /blog/posts → /blog/{slug} → GET /blog/posts/:slug
```

### Estados da UI

Loading · Empty · Success · 404 slug · Draft (admin only — não listar ao público).

### Rotas

`/blog` · `/blog/{slug}`

### APIs

```text
GET /blog/posts
GET /blog/posts/:slug
GET /blog/categories
POST|PATCH|DELETE /blog/posts  # admin
```

### Entidades do banco

```text
blog_posts (slug, excerpt, content, cover_image, category, author_id, published_at, reading_time)
```

### Permissões

Leitura public · Escrita admin.

### Eventos de Analytics

`view_blog_list` · `view_blog_post` · `click_blog_from_home`

### Testes previstos

Meta title/description; headings no artigo; 404.

### Performance

ISR por slug; imagens `next/image`; HTML estático máximo.

### Acessibilidade

Hierarquia de headings no corpo; figcaption quando couber.

### Evoluções futuras

Related posts; RSS; CMS headless.

---

## 9. Profile

| Campo | Detalhe |
|---|---|
| **Pacote** | `features/profile/` |
| **Épico / Sprint** | EP-03 · Sprint 11 |
| **Objetivo** | CRUD do próprio perfil |
| **Usuários** | Corredor autenticado |

### Componentes

`ProfilePage`, `ProfileForm`, `AvatarUpload`, `ProfileNavLink`.

**Decisão:** Profile **não** embute auth UI — só consome sessão; Auth feature dona do login.

### Fluxo principal

```text
GET /auth/me ou /users/me → form → PATCH /users/me → toast sucesso
```

### Estados da UI

Loading · Success · Validation error · Upload error · Unauthorized redirect.

### Rotas

`/perfil`

### APIs

```text
GET   /auth/me | /users/me
PATCH /users/me
# futuro: avatar upload (storage)
GET   /users/me/registrations
```

### Entidades do banco

```text
users (name, email, role, avatar_url, …)
user_profiles (opcional: bio, city, preferences jsonb)
```

### Permissões

Somente o próprio usuário (enforce `sub` no token).

### Eventos de Analytics

`view_profile` · `update_profile` · `upload_avatar`

### Testes previstos

E2E editar nome; 401 sem sessão; não editar outro user (API).

### Performance

Página client leve; sem SSR sensível além do user atual.

### Acessibilidade

Labels; erros `aria-describedby`; avatar `alt`.

### Evoluções futuras

Preferências de notificação; privacidade; histórico de provas.

---

## 10. Auth

| Campo | Detalhe |
|---|---|
| **Pacote** | `features/auth/` |
| **Épico / Sprint** | EP-03 · Sprint 11 |
| **Objetivo** | Registrar, autenticar, renovar e encerrar sessão |
| **Usuários** | Público (register/login); autenticado (logout/refresh/me) |

### Componentes

`LoginForm`, `RegisterForm`, `ForgotPasswordForm`, `AuthProvider`, `RequireAuth` (guard), CTAs Navbar.

**Decisões:**

1. **Access token** em memória ou cookie httpOnly (preferência: **httpOnly cookie** setado pela API/BFF para mitigar XSS) — ADR a formalizar.
2. **`returnUrl`** whitelist de paths internos apenas.
3. Guards em Server Components via session helper + middleware Next.

### Fluxo principal

```text
register → login → store session
rota protegida sem sessão → /entrar?returnUrl=
refresh em 401 → retry uma vez → logout se falhar
```

### Estados da UI

Idle · Submitting · Field errors · Auth error (401/403) · Success redirect · Session expired modal.

### Rotas

`/entrar` · `/cadastrar` · `/recuperar-senha` · `/redefinir-senha`

### APIs

```text
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/refresh
POST /auth/forgot-password
POST /auth/reset-password
GET  /auth/me
```

### Entidades do banco

```text
users (password_hash, role: runner|admin|…)
refresh_tokens (hashed, expires_at, revoked_at)
password_reset_tokens
```

### Permissões

Auth endpoints públicos (exceto logout/refresh/me) · Roles no JWT.

### Eventos de Analytics

`view_login` · `view_register` · `register_success` · `login_success` · `login_error` · `logout` · `auth_gate_hit`

### Testes previstos

E2E register→login→protected; returnUrl; refresh; logout limpa sessão.

### Performance

Forms client-only; zero bloquear LCP global.

### Acessibilidade

Autocomplete `email`/`current-password`/`new-password`; erros anunciados.

### Evoluções futuras

OAuth; 2FA; magic link; device sessions.

---

## 11. Admin

| Campo | Detalhe |
|---|---|
| **Pacote** | Rotas `/admin` (ou futuro `apps/admin`) + serviços admin nas features |
| **Épico / Sprint** | EP-04 · Sprint 12 |
| **Objetivo** | CRUD operacional e RBAC para a equipe Corredora DF |
| **Usuários** | `role=admin` |

### Componentes

`AdminShell`, `AdminDashboard`, tabelas/forms por domínio (Events, Kits, Partners, Coupons, Blog, Users), `ConfirmDialog`.

**Decisões:**

1. **MVP = mesmas APIs** com role check — sem BFF admin separado.
2. **Desktop-first** aceitável; tabelas com scroll horizontal.
3. Self-service organizador **fora** do MVP (F-04.05 Won't).

### Fluxo principal

```text
/admin → guard role=admin
→ CRUD events → PATCH → invalidação cache público
→ mesma lógica parceiros/cupons/blog/kits
```

### Estados da UI

Unauthorized 403 · Loading table · Empty · Form validation · Optimistic update / revalidate · Delete confirm.

### Rotas

```text
/admin
/admin/eventos
/admin/kits
/admin/parceiros
/admin/cupons
/admin/blog
/admin/usuarios
```

### APIs

Todos os `POST|PATCH|DELETE` admin documentados nos recursos REST + moderação community.

### Entidades do banco

Todas as entidades de domínio + `users.role` + audit log (Should futuro).

### Permissões

Strict `admin`. Testes devem garantir 403 para `runner`.

### Eventos de Analytics

`admin_login` · `admin_create_event` · `admin_update_event` · `admin_publish_post` · `admin_moderate_post`

### Testes previstos

E2E: criar evento → aparece em `/corridas`; 403 runner; soft-delete não lista no público.

### Performance

Admin sem ISR agressivo; páginas autenticadas sem cache CDN de HTML.

### Acessibilidade

Tabelas com `<th>`; dialogs focáveis; confirmação de destruição.

### Evoluções futuras

`apps/admin` separado; audit trail; drafts; self-service organizador.

---

## 12. Mapa geral da plataforma

### 12.1 Diagrama de contexto

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                         Usuários                                         │
│  Visitante │ Corredor │ Admin │ (futuro: Organizador / Parceiro)         │
└───────────────┬───────────────────┬──────────────────┬───────────────────┘
                │ HTTPS             │                  │
                ▼                   ▼                  ▼
┌────────────────────────┐  ┌──────────────┐  ┌────────────────────────────┐
│      apps/web          │  │  CDN/Assets  │  │ Analytics (futuro)         │
│  Next.js App Router    │  │  imagens     │  │ funil EP-07                │
│  features/* · RSC/CCA  │  └──────────────┘  └────────────────────────────┘
└────────────┬───────────┘
             │ REST Bearer  /api/v1
             ▼
┌────────────────────────┐
│      apps/api          │
│  NestJS modules        │
│  auth · events · kits  │
│  coupons · partners    │
│  community · blog      │
│  users · ads · …       │
└────────────┬───────────┘
             │ Prisma
             ▼
┌────────────────────────┐
│  PostgreSQL (Docker)   │
│  entidades §12.3       │
└────────────────────────┘

packages/ui (@corredora/ui) ──► consumido por apps/web
docs/api ──► contrato compartilhado FE/BE
```

### 12.2 Mapa Feature × rota × pacote × API

```text
URL                    Feature package         API root
─────────────────────────────────────────────────────────────
/                      home                    multi (events, partners, …)
/corridas              events                  /events
/corridas/[slug]       events                  /events/:id
/kits                  events (kits UX)        /kits
/cupons                coupons                 /coupons
/parceiros             partners                /partners
/comunidade            community               /community/*
/blog                  blog                    /blog/posts
/perfil                profile                 /users/me · /auth/me
/entrar · /cadastrar   auth                    /auth/*
/concierge             concierge (contato)     a definir
/admin/*               admin shell + domains   CRUD admin
```

### 12.3 Modelo de dados (visão ER)

```text
users ─┬─< registrations >─┬─ events ─┬─< kits
       │                   │          └─< events_partners >─ partners
       ├─< coupon_redemptions >─ coupons >─ partners
       ├─< community_posts ─< comments / likes
       ├─< group_memberships >─ groups
       └─ refresh_tokens

blog_posts ─ author → users
ads ─ partner → partners
newsletter_subscriptions
```

### 12.4 Fluxo de confiança (authZ)

```text
Request → API Gateway/Nest Guard
  ├─ public routes → handler
  ├─ JWT valid? → role check
  │     ├─ runner → own resources
  │     └─ admin → CRUD
  └─ 401 / 403
```

### 12.5 Pipeline DevOps (alvo)

```text
PR → CI (lint, typecheck, unit)
  → preview web
  → E2E smoke (Playwright)
merge → staging (web + api + db migrate)
  → produção (Sprint 14–15)
```

### 12.6 Dependências entre features

```text
Auth ──────────────► Profile, Coupons, Community, Registration, Kits (meus)
Events ────────────► Home (destaque/próximas), Kits, Admin
Partners ──────────► Home, Coupons, Ads
Blog ──────────────► Home
Community ─────────► Home (teaser)
Admin ─────────────► todos os CRUDs públicos
Home ──────────────► orquestra leituras (não possui write de domínio)
Concierge contato ─► fuga de Kits / Footer (Sprint 08)
```

---

## 13. Contratos transversais

| Tema | Spec |
|---|---|
| Resposta JSON | [response-pattern.md](../api/response-pattern.md) |
| Paginação | [pagination.md](../api/pagination.md) |
| Erros | [errors.md](../api/errors.md) |
| Versionamento | [versioning.md](../api/versioning.md) |
| A11y | [05-accessibility.md](../engineering/05-accessibility.md) |
| Performance | [06-performance.md](../engineering/06-performance.md) |
| Segurança | [08-security.md](../engineering/08-security.md) |
| Release | [10-release-process.md](../engineering/10-release-process.md) |

### Metas de performance (globais)

| Métrica | Alvo |
|---|---|
| Lighthouse Performance | ≥ 90 |
| LCP | &lt; 2.5s |
| CLS | &lt; 0.1 |
| Bundle JS inicial | &lt; 200kb gzip |

---

## 14. Gaps técnicos a fechar antes/durante implementação

| Gap | Features | Owner |
|---|---|---|
| `featured` em events | Home, Events | Backend |
| Pickup window em kits | Concierge (Kits) | Backend + DB |
| `/users/me/registrations` | Kits, Profile | Backend |
| `/coupons/featured` | Home, Coupons | Backend |
| Community featured público | Home, Community | Backend + Produto |
| Estratégia cookie vs bearer (ADR) | Auth | Arquitetura |
| Newsletter + Concierge contact endpoints | Home, Concierge | Backend |

---

## 15. Referências

| Documento | Uso |
|---|---|
| [feature-catalog.md](./feature-catalog.md) | Visão produto das features |
| [product-backlog.md](./product-backlog.md) | Épicos e MoSCoW |
| [user-journeys.md](./user-journeys.md) | Fluxos de QA E2E |
| [home-information-architecture.md](./home-information-architecture.md) | Composição Home |
| [architecture/README.md](../architecture/README.md) | Visão C4 inicial |
| [database/README.md](../database/README.md) | Convenções DB |

---

> Atualizar este documento quando contratos API, ADRs de sessão ou schema Prisma forem fechados. Mudanças de rota ou entidade exigem sync com Catálogo (PB-030) e Backlog (PB-029).
