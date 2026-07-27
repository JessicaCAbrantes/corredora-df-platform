# 06 — Performance

Como mantemos a aplicação rápida e eficiente.

## Metas

| Métrica | Alvo |
|---|---|
| Lighthouse Performance | ≥ 90 |
| LCP (Largest Contentful Paint) | < 2.5s |
| FID (First Input Delay) | < 100ms |
| CLS (Cumulative Layout Shift) | < 0.1 |
| Bundle inicial (JS) | < 200kb gzip |

## Estratégias do Next.js

### Server Components por padrão

Server Components não enviam JavaScript ao cliente. Usar `"use client"` apenas quando necessário.

```tsx
// ✅ Server Component — zero JS no cliente
export default async function EventsPage() {
  const events = await getEvents();
  return <EventList events={events} />;
}
```

### Imagens otimizadas

```tsx
import Image from "next/image";

<Image
  src={event.cover}
  alt={event.name}
  width={400}
  height={300}
  loading="lazy"
  placeholder="blur"
/>
```

Nunca usar `<img>` para conteúdo — sempre `next/image`.

### Fontes

```tsx
// app/layout.tsx — fontes via next/font (sem layout shift)
import { Geist } from "next/font/google";

const geist = Geist({ subsets: ["latin"] });
```

### Code splitting

- Rotas do App Router fazem code splitting automaticamente.
- Imports dinâmicos para componentes pesados:

```tsx
import dynamic from "next/dynamic";

const EventMap = dynamic(() => import("@/features/events/components/EventMap"), {
  loading: () => <Loading />,
});
```

## Dados

- Buscar dados no servidor (Server Components, Route Handlers).
- Cachear respostas com `fetch` + `revalidate` do Next.js.
- Paginar listas — nunca carregar todos os registros de uma vez.

```tsx
const events = await fetch(`${API_URL}/events?page=1`, {
  next: { revalidate: 60 },
});
```

## CSS e assets

- Tailwind CSS com purge automático — apenas classes usadas no bundle.
- SVGs inline para ícones pequenos; `next/image` para imagens grandes.
- Arquivos estáticos em `public/` apenas quando não precisam de otimização.

## O que evitar

- `"use client"` em componentes que não precisam de interatividade.
- Bibliotecas pesadas sem necessidade (moment.js, lodash inteiro).
- Re-renders desnecessários — memoizar listas longas.
- Fetch no cliente quando Server Component resolve.
- Imagens sem dimensões definidas (causa CLS).

## Monitoramento

- Lighthouse em cada PR que altera UI.
- Web Vitals em produção (futuro: integração com analytics).
- `pnpm --filter web build` para verificar tamanho do bundle.
