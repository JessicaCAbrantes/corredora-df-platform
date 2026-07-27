# Butterfly EventCard

Card de apresentação de uma corrida da Plataforma Corredora DF.

## Objetivo

Exibir preview visual da prova (imagem, meta, preço, status e CTA) sem regras de inscrição, preços ou integração com API.

## Arquivos

| Arquivo | Responsabilidade |
|---|---|
| `EventCard.tsx` | Markup semântico + composição de classes |
| `EventCard.types.ts` | Contrato público + labels padrão |
| `EventCard.styles.ts` | BEM `butterfly-event-card-*` |
| `index.ts` | Barrel |
| `README.md` | Este contrato |

## API

```tsx
import { EventCard } from "@corredora/ui/components/EventCard";

<EventCard
  title="Meia Maratona de Brasília"
  date="16 de agosto de 2026"
  dateTime="2026-08-16"
  city="Brasília"
  distance="21K"
  price="R$ 149"
  status="open"
  href="/corridas/meia-maratona-brasilia"
/>

<EventCard
  title="5K Iniciantes DF"
  date="2 de agosto de 2026"
  city="Brasília"
  distance="5K"
  status="upcoming"
  href="/corridas/5k-iniciantes-df"
/>
```

## Props

| Prop | Tipo | Default | Descrição |
|---|---|---|---|
| `title` | `string` | — | Nome da corrida |
| `date` | `string` | — | Data legível |
| `dateTime` | `string` | — | Valor para `<time dateTime>` |
| `city` | `string` | — | Cidade |
| `distance` | `string` | — | Distância principal |
| `price` | `string` | — | Preço; vazio → `freeLabel` |
| `status` | `"open" \| "closed" \| "upcoming"` | — | Modificador do badge |
| `statusLabel` | `string` | labels PT-BR | Override do texto do badge |
| `image` | `{ src?, alt, placeholderLabel? }` | placeholder | Capa |
| `href` | `string` | `"#"` | Destino do CTA |
| `detailsLabel` | `string` | `"Ver detalhes"` | Texto do CTA |
| `freeLabel` | `string` | `"Gratuito"` | Quando não há preço |
| `className` | `string` | — | Extensão CSS |

## Status → label padrão

| `status` | Label |
|---|---|
| `open` | Inscrições abertas |
| `closed` | Encerradas |
| `upcoming` | Em breve |

## Classes BEM

```text
.butterfly-event-card
.butterfly-event-card__media
.butterfly-event-card__image
.butterfly-event-card__placeholder
.butterfly-event-card__body
.butterfly-event-card__badge
.butterfly-event-card__badge--open|closed|upcoming
.butterfly-event-card__title
.butterfly-event-card__meta
.butterfly-event-card__meta-item
.butterfly-event-card__footer
.butterfly-event-card__price
.butterfly-event-card__actions
```

## Critérios

- Sem Tailwind no JSX; BEM apenas.
- Sem hooks, estado ou dependências novas.
- Agnóstico ao Next.js (`<img>` / `<a>` nativos).
- CTA reutiliza classes do `Button` via `getButtonClassName`.

## Estado atual

API S03-006. Estilos em `apps/web/app/globals.css`.
