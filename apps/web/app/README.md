# app/

Camada de roteamento do Next.js (App Router).

## Objetivo

Definir as rotas da aplicação por meio de pastas e arquivos especiais (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `route.ts`). Orquestrar a composição das telas, delegando lógica e UI para `features/` e `components/`.

## Exemplos de uso

```tsx
// app/page.tsx — rota raiz compõe a feature home
import { HomePage } from "@/features/home";

export default function Page() {
  return <HomePage />;
}
```

```tsx
// app/events/page.tsx — rota delega para a feature events
import { EventsPage } from "@/features/events";

export default function Page() {
  return <EventsPage />;
}
```

## Boas práticas

- Manter arquivos de rota enxutos: apenas compor componentes vindos de `features/` e `components/`.
- Regras de negócio, chamadas a APIs e estado pertencem às outras camadas, não a esta.
- Usar `loading.tsx` e `error.tsx` para estados de carregamento e erro por segmento de rota.
- Colocar layouts compartilhados em `layout.tsx` e componentes estruturais em `components/layout/`.
