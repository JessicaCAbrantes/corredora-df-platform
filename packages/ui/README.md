# @corredora/ui — Butterfly UI

Design system da Plataforma Corredora DF.

## Objetivo

Fornecer tokens, temas e componentes visuais reutilizáveis para todos os apps do monorepo.

## Estrutura

```text
packages/ui/
├── src/
│   ├── tokens/     → Design Tokens (primitivos + semânticos)
│   └── themes/     → Temas (light, dark, seasonal, event)
├── package.json
├── tsconfig.json
└── README.md
```

## Uso (futuro)

```tsx
import type { ThemeTokens } from "@corredora/ui/tokens";
import type { Theme } from "@corredora/ui/themes";
```

## Documentação

- [Design System](../../docs/design-system/)
- [Tokens](./src/tokens/README.md)
- [Themes](./src/themes/README.md)

## Estado atual

Apenas tipos, interfaces e contratos. Componentes e valores concretos na Sprint 02.

## Evolução

1. ✅ Tokens e temas (tipos)
2. → Valores de branding
3. → Componentes (Button, Card, Input...)
4. → Integração Tailwind CSS
5. → Consumo em `apps/web`
