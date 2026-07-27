# ButterflyHero

Hero oficial da primeira dobra da Plataforma Corredora DF.

## Objetivo

Apresentar título, subtítulo, CTAs (**Encontrar Corridas** / **Ver Cupons**), indicadores rápidos e área reservada para a imagem da atleta — sem lógica de negócio, APIs ou autenticação.

## Estrutura

```text
<section class="butterfly-hero" aria-label="…">
  <div class="butterfly-hero__background" aria-hidden />
  <div class="butterfly-hero__overlay" aria-hidden />
  <div class="butterfly-hero__inner">
    <div class="butterfly-hero__content">
      <h1>…</h1>
      <p class="butterfly-hero__subtitle">…</p>
      <div class="butterfly-hero__actions">
        <a class="butterfly-button …">Encontrar Corridas</a>
        <a class="butterfly-button …">Ver Cupons</a>
      </div>
      <ul class="butterfly-hero__indicators" aria-label="Indicadores rápidos">
        <li>+500 / eventos</li>
        <li>Brasília/DF</li>
        <li>5K • 10K • 21K • 42K / Distâncias</li>
      </ul>
    </div>
    <div class="butterfly-hero__media">
      <figure>placeholder | <img alt="…"></figure>
    </div>
  </div>
  <a class="butterfly-hero__scroll-indicator" href="#main-content">↓</a>
</section>
```

## Arquivos

| Arquivo | Responsabilidade |
|---|---|
| `Hero.tsx` | Markup semântico e composição |
| `Hero.types.ts` | Contratos + defaults pt-BR (i18n-ready) |
| `Hero.styles.ts` | Classes BEM `butterfly-hero-*` |
| `index.ts` | Barrel público |
| `README.md` | Este contrato |

## Props

| Prop | Tipo | Default | Descrição |
|---|---|---|---|
| `title` | `string` | Sua jornada começa aqui | Único `<h1>` |
| `subtitle` | `string` | Plataforma do DF… | Apoio sob o título |
| `primaryCta` | `HeroCta` | Encontrar Corridas → `/corridas` | CTA primário |
| `secondaryCta` | `HeroCta` | Ver Cupons → `/cupons` | CTA secundário |
| `indicators` | `HeroIndicator[]` | +500 / Brasília/DF / distâncias | Indicadores |
| `image` | `HeroImage` | placeholder atleta | Mídia |
| `scrollTargetId` | `string` | `main-content` | Alvo do scroll |
| `ariaLabel` | `string` | Destaque principal | Landmark |
| `scrollLabel` | `string` | Rolar para… | a11y do scroll |
| `indicatorsLabel` | `string` | Indicadores rápidos | a11y da lista |
| `className` | `string` | — | Extensão CSS |

## Exemplo

```tsx
import { Hero } from "@corredora/ui/components/Hero";

<Hero />

<Hero
  title="Maratona de Brasília"
  primaryCta={{ id: "races", label: "Encontrar Corridas", href: "/corridas" }}
  image={{
    src: "/images/atleta.png",
    alt: "Atleta da Corredora DF em pose de corrida",
  }}
/>
```

## Internacionalização (preparado)

- Nenhum texto hardcoding fora de defaults exportados.
- Apps i18n passam `title`, `subtitle`, labels de CTA/indicators/aria via props.
- IDs (`find-races`, `events`) permanecem estáveis entre locales.

## Acessibilidade (WCAG)

| Requisito | Implementação |
|---|---|
| Um h1 | Somente `title` |
| Hierarquia | `subtitle` é `<p>` |
| CTAs | `<a>` com classes do Butterfly Button (navegáveis por teclado) |
| Indicadores | `<ul>` com `aria-label`; value + label em texto (não só cor) |
| Imagem | `alt` descritivo; placeholder com `role="img"` + `aria-label` |
| Decorativo | background/overlay `aria-hidden` |
| Contraste | Overlay escuro + estilos do app (`globals.css`) |
| Scroll | Link com `aria-label` descritivo |

## Boas práticas

- Um `<Hero>` por página.
- CTAs usam `href` (padrão Button via `getButtonClassName`) — sem handlers de negócio no package.
- `next/image` fica na app; o package permanece framework-agnostic com `<img>`.
- Sem fetch, auth ou estado.

## Estado atual

Defaults pt-BR do S03-002. Placeholder de atleta estrutural. Estilos consumidos em `apps/web/app/globals.css`.
