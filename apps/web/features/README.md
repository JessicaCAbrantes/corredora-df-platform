# features/

Módulos de domínio da aplicação (Feature-Based Design).

## Objetivo

Agrupar tudo o que pertence a um domínio de negócio em um único lugar — componentes, hooks, serviços e tipos co-localizados por feature.

## Features previstas

- `home/` — página inicial e destaques.
- `events/` — eventos e corridas.
- `partners/` — parceiros e patrocinadores.
- `coupons/` — cupons e benefícios.
- `community/` — comunidade de corredores.
- `concierge/` — serviço de concierge.
- `blog/` — conteúdo editorial.
- `profile/` — perfil do usuário.
- `auth/` — autenticação e sessão.

## Estrutura sugerida por feature

```text
features/
└── events/
    ├── components/
    ├── hooks/
    ├── services/
    ├── types/
    ├── utils/
    ├── index.ts
    └── README.md
```

## Exemplos de uso

```tsx
// app/events/page.tsx
import { EventsPage } from "@/features/events";

export default function Page() {
  return <EventsPage />;
}
```

## Boas práticas

- Cada feature expõe apenas sua API pública via `index.ts`.
- Features não importam arquivos internos de outras features.
- O que for reutilizado por várias features sobe para `components/`, `hooks/` ou `lib/`.
