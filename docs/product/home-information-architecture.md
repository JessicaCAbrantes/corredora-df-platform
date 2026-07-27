# Home — Information Architecture

**PB-026** · Documento oficial da arquitetura da página inicial da Plataforma Corredora DF.

| Campo | Valor |
|---|---|
| **Status** | Aprovado para desenvolvimento |
| **Sprint alvo** | Sprint 04 — Home |
| **Feature** | `apps/web/features/home/` |
| **Rota** | `/` |
| **Última atualização** | 2026-07-13 |

---

## 1. Visão geral

A Home é a **porta de entrada** da plataforma. Ela deve, em uma única rolagem, responder três perguntas do visitante:

1. **O que é a Corredora DF?** — proposta de valor e identidade visual.
2. **O que posso fazer agora?** — descobrir corridas, retirar kits, usar cupons.
3. **Por que voltar?** — comunidade, conteúdo editorial e benefícios de parceiros.

### 1.1 Princípios de produto

| Princípio | Decisão | Justificativa |
|---|---|---|
| **Descoberta antes de conversão** | Hero e eventos aparecem antes de login | Visitantes anônimos são a maioria do tráfego inicial; reduz fricção na primeira visita |
| **Um objetivo por seção** | Cada bloco tem um CTA principal único | Evita competição visual e facilita métricas por seção |
| **Progressive disclosure** | Conteúdo autenticado (cupons, comunidade) mostra teaser + CTA de login | Respeita permissões da API sem esconder valor do produto |
| **Mobile-first** | Seções empilhadas; carrosséis horizontais apenas onde necessário | Público de corrida consulta eventos pelo celular em deslocamento |
| **Server-first** | Dados via Server Components + serviços em `features/home/services/` | Performance, SEO e alinhamento com Next.js App Router |

### 1.2 Hierarquia de prioridade na página

```text
┌─────────────────────────────────────────────────────────────┐
│  NAVBAR (fixa)                                              │
├─────────────────────────────────────────────────────────────┤
│  HERO — proposta de valor + CTAs globais          [ALTA]    │
├─────────────────────────────────────────────────────────────┤
│  EVENTO EM DESTAQUE — conversão principal         [ALTA]    │
├─────────────────────────────────────────────────────────────┤
│  PRÓXIMAS CORRIDAS — descoberta contínua          [ALTA]    │
├─────────────────────────────────────────────────────────────┤
│  RETIRADA DE KITS — utilidade pós-inscrição       [MÉDIA]   │
├─────────────────────────────────────────────────────────────┤
│  CUPONS — benefícios e retenção                   [MÉDIA]   │
├─────────────────────────────────────────────────────────────┤
│  PARCEIROS — credibilidade e ecossistema          [MÉDIA]   │
├─────────────────────────────────────────────────────────────┤
│  COMUNIDADE — engajamento e pertencimento         [MÉDIA]   │
├─────────────────────────────────────────────────────────────┤
│  BLOG — conteúdo e SEO                            [BAIXA]   │
├─────────────────────────────────────────────────────────────┤
│  NEWSLETTER — captura de leads                    [BAIXA]   │
├─────────────────────────────────────────────────────────────┤
│  FOOTER — navegação secundária e legal            [ALTA]    │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Mapa de implementação

| Camada | Responsabilidade |
|---|---|
| `app/page.tsx` | Rota enxuta — delega para `HomePage` |
| `features/home/components/` | Seções compostas (`FeaturedEventSection`, `UpcomingEventsSection`, etc.) |
| `features/home/services/` | Orquestração de chamadas à API (futuro) |
| `@corredora/ui` | Primitivos visuais: Navbar, Hero, Button, Layout, Container, Section, Stack, Grid |
| `apps/web/components/layout/Footer/` | Rodapé global (Sprint 03) |

---

## 2. Seções da Home

### 2.1 Navbar

| Campo | Detalhe |
|---|---|
| **Nome** | Navbar |
| **Objetivo** | Orientar o usuário em toda a plataforma, expor autenticação e reforçar marca |
| **Público-alvo** | Todos os visitantes (anônimos, autenticados e futuros admins) |
| **Conteúdo esperado** | Logo 🦋 Corredora DF; menu: Home, Corridas, Retirada de Kits, Cupons, Parceiros, Comunidade, Blog; ações Entrar e Cadastrar-se; indicador de item ativo (`home`); estrutura de menu mobile (drawer) |
| **CTA principal** | **Cadastrar-se** — conversão de novo usuário |
| **Componentes envolvidos** | `@corredora/ui` → `Navbar`, `Button` · `apps/web` → `AppShell`, `MobileMenu` (Sprint 03) |
| **Dados futuros da API** | Nenhum endpoint dedicado. Itens estáticos em `constants/navigation.ts`. Futuro: badge de notificações via `GET /notifications/unread-count` (autenticado) |
| **Prioridade** | **Alta** |

#### Decisões de UX e produto

- **Navbar fixa no topo** garante acesso à navegação em qualquer ponto da Home sem scroll back.
- **Cadastrar-se como CTA primário** (não Entrar) porque o funil de aquisição prioriza novos corredores; Entrar permanece como ação secundária (ghost/outline).
- **Mesmos itens do menu em desktop e mobile** evitam paridade quebrada; o drawer mobile replica a lista completa.
- **Item ativo `home`** reforça contexto na rota `/` sem duplicar heading.
- Menu alinhado a `DEFAULT_NAV_ITEMS` em `packages/ui/src/components/Navbar/Navbar.types.ts` — fonte única até `constants/navigation.ts` ser populado na Sprint 03.

---

### 2.2 Hero

| Campo | Detalhe |
|---|---|
| **Nome** | Hero |
| **Objetivo** | Comunicar proposta de valor, gerar confiança com estatísticas e direcionar para as duas jornadas principais: descobrir corridas e conhecer a comunidade |
| **Público-alvo** | Visitantes de primeira viagem e corredores recorrentes que retornam à Home |
| **Conteúdo esperado** | Background com overlay; subtítulo institucional; **único `<h1>` da página**; descrição; 2 CTAs; 3 estatísticas (ex.: eventos ativos, corredores, parceiros); imagem principal (mulher-borboleta); scroll indicator para `#main-content` |
| **CTA principal** | **Explorar corridas** → `/corridas` |
| **CTA secundário** | **Conhecer a comunidade** → `/comunidade` |
| **Componentes envolvidos** | `@corredora/ui` → `Hero`, `Button` |
| **Dados futuros da API** | Estatísticas dinâmicas (futuro): agregados de `GET /events?status=active`, contagem de usuários (endpoint admin/analytics a definir), `GET /partners?active=true` · Conteúdo editorial pode ser CMS/admin |
| **Prioridade** | **Alta** |

#### Decisões de UX e produto

- **Um único Hero e um único h1** por página — requisito de acessibilidade e SEO; seções abaixo usam `<h2>`.
- **Subtítulo em `<p>`**, não em heading, preserva hierarquia sem competir com o h1.
- **Estatísticas no Hero** constroem prova social antes do usuário rolar; números placeholder até API de métricas existir.
- **Scroll indicator** ancora em `#main-content` (wrapper após o Hero), não na primeira seção de conteúdo — estável mesmo se seções forem reordenadas.
- **Imagem mulher-borboleta** é elemento de marca; placeholder até asset final em `apps/web/assets/`.
- CTA primário leva a corridas (core do produto); secundário à comunidade (retenção) — ordem intencional de prioridade de negócio.

---

### 2.3 Evento em Destaque

| Campo | Detalhe |
|---|---|
| **Nome** | Evento em Destaque |
| **Objetivo** | Promover uma corrida prioritária (patrocinada, sazonal ou com inscrições abertas) e maximizar conversão para detalhe/inscrição |
| **Público-alvo** | Corredores em fase de decisão — buscam o próximo evento para se inscrever |
| **Conteúdo esperado** | Título da seção (`<h2>`); card grande com imagem de capa, nome, data, cidade, distância/categoria, status de inscrição, contagem de vagas (opcional); badge “Destaque” ou “Inscrições abertas”; link para detalhe completo |
| **CTA principal** | **Ver evento** / **Inscrever-se** → `/corridas/{slug}` |
| **Componentes envolvidos** | `features/home/components/FeaturedEventSection` (a criar) · `@corredora/ui` → `Section`, `Container`, `Card` (futuro), `Button`, `Badge` (futuro) · `apps/web/components/ui/Card` |
| **Dados futuros da API** | `GET /events/:id` — evento destacado · Seleção via query `GET /events?featured=true&limit=1` (parâmetro a adicionar ao contrato) · Alternativa editorial: `GET /ads?position=home_banner&active=true` ([ads.md](../api/ads.md)) quando destaque for patrocinado |
| **Prioridade** | **Alta** |

#### Decisões de UX e produto

- **Uma única corrida em destaque** — múltiplos destaques diluem atenção; rotação pode ser feita no backend (campanha ativa).
- **Card hero-style** (largura total ou 2/3 da grid) diferencia visualmente das demais corridas na seção seguinte.
- **Prioridade sobre “Próximas Corridas”** porque é o principal ponto de conversão pós-Hero.
- Fallback: se não houver evento `featured`, exibir o próximo evento com `registrationOpen=true` ordenado por `date asc`.
- Imagem de capa obrigatória; placeholder de `@corredora/ui` até CDN/assets.

---

### 2.4 Próximas Corridas

| Campo | Detalhe |
|---|---|
| **Nome** | Próximas Corridas |
| **Objetivo** | Listar corridas futuras para descoberta rápida sem sair da Home |
| **Público-alvo** | Corredores explorando opções; usuários que não se identificaram com o destaque |
| **Conteúdo esperado** | Título (`<h2>`); grid ou carrossel de 3–6 cards compactos (nome, data, cidade, distância, status); link “Ver todas” para listagem completa |
| **CTA principal** | **Ver todas as corridas** → `/corridas` |
| **CTA secundário (por card)** | **Ver detalhes** → `/corridas/{slug}` |
| **Componentes envolvidos** | `features/home/components/UpcomingEventsSection` (a criar) · `@corredora/ui` → `Section`, `Container`, `Grid`, `Stack`, `Button` · `apps/web/components/ui/Card` |
| **Dados futuros da API** | `GET /events?status=active&dateFrom={hoje}&sort=date&perPage=6` · Excluir ID do evento em destaque no serviço da feature |
| **Prioridade** | **Alta** |

#### Decisões de UX e produto

- **Limite de 6 itens** equilibra densidade informativa e performance (LCP, payload JSON).
- **Grid em desktop, scroll horizontal em mobile** — padrão comum em marketplaces de eventos; evita página excessivamente longa no celular.
- **Excluir o destaque da lista** previne redundância visual na mesma dobra.
- **“Ver todas”** mais proeminente que CTAs individuais — objetivo da seção é descoberta, não conversão unitária (reservada ao destaque).
- Server Component por padrão; sem filtros interativos na Home (filtros ficam em `/corridas`).

---

### 2.5 Retirada de Kits

| Campo | Detalhe |
|---|---|
| **Nome** | Retirada de Kits |
| **Objetivo** | Informar sobre retirada de kits de eventos — locais, datas e status — reduzindo dúvidas pós-inscrição |
| **Público-alvo** | Corredores já inscritos (primário); visitantes curiosos sobre o processo (secundário) |
| **Conteúdo esperado** | Título (`<h2>`); para autenticados: lista de kits pendentes de retirada com evento, local, data/horário e status; para anônimos: explicação do fluxo + eventos com retirada próxima; ícones de local e calendário |
| **CTA principal** | **Ver retirada de kits** → `/kits` |
| **CTA secundário (autenticado)** | **Ver meu kit** → `/kits/{id}` ou `/corridas/{slug}/kit` |
| **Componentes envolvidos** | `features/home/components/KitPickupSection` (a criar) · `@corredora/ui` → `Section`, `Container`, `Stack`, `Button` · `apps/web/components/ui/Badge` |
| **Dados futuros da API** | `GET /kits?pickupUpcoming=true` (parâmetro a definir) · `GET /events/:eventId/kits` · Inscrições do usuário: derivado de `GET /events` + registro do usuário (endpoint de inscrições a formalizar) · Futuro: `GET /users/me/registrations` com `kitPickup` |
| **Prioridade** | **Média** |

#### Decisões de UX e produto

- **Posição após corridas** — utilidade pós-conversão; visitante novo ainda não precisa de kit, mas vê que a plataforma cobre todo o ciclo do evento.
- **Estado diferenciado por autenticação** — anônimo vê valor educativo; logado vê ação imediata (próxima retirada).
- **Máximo 3 itens** na Home; listagem completa em `/kits`.
- Contrato de API de kits hoje cobre estrutura do kit, não janela de retirada — **gap documentado**: campos `pickupLocation`, `pickupStart`, `pickupEnd` serão adicionados ao modelo de kit ou evento antes da Sprint 04.
- Não competir com CTA de inscrição do destaque — tom informativo, não promocional.

---

### 2.6 Cupons

| Campo | Detalhe |
|---|---|
| **Nome** | Cupons |
| **Objetivo** | Exibir benefícios disponíveis e incentivar cadastro/login para resgate |
| **Público-alvo** | Corredores sensíveis a preço; usuários autenticados com cupons ativos |
| **Conteúdo esperado** | Título (`<h2>`); 2–4 cards de cupom (título, desconto, parceiro, validade); para anônimos: cupons públicos em modo teaser (sem código visível); para autenticados: cupons resgatáveis |
| **CTA principal** | **Ver cupons** → `/cupons` |
| **CTA secundário (anônimo)** | **Cadastrar-se para resgatar** → fluxo de auth |
| **Componentes envolvidos** | `features/home/components/CouponsSection` (a criar) · `@corredora/ui` → `Section`, `Container`, `Grid`, `Button` · `apps/web/components/ui/Card`, `Badge` |
| **Dados futuros da API** | Autenticado: `GET /coupons?status=active&perPage=4` · Anônimo: cupons em destaque via admin/CMS ou `GET /coupons/featured` (endpoint público a definir) · Parceiro: `GET /partners/:id` para logo |
| **Prioridade** | **Média** |

#### Decisões de UX e produto

- **API atual restringe listagem a autenticados** — seção na Home para anônimos usa conteúdo estático/featured até existir endpoint público de cupons em destaque.
- **Teaser sem código** para visitantes — evita abuso de códigos e cria motivação para cadastro.
- **Destaque de percentual/valor** em tipografia grande — padrão de e-commerce de benefícios.
- Posicionada após kits porque cupons frequentemente se aplicam a inscrições já consideradas pelo usuário.

---

### 2.7 Parceiros

| Campo | Detalhe |
|---|---|
| **Nome** | Parceiros |
| **Objetivo** | Transmitir credibilidade, exibir ecossistema de marcas e direcionar para benefícios |
| **Público-alvo** | Todos; corredores buscando descontos em equipamentos e nutrição |
| **Conteúdo esperado** | Título (`<h2>`); faixa de logos (6–10 parceiros ativos); nome e categoria opcional no hover/foco; link para detalhe do parceiro |
| **CTA principal** | **Conhecer parceiros** → `/parceiros` |
| **CTA secundário (por logo)** | **Ver benefícios** → `/parceiros/{slug}` |
| **Componentes envolvidos** | `features/home/components/PartnersSection` (a criar) · `@corredora/ui` → `Section`, `Container`, `Grid` · `apps/web/components/ui/Avatar` (logo circular) |
| **Dados futuros da API** | `GET /partners?active=true&sort=name&perPage=10` · Campos: `name`, `slug`, `logo`, `category` |
| **Prioridade** | **Média** |

#### Decisões de UX e produto

- **Logos em escala de cinza com cor no hover** — padrão de “logo wall” que não compete com CTAs coloridos.
- **Parceiros ativos apenas** — `active=true` evita exibir marcas descontinuadas.
- **Seção de credibilidade**, não de conversão direta — prioridade média, após benefícios tangíveis (corridas, kits, cupons).
- Sincronização com estatística “parceiros” no Hero quando dados forem dinâmicos.

---

### 2.8 Comunidade

| Campo | Detalhe |
|---|---|
| **Nome** | Comunidade |
| **Objetivo** | Mostrar vida social da plataforma e incentivar participação em posts, grupos e rankings |
| **Público-alvo** | Corredores engajados; visitantes avaliando pertencimento antes de cadastro |
| **Conteúdo esperado** | Título (`<h2>`); 2–3 posts recentes (autor, avatar, trecho, likes/comentários); contador de membros ou grupos (opcional); para anônimos: posts em modo preview com CTA de login |
| **CTA principal** | **Entrar na comunidade** → `/comunidade` |
| **CTA secundário (anônimo)** | **Criar conta** → auth |
| **Componentes envolvidos** | `features/home/components/CommunitySection` (a criar) · `@corredora/ui` → `Section`, `Container`, `Stack`, `Button` · `apps/web/components/ui/Avatar`, `Card` |
| **Dados futuros da API** | `GET /community/posts?sort=recent&perPage=3` (autenticado) · Endpoint público de preview a definir: `GET /community/posts/featured?limit=3` · `GET /community/groups` para contagem |
| **Prioridade** | **Média** |

#### Decisões de UX e produto

- **API atual exige autenticação** — Home para anônimos exibe conteúdo estático de exemplo ou endpoint público `featured` (decisão de produto: permitir preview limitado para marketing).
- **Posts recentes, não mais curtidos** — transmite atividade atual; ranking de engajamento pode ser A/B testado depois.
- **Espelha CTA secundário do Hero** — reforço de mensagem sem duplicar o bloco inteiro acima da dobra.
- Moderação e conteúdo sensível: apenas posts `approved` (flag futura no contrato).

---

### 2.9 Blog

| Campo | Detalhe |
|---|---|
| **Nome** | Blog |
| **Objetivo** | Oferecer conteúdo editorial (treino, nutrição, notícias) para SEO, educação e retenção |
| **Público-alvo** | Corredores em fase de pesquisa; visitantes vindos de busca orgânica |
| **Conteúdo esperado** | Título (`<h2>`); 3 artigos recentes (capa, título, excerpt, categoria, tempo de leitura, data); layout em grid |
| **CTA principal** | **Ler o blog** → `/blog` |
| **CTA secundário (por artigo)** | **Ler artigo** → `/blog/{slug}` |
| **Componentes envolvidos** | `features/home/components/BlogSection` (a criar) · `@corredora/ui` → `Section`, `Container`, `Grid`, `Button` · `apps/web/components/ui/Card`, `Badge` |
| **Dados futuros da API** | `GET /blog/posts?sort=publishedAt&perPage=3` · Campos: `title`, `slug`, `excerpt`, `coverImage`, `category`, `readingTime`, `publishedAt` |
| **Prioridade** | **Baixa** |

#### Decisões de UX e produto

- **Prioridade baixa na Home** — conteúdo é importante para SEO, mas não para conversão imediata na primeira visita.
- **Três artigos** suficientes para demonstrar variedade sem alongar a página.
- **Categorias visíveis** (treino, nutrição, eventos, equipamentos) ajudam scanability.
- API pública — seção funcional mesmo sem login.

---

### 2.10 Newsletter

| Campo | Detalhe |
|---|---|
| **Nome** | Newsletter |
| **Objetivo** | Capturar e-mail para comunicação de novos eventos, cupons e conteúdo |
| **Público-alvo** | Visitantes não prontos para cadastro completo; corredores que querem apenas atualizações |
| **Conteúdo esperado** | Título (`<h2>`); texto de benefício (ex.: “Receba corridas e cupons no seu e-mail”); campo e-mail + botão enviar; mensagem de consentimento LGPD; feedback de sucesso/erro |
| **CTA principal** | **Inscrever-se** (submit do formulário) |
| **Componentes envolvidos** | `features/home/components/NewsletterSection` (a criar) · `@corredora/ui` → `Section`, `Container`, `Button` · `apps/web/components/ui/Input` |
| **Dados futuros da API** | **A definir:** `POST /newsletter/subscribe` com `{ email, source: "home" }` · Integração com provedor (SendGrid, Resend, etc.) no backend · Double opt-in recomendado |
| **Prioridade** | **Baixa** |

#### Decisões de UX e produto

- **Alternativa de baixa fricção ao cadastro** — captura leads que abandonariam o formulário completo.
- **Posição pré-footer** — padrão de mercado; usuário já consumiu valor da página antes do pedido de e-mail.
- **Uma coluna, layout simples** — sem distrações; foco no campo e no botão.
- **LGPD:** texto de consentimento explícito; link para política de privacidade no Footer.
- Implementação pode iniciar com formulário estático (Sprint 04) e integração API na Sprint 11+ (auth/comunicações).

---

### 2.11 Footer

| Campo | Detalhe |
|---|---|
| **Nome** | Footer |
| **Objetivo** | Navegação secundária, informações legais, redes sociais e reforço de marca |
| **Público-alvo** | Todos os visitantes |
| **Conteúdo esperado** | Logo e tagline; colunas de links (Plataforma, Suporte, Legal); redes sociais; copyright; links Termos de Uso e Política de Privacidade |
| **CTA principal** | Nenhum dominante — navegação utilitária; **Contato** → `/concierge` ou `mailto:` |
| **Componentes envolvidos** | `apps/web/components/layout/Footer/` (a implementar) · `@corredora/ui` → `Container`, `Grid`, `Stack` |
| **Dados futuros da API** | Conteúdo estático via `constants/` ou CMS admin. Sem endpoint dedicado |
| **Prioridade** | **Alta** |

#### Decisões de UX e produto

- **Alta prioridade estrutural** — toda página pública precisa de footer; bloqueia percepção de produto incompleto mesmo com prioridade de conteúdo “baixa” nas seções acima.
- **Links espelham Navbar + legais** — usuários experientes buscam termos e privacidade no rodapé.
- **Sem lógica de negócio** — componente puro, configurável por constantes.
- **Concierge no link de contato** alinha com Sprint 08; até lá, `mailto:` ou página placeholder.

---

## 3. Decisões transversais

### 3.1 Acessibilidade

| Requisito | Aplicação na Home |
|---|---|
| Um h1 por página | Apenas no Hero |
| Hierarquia h2 → h3 | Cada seção: h2; cards internos: h3 |
| Landmarks | `<header>` Navbar, `<main>` conteúdo, `<footer>` rodapé, `<section aria-label>` por bloco |
| Foco visível | Todos os CTAs nativos (`<a>`, `<button>`) |
| Contraste | Tokens semânticos Butterfly UI; overlay no Hero |
| Imagens decorativas vs informativas | Logos e capas com `alt`; backgrounds com `aria-hidden` |

### 3.2 Responsividade

| Breakpoint | Comportamento |
|---|---|
| `< md` | Seções empilhadas; carrossel horizontal para grids de cards; Navbar com drawer |
| `≥ md` | Grid 2–3 colunas para cards; Navbar horizontal |
| `≥ lg` | Evento em destaque em layout split (imagem + conteúdo); mais logos de parceiros visíveis |

### 3.3 Performance e carregamento

- **Above the fold:** Navbar + Hero — sem waterfalls de API; estatísticas do Hero podem ser estáticas na v1.
- **Below the fold:** seções de eventos, parceiros e blog podem usar `fetch` paralelo no Server Component pai (`HomePage`).
- **Imagens:** `next/image` com sizes responsivos; lazy load abaixo da dobra.
- **Limite de requisições na v1:** agrupar em `features/home/services/getHomeData.ts` quando BFF ou composição estiver disponível.

### 3.4 Estados vazios e de erro

| Seção | Estado vazio | Comportamento |
|---|---|---|
| Evento em destaque | Sem evento featured | Ocultar seção ou fallback para próximo evento |
| Próximas corridas | Lista vazia | `EmptyState` com “Nenhuma corrida agendada” + CTA explorar arquivo |
| Kits | Sem retiradas | Mensagem educativa para anônimos; “Nenhum kit pendente” para logados |
| Cupons | Sem cupons | Ocultar seção ou banner “Em breve novos benefícios” |
| Comunidade | Sem posts | Ocultar ou mostrar convite estático |
| Blog | Sem artigos | Ocultar seção |

### 3.5 Autenticação e personalização

```text
Visitante anônimo          Usuário autenticado
─────────────────          ────────────────────
Hero (genérico)            Hero (genérico ou personalizado v2)
Destaque + corridas        + badge “Já inscrito” se aplicável
Kits (educativo)           Kits (meus pendentes)
Cupons (teaser)            Cupons (resgatáveis)
Comunidade (preview)       Comunidade (feed real)
```

Personalização avançada (nome no Hero, eventos por histórico) fica fora do escopo da Sprint 04 — documentada para v2.

---

## 4. Rastreabilidade

### 4.1 Sprints e dependências

| Dependência | Sprint | Impacto na Home |
|---|---|---|
| Butterfly UI (Hero, Navbar, Layout) | 02 ✅ | Seções 1–2 |
| AppShell + Footer | 03 | Seções 1, 11 |
| Implementação das seções | 04 | Seções 3–10 |
| API NestJS | 13+ | Dados dinâmicos em todas as seções |

### 4.2 Contratos de API referenciados

| Seção | Documento |
|---|---|
| Evento em destaque, Próximas corridas | [events.md](../api/events.md) |
| Retirada de kits | [kits.md](../api/kits.md) |
| Cupons | [coupons.md](../api/coupons.md) |
| Parceiros | [partners.md](../api/partners.md) |
| Comunidade | [community.md](../api/community.md) |
| Blog | [blog.md](../api/blog.md) |
| Destaque patrocinado (alternativa) | [ads.md](../api/ads.md) |
| Newsletter | *Contrato a criar* |

### 4.3 Gaps de API identificados

| Gap | Proposta | Seção afetada |
|---|---|---|
| `featured` em eventos | Query `?featured=true` em `GET /events` | Evento em destaque |
| Pickup window em kits | Campos `pickupLocation`, `pickupStart`, `pickupEnd` | Retirada de kits |
| Cupons públicos em destaque | `GET /coupons/featured` (público) | Cupons |
| Preview de comunidade | `GET /community/posts/featured` (público) | Comunidade |
| Newsletter | `POST /newsletter/subscribe` | Newsletter |
| Inscrições do usuário | `GET /users/me/registrations` | Kits, destaque |

---

## 5. Métricas de sucesso (planejadas)

| Métrica | Seção | Meta indicativa |
|---|---|---|
| CTR Hero → corridas | Hero | > 15% dos visitantes |
| CTR destaque → detalhe | Evento em destaque | > 8% |
| Scroll depth | Global | > 60% atingem Parceiros |
| Cadastros via Home | Navbar, Cupons, Comunidade | Tracking por `source` |
| Inscrições newsletter | Newsletter | Baseline na v1 |

Detalhamento em `docs/product/metrics.md` (futuro).

---

## 6. Checklist de desenvolvimento (Sprint 04)

- [ ] `HomePage` em `features/home/components/` compondo todas as seções
- [ ] `id="main-content"` no wrapper pós-Hero (alvo do scroll indicator)
- [ ] Um único `<Hero />` com h1
- [ ] Cada seção subsequente com `<h2>` próprio
- [ ] Serviços com dados mock até API existir
- [ ] Estados vazios conforme tabela §3.4
- [ ] Footer integrado via AppShell
- [ ] Playground atualizado para preview de seções isoladas (opcional)

---

## 7. Referências

- [Roadmap — Sprint 04](../roadmap.md)
- [Feature home](../../apps/web/features/home/README.md)
- [UX — Navegação e fluxos](../ux/README.md)
- [Butterfly Hero](../../packages/ui/src/components/Hero/README.md)
- [Butterfly Navbar](../../packages/ui/src/components/Navbar/README.md)
