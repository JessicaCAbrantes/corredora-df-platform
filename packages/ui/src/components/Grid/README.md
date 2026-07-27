# ButterflyGrid

Primitivo de layout baseado em **CSS Grid** para distribuir filhos em colunas uniformes.

## Objetivo

Padronizar grades de cards/listagens no Butterfly UI — mobile-aware via `responsive`, sem Tailwind no JSX e sem acoplamento ao Next.js.

## Arquivos

| Arquivo | Responsabilidade |
|---|---|
| `Grid.tsx` | Container `display: grid` |
| `Grid.types.ts` | `columns`, `gap`, `responsive` |
| `Grid.styles.ts` | BEM + `getGridClassName` |
| `index.ts` | Barrel |
| `README.md` | Este contrato |

## API

```tsx
import { Grid } from "@corredora/ui/components/Grid";

<Grid>
  <div>A</div>
</Grid>

<Grid columns={2}>
  <div>A</div>
  <div>B</div>
</Grid>

<Grid columns={3} gap="lg">
  …
</Grid>

<Grid columns={4} responsive>
  …
</Grid>
```

## Props

| Prop | Tipo | Default | Descrição |
|---|---|---|---|
| `children` | `ReactNode` | — | Itens da grade |
| `columns` | `1 \| 2 \| 3 \| 4` | `1` | Colunas-alvo |
| `gap` | `"sm" \| "md" \| "lg"` | `"md"` | Espaçamento |
| `responsive` | `boolean` | `false` | Colapsa em viewports menores |
| `className` | `string` | — | Extensão CSS |

## Classes BEM

```text
.butterfly-grid
.butterfly-grid--cols-1|2|3|4
.butterfly-grid--gap-sm|md|lg
.butterfly-grid--responsive
```

### Comportamento `responsive`

| Viewport | `columns={2}` | `columns={3}` | `columns={4}` |
|---|---|---|---|
| &lt; 640px | 1 | 1 | 1 |
| ≥ 640px | 2 | 2 | 2 |
| ≥ 768px | 2 | 3 | 3 |
| ≥ 1024px | 2 | 3 | 4 |

Sem `responsive`, o número de colunas é fixo em todos os breakpoints.

## Design Tokens (futuro)

| Token | Uso |
|---|---|
| `spacing.scale.sm\|md\|lg` | gaps |
| `breakpoints.md\|lg` | degraus do modo responsive |

## Expansões futuras (API reservada)

Tipos exportados, ainda **não** ligados a props:

| Tipo | Prop futura | Papel |
|---|---|---|
| `GridAlign` | `align` | `place-items` / alinhamento dos itens |
| `GridJustify` | `justify` | `justify-items` / distribuição |
| `GridAutoFit` | `autoFit` | `repeat(auto-fit, minmax(...))` |

Padrão igual a `Container` / `Section`: union tipada + mapa BEM em `*.styles.ts` + `getGridClassName`.

## Critérios

- Sem lógica de negócio, estado ou deps externas.
- CSS Grid nativo; BEM `butterfly-grid-*`.
- Agnóstico ao Next.js.

## Estado atual

API S03-005. Estilos em `apps/web/app/globals.css`.
