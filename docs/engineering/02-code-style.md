# 02 — Code Style

Convenções de código para manter consistência no time.

## Linguagem

- **TypeScript** em todo o frontend — sem `any`, preferir tipos explícitos.
- **Português** para textos de UI e documentação interna.
- **Inglês** para código: nomes de variáveis, funções, componentes, commits.

## Nomenclatura

| Elemento | Convenção | Exemplo |
|---|---|---|
| Componentes | PascalCase | `EventCard.tsx` |
| Hooks | camelCase com `use` | `useDebounce.ts` |
| Funções | camelCase | `formatDate()` |
| Constantes | UPPER_SNAKE_CASE | `DEFAULT_PAGE_SIZE` |
| Tipos/Interfaces | PascalCase | `Event`, `ApiResponse` |
| Arquivos de componente | PascalCase ou kebab-case | `Button.tsx` ou `event-card.tsx` |
| Pastas | kebab-case ou PascalCase | `events/` ou `Button/` |

## Componentes React

```tsx
// Props tipadas com interface
interface ButtonProps {
  variant?: "primary" | "outline";
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant = "primary", children, onClick }: ButtonProps) {
  return (
    <button className={cn("base", variant)} onClick={onClick}>
      {children}
    </button>
  );
}
```

- Um componente por arquivo.
- Export nomeado (`export function`), não default — exceto em `app/` (exigência do Next.js).
- Props desestruturadas na assinatura.

## Server vs Client Components

```tsx
// Server Component (padrão) — sem "use client"
export default async function EventsPage() {
  const events = await getEvents();
  return <EventList events={events} />;
}

// Client Component — apenas quando necessário
"use client";
export function EventFilter() {
  const [query, setQuery] = useState("");
  // ...
}
```

Usar `"use client"` somente quando houver: estado, efeitos, event handlers ou APIs do browser.

## Estilização

- **Tailwind CSS** como padrão — classes utilitárias no JSX.
- Função `cn()` (de `lib/`) para composição condicional de classes.
- Evitar CSS inline e arquivos CSS por componente.

## Formatação

- Indentação: 2 espaços.
- Aspas duplas em strings.
- Ponto e vírgula ao final de statements.
- Trailing comma em objetos e arrays multilinha.
- ESLint configurado no projeto — rodar antes de commitar.

## Organização de imports

```tsx
// 1. React / Next.js
import { useState } from "react";
import Link from "next/link";

// 2. Pacotes externos
import { z } from "zod";

// 3. Internos (@/)
import { Button } from "@/components/ui";
import { useDebounce } from "@/hooks";
import type { Event } from "@/features/events";
```

## O que evitar

- `any` — usar `unknown` e narrowing quando o tipo é incerto.
- `console.log` em código de produção.
- Lógica de negócio em componentes de `components/ui/`.
- Imports circulares entre features.
