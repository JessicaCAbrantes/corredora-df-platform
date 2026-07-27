# Engineering Handbook — Plataforma Corredora DF

**PB-033** · Manual oficial de engenharia. Guia de onboarding e referência diária para qualquer desenvolvedor no projeto.

| Campo | Valor |
|---|---|
| **Status** | Aprovado |
| **Versão** | 1.0 |
| **Última atualização** | 2026-07-13 |
| **Audiência** | Frontend, Backend, QA, DevOps |
| **Guias detalhados** | [01](./01-folder-structure.md)–[10](./10-release-process.md) nesta pasta |

---

## Como usar este manual

1. **Dia 1** — Ler §§1–3 e §15 (filosofia, organização, convenções, arquitetura).
2. **Primeira task** — Ler §§4–8 (features, componentes, hooks, services, types).
3. **Antes do PR** — Ler §§9–13 (commits, PRs, review, testes, DoD).
4. **Dúvida pontual** — Abrir o guia numerado correspondente (ex.: a11y → [05](./05-accessibility.md)).

Produto e jornadas: [`docs/product/`](../product/). Contratos API: [`docs/api/`](../api/).

---

## 1. Filosofia da Engenharia

### Princípios

| Princípio | Significado prático |
|---|---|
| **Clareza > cleverness** | Código óbvio vence abstração prematura |
| **API-first** | Contrato em `docs/api/` antes de implementar endpoint |
| **Feature-based** | Domínio de negócio vive em `features/<domínio>/` |
| **Server-first** | React Server Components por padrão; `"use client"` só com justificativa |
| **Design system único** | UI reutilizável em `@corredora/ui` / `components/ui` — sem reinventar Button |
| **Segurança por default** | Sem secrets no repo; inputs validados; fetch via services |
| **Acessível e performático** | WCAG 2.1 AA e metas Lighthouse não são “depois” |
| **Documentar decisões** | Mudanças estruturais → ADR em `docs/adr/` |

### Decisões norteadoras

| Decisão | Por quê |
|---|---|
| **Monorepo (pnpm + Turborepo)** | Um repo, apps e packages versionados juntos; CI unificado |
| **Next.js App Router + React 19** | RSC, SEO, rotas colocalizadas com a UI |
| **NestJS + Prisma + PostgreSQL (API)** | Bounded contexts claros; schema tipado alinhado aos contratos |
| **TypeScript estrito** | Erros no compile, não em produção |
| **Português na UI / inglês no código** | Producto local (DF); código legível para tooling e Conventional Commits |
| **Mocks até a API existir** | Front não bloqueia; services isolam a troca mock→HTTP |

### O que rejeitamos

- Importar internals de outra feature (`features/a` → `features/b/components/...`)
- Lógica de negócio em `app/` ou em `components/ui/`
- `any`, `console.log` commitado, CSS inline ad hoc, `dangerouslySetInnerHTML` sem sanitização
- PRs sem descrição testável

---

## 2. Organização do Projeto

### Monorepo

```text
corredora-df-platform/
├── apps/
│   ├── web/              # Next.js — experiência pública e (MVP) /admin
│   └── api/              # NestJS — futuro
├── packages/
│   └── ui/               # @corredora/ui — Butterfly Design System
├── database/             # schemas / migrations (Prisma)
├── infrastructure/       # Docker, CI/CD
├── docs/                 # produto, API, engineering, ADRs
├── tests/                # E2E (Playwright) na raiz
├── scripts/
└── tooling/
```

**Decisão:** pacotes compartilhados crescem sob `packages/` (`types`, `validations`…) quando houver ≥2 consumidores. Até lá, tipos de domínio ficam na feature.

### Frontend (`apps/web/`)

```text
app/                 → rotas App Router (finas)
components/
  ui/                → átomos locais (espelham Butterfly)
  layout/            → AppShell, Header, Footer, MobileMenu
  shared/            → EmptyState, Search…
features/            → domínios (home, events, auth…)
hooks/               → hooks globais (sem negócio)
lib/                 → api-client, env, logger, utils
providers/           → AuthProvider, Query… (globais)
services/            → clientes transversais (se houver)
styles/              → CSS global
types/               → tipos globais (ApiResponse, Navigation)
constants/           → navigation, routes
assets/
```

### Regra de ouro

> **Domínio** → `features/` · **UI reutilizável sem negócio** → `components/` ou `@corredora/ui` · **Rota** → `app/` · **Util puro** → `lib/`

| Tipo | Destino |
|---|---|
| Página de corridas | `features/events/` + `app/corridas/page.tsx` |
| Button genérico | `packages/ui` ou `components/ui/Button/` |
| `useDebounce` | `hooks/` |
| `formatDate` | `lib/` |
| Tipo `Event` | `features/events/types/` |
| Tipo `ApiResponse` | `types/` |
| Contrato HTTP | `docs/api/*.md` |

### Product docs relacionados

Planejar trabalho com [product-backlog.md](../product/product-backlog.md) e [user-stories.md](../product/user-stories.md). Implementar conforme [feature-specifications.md](../product/feature-specifications.md).

---

## 3. Convenções

### Linguagem e nomenclatura

| Elemento | Convenção | Exemplo |
|---|---|---|
| Componentes / tipos | PascalCase | `EventCard`, `Registration` |
| Hooks | `use` + camelCase | `useEventFilters` |
| Funções / vars | camelCase | `getEvents` |
| Constantes | UPPER_SNAKE | `DEFAULT_PAGE_SIZE` |
| Pastas de feature | kebab/english | `features/events/` |
| Rotas públicas | português | `/corridas`, `/cupons` |
| Arquivos de componente | PascalCase | `EventCard.tsx` |
| Story / ticket | IDs estáveis | `US-EVT-01`, `F-02.02` |

### TypeScript

- Sem `any`; preferir `unknown` + narrowing.
- Props com `interface`; exportar tipo quando reutilizado.
- Export nomeado (`export function`) — **exceto** `default` exigido em `app/**/page.tsx`.

### Estilo de código

- Indentação 2 espaços; aspas duplas; ponto e vírgula; trailing commas.
- ESLint do app — corrigir antes do push.
- Tailwind em `apps/web`; classes BEM `butterfly-*` em `@corredora/ui` (sem Tailwind no pacote UI).

**Decisão:** UI package sem Tailwind evita acoplar o design system ao bundler do Next; o app mapeia tokens → CSS/Tailwind.

### Imports

Ordem: React / frameworks → libs externas → `@/` internos → relativos curtos.

```tsx
import { useState } from "react";
import { Button } from "@corredora/ui/components/Button"; // ou alias do monorepo
import { getEvents } from "@/features/events/services";
import { EventCard } from "./EventCard";
```

Usar alias `@/*`. Evitar `../../../`.

### Server vs Client

```tsx
// Padrão — Server Component
export default async function Page() {
  const data = await getEvents();
  return <EventList events={data} />;
}

// Somente se: useState, effects, handlers de browser, APIs do DOM
"use client";
export function RegistrationCta() { /* ... */ }
```

### Ambiente

- Segredos só em `.env*` (gitignored); documentar chaves em `.env.example`.
- Ler env via `lib/env.ts` (validação), nunca `process.env.X` espalhado.

Detalhes: [02-code-style.md](./02-code-style.md).

---

## 4. Estrutura das Features

Cada domínio de negócio segue o mesmo esqueleto:

```text
features/<domínio>/
├── components/       # UI exclusiva do domínio
│   └── index.ts
├── hooks/            # estado/interação do domínio
│   └── index.ts
├── services/         # chamadas API / mocks tipados
│   └── index.ts
├── types/            # DTOs e models do domínio
│   └── index.ts
├── utils/            # helpers puros do domínio
│   └── index.ts
├── index.ts          # barrel público da feature
└── README.md         # contrato da feature
```

### Regras

1. **`app/` só compõe** — importa de `features/<x>` e passa params de rota.
2. **Barrel público** — outros módulos importam só de `@/features/events` (ou paths públicos exportados), não de arquivos internos profundos sem necessidade.
3. **Sem acoplamento lateral** — Feature A não importa Feature B internals. Compartilhar via `components/`, `lib/`, `types/` globais ou `packages/`.
4. **Services donos do I/O** — componentes/hooks não chamam `fetch` direto.
5. **README obrigatório** — objetivo, exemplos, boas práticas.

### Exemplo de rota fina

```tsx
// app/corridas/page.tsx
import { EventsPage } from "@/features/events";

export default function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return <EventsPage searchParams={searchParams} />;
}
```

**Decisão:** rotas em PT-BR (`/corridas`) + pastas de feature em inglês (`events`) — SEO local sem misturar vocabulário de código.

Features oficiais: ver [feature-catalog.md](../product/feature-catalog.md).

---

## 5. Componentes

### Hierarquia

```text
@corredora/ui / components/ui/     → átomos (Button, Input, Card)
components/layout/                 → shell (Navbar, Footer, AppShell)
components/shared/                 → compostos sem domínio (EmptyState)
features/*/components/             → domínio (EventCard, LoginForm)
```

### Anatomia (Butterfly / UI)

```text
packages/ui/src/components/Button/
├── Button.tsx
├── Button.types.ts
├── Button.styles.ts
├── index.ts
└── README.md
```

Em `apps/web/components/ui/` o padrão espelha: implementação + `index.ts` + README.

### Regras

| Faça | Evite |
|---|---|
| Props tipadas + defaults | Context de negócio em `ui/` |
| `children` / composição | Prop drilling de 15 campos |
| HTML semântico (`button`, `nav`) | `div` clicável |
| Um componente exportado principal por pasta | God-component mil linhas |
| Testes junto (`*.test.tsx`) | Lógica irtestável embutida |

### Padrão de implementação

```tsx
interface ButtonProps {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  onClick,
}: ButtonProps) {
  return (
    <button type="button" className={getButtonClassName({ variant, size })} onClick={onClick}>
      {children}
    </button>
  );
}
```

Detalhes: [04-component-pattern.md](./04-component-pattern.md) · [design-system](../design-system/).

---

## 6. Hooks

### Onde vivem

| Escopo | Local |
|---|---|
| Genérico (debounce, media query) | `apps/web/hooks/` |
| Domínio (filtros de evento) | `features/<x>/hooks/` |

### Regras

- Prefixo `use`; retorno estável e tipado.
- Hooks de domínio podem chamar services **client-side**; dados iniciais preferir RSC.
- Sem side effects ocultos no import — efeitos só dentro de `useEffect` / event handlers.
- Não colocar fetch em hook se o mesmo dado pode vir do Server Component (menos JS, cache).

```tsx
// features/events/hooks/useEventFilters.ts
"use client";

export function useEventFilters(initial: EventFilters) {
  // estado de UI + sync com URL searchParams
}
```

**Decisão:** preferir URL (`searchParams`) como source of truth de filtros — compartilhável e SSR-friendly.

---

## 7. Services

### Responsabilidade

Encapsular I/O com a API (`/api/v1`), mapas DTO↔UI e erros tipados.

```text
features/events/services/
├── get-events.ts
├── get-event-by-id.ts
├── register-for-event.ts
└── index.ts
```

### Regras

1. Usar `lib/api-client` (base URL, headers, credentials, parse de erro).
2. Assinaturas tipadas alinhadas a [docs/api](../api/).
3. **Mocks** no mesmo módulo ou `*.mock.ts` — feature não precisa saber a fonte até wiring HTTP.
4. Em Server Components: chamar services diretamente (`async`).
5. Em Client Components: chamar só para mutações ou refetch; preferir server actions / route handlers quando fizer sentido (ADR futuro).
6. Nunca `fetch` solto em JSX.

```tsx
export async function getEvents(params: EventListParams): Promise<Event[]> {
  const res = await apiClient.get<ApiListResponse<EventDto>>("/events", { params });
  return res.data.map(mapEventDto);
}
```

**Decisão:** mapeamento DTO→domínio no service — UI não conhece shape exato do backend.

Detalhes de erros/paginação: [errors.md](../api/errors.md), [pagination.md](../api/pagination.md).

---

## 8. Types

### Camadas de tipos

| Camada | Onde | Exemplo |
|---|---|---|
| Contrato API / DTO | `features/*/types` ou gerado futuro | `EventDto` |
| Modelo de UI/domínio | `features/*/types` | `Event` |
| Transversal | `apps/web/types/` | `ApiResponse<T>`, `NavItem` |
| Design system | `packages/ui/.../*.types.ts` | `ButtonProps` |

### Regras

- Nomes sem prefixo `I` (`User`, não `IUser`).
- Preferir `type` para unions; `interface` para props/objetos extensíveis.
- Alinhar campos ao contrato; gaps de API documentados no backlog/specs — tipar como opcional até o backend existir.
- Não duplicar o mesmo modelo em duas features — extrair para `packages/types` quando compartilhado.

```ts
export interface Event {
  id: string;
  slug: string;
  name: string;
  date: string; // ISO
  registrationOpen: boolean;
}
```

---

## 9. Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```text
tipo(escopo): descrição curta no imperativo
```

| Tipo | Uso |
|---|---|
| `feat` | Nova funcionalidade |
| `fix` | Bug |
| `docs` | Documentação |
| `refactor` | Sem mudar comportamento |
| `test` | Testes |
| `chore` | Tooling, deps, CI |
| `style` | Formatação only |
| `perf` | Performance |

### Exemplos

```text
feat(events): add corridas listing with filters
fix(auth): preserve returnUrl on login redirect
docs(engineering): add engineering handbook
test(coupons): cover redeem idempotency
chore(web): bump eslint config
```

### Regras

- Inglês; imperativo; título ≤ 72 chars.
- Um commit = uma intenção lógica.
- Referenciar story quando útil: `feat(events): add registration CTA (US-EVT-03)`.
- Nunca commitar `.env`, credenciais, `node_modules/`, artefatos `.next/`.

Detalhes: [03-git-flow.md](./03-git-flow.md).

---

## 10. Pull Requests

### Fluxo

```text
develop → feat|fix|chore|docs/<slug> → PR → review → squash merge → develop
main ← release (protegida)
```

### Antes de abrir

- [ ] Branch atualizada com `develop`
- [ ] `pnpm --filter web build` (e lint) passam
- [ ] Sem `console.log` / código morto
- [ ] Sem arquivos gerados ou secrets

### Template mínimo

```markdown
## Summary
- O que mudou e por quê (story/ID se houver)

## Test plan
- [ ] Build OK
- [ ] Cenário manual / E2E relevante
- [ ] A11y básico (teclado + um h1)
```

### Regras

- Título no formato Conventional Commits.
- PRs pequenos (&lt; ~400 linhas úteis quando possível).
- Mínimo **1 aprovação**.
- Squash merge em `develop`.
- Screenshots para mudanças de UI.

---

## 11. Code Review

Reviewer verifica arquitetura e risco, não só estilo (o linter cobre formatação).

### Checklist rápido

**Arquitetura**

- [ ] Pasta correta (feature vs ui vs app)
- [ ] Sem import cruzado de internals de feature
- [ ] Rotas finas; services no I/O
- [ ] Barrel exports atualizados

**Código**

- [ ] Sem `any`; `"use client"` justificado
- [ ] Nomes claros; sem duplicação injustificada

**UI / a11y / perf**

- [ ] Semântica HTML; `alt`; teclado; contraste
- [ ] `next/image`; dados no servidor quando possível; listas paginadas

**Segurança**

- [ ] Sem secrets; validação de input; sem HTML cru inseguro

**Testes / docs**

- [ ] Testes da lógica nova; README se nova feature/componente

Lista completa: [09-review-checklist.md](./09-review-checklist.md).

### Como comentar

- Seja específico e acionável.
- Distinga **bloqueante** vs **nit**.
- Sugira alternativa quando rejeitar uma abordagem.

---

## 12. Testes

### Pirâmide

```text
        ╱  E2E  ╲         jornadas J1–J5 (Playwright, tests/)
       ╱──────────╲
      ╱ Integração ╲      services + contratos API
     ╱──────────────╲
    ╱   Unitários    ╲    utils, hooks, componentes
```

| Tipo | Onde | O que prova |
|---|---|---|
| Unit | `lib/`, `hooks/`, `*.test.ts(x)` | Lógica pura / render isolado |
| Componente | junto ao componente | Roles, a11y name, interação |
| Integração | services / feature | Mock HTTP, mapeamento DTO |
| E2E | `tests/` | Happy path das User Stories |

### Regras

- Nova lógica de negócio → teste unitário ou de componente.
- Mutações críticas (inscrição, redeem, auth) → E2E da story.
- Nomes de teste descrevem comportamento (`resgata cupom ativo`).
- CI deve falhar se a pirâmide mínima quebrar.

### Comandos típicos

```bash
pnpm --filter web lint
pnpm --filter web build
pnpm --filter web test          # quando configurado
pnpm exec playwright test       # E2E
```

Detalhes: [07-testing.md](./07-testing.md) · jornadas: [user-journeys.md](../product/user-journeys.md).

---

## 13. Definition of Done

> **Fonte oficial:** [definition-of-ready-and-done.md](./definition-of-ready-and-done.md) (PB-035) — DoR + DoD + fluxo Backlog→Done.

Resumo: uma User Story / PR só está **Done** quando aceite Gherkin passa, lint/build/testes OK, PR aprovado, merge em `develop`, a11y/mobile mínimos e docs atualizados se necessário.

---

## 14. Boas Práticas

### Do

- Começar pela story + spec da feature antes de codar.
- Extrair cedo para `packages/ui` o que for genuinamente genérico.
- Preferir composição a herança e a props explosivas.
- Paginar listas; falhar alto com erros tipados da API.
- Logar com `lib/logger` (nunca logar tokens/PII).
- Escrever ADRs para decisões que afetam mais de um time/app.

### Don't

- Copiar-colar DTOs na UI.
- Criar Context global “god store”.
- Buscar dados no client só porque é mais familiar.
- Misturar PT em identificadores de código.
- Abrir PR “WIP eterno” sem plano de fatia entregável.
- Ignorar gaps de API — registrar mock + ticket no backlog.

### Performance (resumo)

| Meta | Alvo |
|---|---|
| Lighthouse Performance | ≥ 90 |
| LCP | &lt; 2.5s |
| CLS | &lt; 0.1 |
| JS inicial | &lt; 200kb gzip |

Ver [06-performance.md](./06-performance.md).

### Segurança (resumo)

- Auth Bearer/cookie conforme ADR; refresh seguro.
- RBAC na API (nunca só esconder botão).
- LGPD: consentimento newsletter; links legais no Footer.
- Ver [08-security.md](./08-security.md).

### Acessibilidade (resumo)

- Um `h1` por página; HTML semântico; labels; teclado; contraste.
- Ver [05-accessibility.md](./05-accessibility.md).

---

## 15. Arquitetura Geral

### Diagrama lógico

```text
┌─────────────────────────────────────────────────────────────┐
│ apps/web (Next.js App Router · React 19 · Tailwind)         │
│  app/ (rotas) → features/* → components · lib · providers   │
│                         ↓                                    │
│                  packages/ui (@corredora/ui)                 │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS REST /api/v1
                           │ (Bearer / cookie httpOnly)
┌──────────────────────────▼──────────────────────────────────┐
│ apps/api (NestJS modules · Guards · Validation)             │
│  auth · events · kits · coupons · partners · community …    │
└──────────────────────────┬──────────────────────────────────┘
                           │ Prisma
┌──────────────────────────▼──────────────────────────────────┐
│ PostgreSQL · Docker · migrations em database/               │
└─────────────────────────────────────────────────────────────┘

docs/api     = contrato FE↔BE
docs/adr     = decisões formais
docs/product = o que construir e por quê
```

### Fronteiras

| Camada | Pode depender de | Não pode |
|---|---|---|
| `app/` | features, layout | services HTTP diretos; regra de negócio |
| `features/X` | ui, lib, types globais, api contracts | internals de `features/Y` |
| `components/ui` | React, estilos, tokens | features, API |
| `packages/ui` | React peer | apps/web |
| `apps/api` | Prisma, docs/api | JSX do web |

### Fluxo de dados típico (leitura)

```text
Browser → RSC page → feature service → api-client → NestJS → Prisma → DB
                 ↘ map DTO → components (HTML streamed)
```

### Fluxo de mutação típico

```text
Client Component → feature service → API → domain validation → DB
                → UI state (success/error) → analytics event
```

### Ambientes (alvo)

| Env | Web | API |
|---|---|---|
| Local | `localhost:3000` | `localhost:3001/api/v1` |
| Staging | staging host | staging-api |
| Production | produção | api produção |

Release: [10-release-process.md](./10-release-process.md).

### Mapa mental Feature × pacote

Alinhado a [feature-specifications.md](../product/feature-specifications.md) §12:

```text
home · events · coupons · partners · community · blog · auth · profile · concierge
(+ admin shell nas sprints finais)
```

---

## Apêndice A — Guias numerados

| # | Documento | Tema |
|---|---|---|
| 01 | [folder-structure](./01-folder-structure.md) | Onde colocar código |
| 02 | [code-style](./02-code-style.md) | Estilo e TypeScript |
| 03 | [git-flow](./03-git-flow.md) | Branches, commits, PRs |
| 04 | [component-pattern](./04-component-pattern.md) | Anatomia de componentes |
| 05 | [accessibility](./05-accessibility.md) | A11y |
| 06 | [performance](./06-performance.md) | Performance |
| 07 | [testing](./07-testing.md) | Pirâmide de testes |
| 08 | [security](./08-security.md) | Segurança |
| 09 | [review-checklist](./09-review-checklist.md) | Code review |
| 10 | [release-process](./10-release-process.md) | Release |

## Apêndice B — Primeira semana (checklist)

- [ ] Subir monorepo (`pnpm i`, `pnpm --filter web dev`)
- [ ] Ler Vision + Roadmap + este Handbook §§1–3 e §15
- [ ] Rodar `/playground` e inspecionar `@corredora/ui`
- [ ] Pegar uma story Must da sprint atual no [user-stories.md](../product/user-stories.md)
- [ ] Abrir PR seguindo §§9–11

---

> Atualizar este handbook quando ADRs, estrutura de pastas ou DoD mudarem. Decisões pontuais de produto não entram aqui — vão para `docs/product/`.
