# 01 — Estrutura de Pastas

Como organizamos o código no monorepo da Plataforma Corredora DF.

## Monorepo

```text
corredora-df-platform/
├── apps/
│   ├── web/          # Frontend (Next.js)
│   └── api/          # Backend (NestJS) — futuro
├── packages/         # Pacotes compartilhados
├── database/         # Schemas e migrations
├── infrastructure/   # Docker, CI/CD
├── docs/             # Documentação
└── tooling/          # Scripts e configs compartilhadas
```

## Frontend (`apps/web/`)

```text
app/            → rotas (App Router) — apenas composição
components/
  ui/           → design system (Button, Card, Input...)
  layout/       → estrutura (Navbar, Footer)
  shared/       → compostos genéricos (Search, EmptyState)
features/       → domínios de negócio (events, auth, profile...)
hooks/          → hooks globais
lib/            → utilitários puros
providers/      → contextos React globais
services/       → clientes de API transversais
styles/         → CSS global complementar
types/          → tipos TypeScript globais
constants/      → valores fixos e rotas nomeadas
assets/         → estáticos importados pelo bundler
```

## Regra de ouro

> Se é específico de um domínio → `features/`.  
> Se é reutilizável sem negócio → `components/`.  
> Se é rota → `app/`.

## Onde colocar código novo

| Tipo | Destino |
|---|---|
| Página de eventos | `features/events/` |
| Botão genérico | `components/ui/Button/` |
| Hook de debounce | `hooks/` |
| Formatação de data | `lib/` |
| Tipo `Event` | `features/events/types/` |
| Tipo `ApiResponse` | `types/` |
| Rota `/events` | `app/events/page.tsx` |

## Imports

Usar o alias `@/*` configurado no `tsconfig.json`:

```tsx
import { Button } from "@/components/ui";
import { EventsPage } from "@/features/events";
import { ROUTES } from "@/constants";
```

Nunca usar imports relativos profundos (`../../../`).

## Leitura complementar

Cada pasta do frontend possui um `README.md` com objetivo, exemplos e boas práticas.
