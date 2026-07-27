# Butterfly UI — Tokens

Tokens visuais do design system, organizados em primitivos e semânticos.

## Objetivo

Centralizar todas as decisões visuais atômicas. Componentes consomem **semantic tokens** — nunca valores literais.

```text
Primitivos (colors, spacing...) → Semânticos (semantic.ts) → Componentes
```

## Estrutura

```text
tokens/
├── colors.ts        → paleta primitiva (primary, neutral, feedback)
├── typography.ts    → fontes e estilos tipográficos
├── spacing.ts       → escala de espaçamento
├── radius.ts        → border-radius
├── shadows.ts       → elevações
├── motion.ts        → animações (com suporte a reduced motion)
├── breakpoints.ts   → responsividade
├── z-index.ts       → camadas de empilhamento
├── semantic.ts      → mapeamento semântico (o que componentes consomem)
├── index.ts         → ThemeTokens (contrato agregado)
└── README.md
```

## Primitivos vs Semânticos

| Camada | Arquivo | Consumidor | Exemplo |
|---|---|---|---|
| Primitivo | `colors.ts` | `semantic.ts` | `primary.500` |
| Semântico | `semantic.ts` | Componentes | `action.primary` |
| Componente | `Button.tsx` | Aplicação | `semantic.color.action.primary` |

### Por que dois níveis?

- **Primitivos** mudam entre temas (light vs dark).
- **Semânticos** mantêm o mesmo nome em qualquer tema.
- Componentes nunca sabem se estão em light ou dark — consomem `action.primary`.

## Como serão utilizados

### Por tema

Cada tema (light, dark, seasonal, event) fornece uma instância de `ThemeTokens`:

```ts
// Futuro — light-theme.ts
const lightTokens: ThemeTokens = {
  colors: { primary: { 500: "#3b82f6", ... }, ... },
  semantic: { color: { action: { primary: colors.primary[500] }, ... } },
  // ...
};
```

### Por componente

```tsx
// Componentes consomem semantic tokens
<button style={{ background: tokens.semantic.color.action.primary }}>
```

### Por Tailwind (futuro)

```css
/* CSS variables geradas a partir dos tokens */
--color-action-primary: var(--colors-primary-500);
```

## Acessibilidade

### WCAG AA

- Tokens semânticos de cor serão validados para contraste 4.5:1 (texto) e 3:1 (UI).
- `semantic.color.focus` garante foco visível em qualquer tema.

### prefers-reduced-motion

- `motion.reducedMotion` define fallback quando o usuário ativa a preferência.
- Presets de animação são substituídos por `duration: instant` e `disableAnimations: true`.

### Alto contraste

- Semantic tokens de `foreground` e `background` mantêm contraste em modo de alto contraste do SO.
- Temas serão testados com `forced-colors: active`.

### Foco visível

- `semantic.color.focus` — cor dedicada para outline de foco.
- Independente do tema, foco nunca é removido.

### Navegação por teclado

- Tokens não afetam tab order — apenas aparência visual.
- Z-index tokens garantem que modais e dropdowns não bloqueiem navegação.

## Responsabilidade de cada arquivo

| Arquivo | Responsabilidade |
|---|---|
| `colors.ts` | Paleta de cores primitivas (escalas 50–950) |
| `typography.ts` | Famílias, tamanhos, pesos e estilos compostos |
| `spacing.ts` | Escala de espaçamento e presets de componente/seção |
| `radius.ts` | Border-radius para controles e containers |
| `shadows.ts` | Elevação visual (cards, overlays) |
| `motion.ts` | Durações, easing, presets e reduced motion |
| `breakpoints.ts` | Pontos de quebra responsivos |
| `z-index.ts` | Camadas de empilhamento ordenadas |
| `semantic.ts` | Mapeamento semântico — API dos componentes |
| `index.ts` | Contrato `ThemeTokens` agregando tudo |

## Boas práticas

- Componentes importam de `semantic.ts`, nunca de primitivos.
- Novos tokens seguem o padrão: interface + Placeholder type.
- Validar contraste ao preencher valores.
- Testar com `prefers-reduced-motion` e `prefers-color-scheme`.
- Documentar cada token novo no README.

## Estado atual

Apenas interfaces, tipos e placeholders. Valores concretos na fase de branding.

Esta pasta (`src/tokens/`) é a **fonte de verdade** dos Design Tokens do Butterfly UI.
