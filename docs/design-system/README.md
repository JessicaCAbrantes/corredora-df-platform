# Design System — Butterfly UI

Documentação do design system da Plataforma Corredora DF.

## Objetivo

Centralizar decisões visuais, tokens, temas e padrões de componentes do Butterfly UI.

## Código-fonte

```text
packages/ui/
└── src/
    ├── tokens/     → Design Tokens (cores, spacing, typography...)
    └── themes/     → Temas (light, dark, seasonal, event)
```

## Documentação relacionada

| Tópico | Referência |
|---|---|
| Padrão de componentes | [engineering/04-component-pattern.md](../engineering/04-component-pattern.md) |
| Acessibilidade | [engineering/05-accessibility.md](../engineering/05-accessibility.md) |
| Componentes previstos | `apps/web/components/ui/` |

## Butterfly UI — visão

```text
Tokens (primitivos + semânticos)
  └── Themes (light, dark, seasonal, event)
        └── Components (Button, Card, Input...)
              └── Features (events, home, partners...)
```

## Tokens disponíveis

| Grupo | Arquivo |
|---|---|
| Cores | `src/tokens/colors.ts` |
| Tipografia | `src/tokens/typography.ts` |
| Espaçamento | `src/tokens/spacing.ts` |
| Radius | `src/tokens/radius.ts` |
| Sombras | `src/tokens/shadows.ts` |
| Motion | `src/tokens/motion.ts` |
| Breakpoints | `src/tokens/breakpoints.ts` |
| Z-index | `src/tokens/z-index.ts` |
| Semânticos | `src/tokens/semantic.ts` |

## Temas suportados

| Tema | Variante | Status |
|---|---|---|
| Light | `default` | Contrato definido |
| Dark | `default` | Contrato definido |
| Seasonal | `seasonal` | Planejado |
| Event | `event` | Planejado |

## Estado atual

Apenas tipos e interfaces. Valores concretos na fase de branding (Sprint 02).

## Evolução

1. ✅ Tipos e temas (S01-007, S01-008)
2. → Valores de branding
3. → Integração Tailwind CSS
4. → Componentes Butterfly UI
5. → Storybook ou documentação visual
