# ButterflyContainer

Primitivo de layout que limita a largura do conteúdo, centraliza horizontalmente e aplica padding responsivo.

## Objetivo

Dar a cada seção uma “caixa” de leitura previsível em desktop, mantendo respiro lateral em mobile — sem acoplar o design system ao Tailwind ou ao Next.js.

## Arquivos

| Arquivo | Responsabilidade |
|---|---|
| `Container.tsx` | Markup (`<div>`) + composição de classes |
| `Container.types.ts` | Contrato público (`size`, `fluid`, `children`) |
| `Container.styles.ts` | BEM `butterfly-container-*` + `getContainerClassName` |
| `index.ts` | Barrel |
| `README.md` | Este contrato |

## API

```tsx
import { Container } from "@corredora/ui/components/Container";

<Container>
  {/* size="lg" por padrão */}
</Container>

<Container size="lg">
  <h2>Eventos</h2>
</Container>

<Container fluid>
  {/* equivalente a size="fluid" — largura total com padding */}
</Container>
```

## Props

| Prop | Tipo | Default | Descrição |
|---|---|---|---|
| `children` | `ReactNode` | — | Conteúdo |
| `size` | `sm` \| `md` \| `lg` \| `xl` \| `fluid` | `lg` | Largura máxima |
| `fluid` | `boolean` | `false` | Atalho para `size="fluid"` (vence `size`) |
| `className` | `string` | — | Classes extras |
| `id` | `string` | — | id nativo opcional |

## Variantes de largura

| Size | Uso previsto | Token futuro |
|---|---|---|
| `sm` | Formulários, colunas estreitas | `breakpoints.container.sm` |
| `md` | Artigos / blog | `breakpoints.container.md` |
| `lg` | Páginas padrão (Home sections) | `breakpoints.container.lg` |
| `xl` | Dashboards / grades largas | `breakpoints.container.xl` |
| `fluid` | Edge-to-edge com padding lateral | `max-width: none` |

## Classes BEM

```text
.butterfly-container
.butterfly-container--sm
.butterfly-container--md
.butterfly-container--lg
.butterfly-container--xl
.butterfly-container--fluid
```

Estilos atuais em `apps/web/app/globals.css` (até o package publicar CSS próprio com tokens).

## Comportamento

1. **Largura máxima** — via modifier `--{size}`
2. **Centralização** — `margin-inline: auto` + `width: 100%`
3. **Padding responsivo** — `padding-inline` escala por breakpoint (mobile → desktop)
4. **Sem lógica de negócio** — apenas layout

## Boas práticas

- Um `Container` por bloco de conteúdo dentro de `Section` / `Layout`.
- Prefira `fluid` a CSS one-off para faixas full-bleed.
- Não usar `Container` no lugar de landmarks (`main`, `section`, `header`).
- Combinar com `Stack` / `Grid` para ritmo interno.

## Acessibilidade

- Elemento neutro (`<div>`) — não altera a árvore de landmarks.
- Hierarquia de headings permanece responsabilidade do conteúdo filho.
- Padding adequado melhora área de toque / respiro em mobile (ADR-008).

## Integração com Design Tokens (futuro)

```text
--butterfly-container-sm
--butterfly-container-md
--butterfly-container-lg
--butterfly-container-xl
--butterfly-space-md / lg  → padding-inline responsivo
```

`getContainerClassName` já isola a resolução de classes para que o CSS possa mudar sem alterar call sites.

## Estado atual

API S03-003 completa. Package sem Tailwind/Next. Consumers (Home, Playground) usam o default `lg`.
