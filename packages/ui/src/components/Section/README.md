# ButterflySection

Seção semântica com espaçamento vertical padronizado e cabeçalho opcional.

## Objetivo

Padronizar blocos de conteúdo da plataforma (`<section>`) com título, descrição e ações de cabeçalho — sem lógica de negócio, estado interno ou acoplamento a Next.js/Tailwind.

## Arquivos

| Arquivo | Responsabilidade |
|---|---|
| `Section.tsx` | Markup semântico |
| `Section.types.ts` | Contrato público |
| `Section.styles.ts` | BEM + `getSectionClassName` |
| `index.ts` | Barrel |
| `README.md` | Este contrato |

## API

```tsx
import { Section } from "@corredora/ui/components/Section";
import { Button } from "@corredora/ui/components/Button";

<Section>
  <p>Conteúdo</p>
</Section>

<Section title="Corridas">
  …
</Section>

<Section
  title="Corridas"
  description="Escolha sua próxima prova."
>
  …
</Section>

<Section centered>
  …
</Section>

<Section headerActions={<Button>Ver todas</Button>}>
  …
</Section>
```

## Props

| Prop | Tipo | Default | Descrição |
|---|---|---|---|
| `children` | `ReactNode` | — | Corpo |
| `className` | `string` | — | Classes extras |
| `title` | `string` | — | `<h2>` visível |
| `description` | `string` | — | Texto de apoio |
| `headerActions` | `ReactNode` | — | CTAs/ações no header |
| `centered` | `boolean` | `false` | Alinha o header ao centro |
| `id` | `string` | — | id do `<section>` |
| `aria-label` | `string` | — | Nome acessível sem título |
| `aria-labelledby` | `string` | — | Referência explícita a heading externo |

## Classes BEM

```text
.butterfly-section
.butterfly-section--centered
.butterfly-section__header
.butterfly-section__title
.butterfly-section__description
.butterfly-section__header-actions
.butterfly-section__body
```

## Semântica e acessibilidade

- Sempre renderiza `<section>`.
- Cabeçalho (`<header>`) só aparece se houver `title`, `description` ou `headerActions`.
- `title` usa `<h2>` — o `<h1>` da página permanece no Hero.
- Sem estado/hooks: o nome acessível vem do heading interno ou de `aria-label` / `aria-labelledby` fornecidos pelo consumidor.

## Design Tokens (futuro)

| Token | Uso |
|---|---|
| `spacing.section.*` | `padding-block` |
| `typography.styles.h2` | título |
| `semantic.color.foreground.muted` | description |

## Critérios atendidos

- Sem lógica de negócio, estado interno ou dependências externas no package.
- Sem Tailwind no JSX; sem Next.js.
- Presentational e reutilizável.

## Estado atual

API S03-004 com `headerActions`. Estilos em `apps/web/app/globals.css` até o CSS do design system ser empacotado.
