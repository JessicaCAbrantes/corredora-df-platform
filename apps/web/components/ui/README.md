# components/ui/

Componentes de interface atômicos e genéricos.

## Objetivo

Fornecer blocos de construção visuais básicos e desacoplados de regra de negócio. São a base do design system da aplicação.

## Componentes previstos

- `Button/` — ações e interações.
- `Card/` — agrupamento de conteúdo.
- `Badge/` — rótulos e status.
- `Avatar/` — representação visual de usuários.
- `Input/` — campos de entrada de dados.
- `Modal/` — diálogos e overlays.
- `Loading/` — indicadores de carregamento.

## Exemplos de uso

```tsx
import { Button } from "@/components/ui";
import { Card } from "@/components/ui";
import { Badge } from "@/components/ui";
```

## Boas práticas

- Estilização com Tailwind CSS.
- Receber tudo via props — sem dependência de contexto de negócio.
- Garantir acessibilidade (ARIA, foco, contraste).
- Exportar pelo `index.ts` (barrel) desta pasta.
