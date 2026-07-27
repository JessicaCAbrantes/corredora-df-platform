# constants/

Constantes e valores fixos da aplicação.

## Objetivo

Centralizar valores imutáveis usados em vários pontos — rotas nomeadas, limites de paginação, mensagens padrão, chaves de storage.

## Exemplos de uso

```tsx
import { ROUTES } from "@/constants";

<Link href={ROUTES.EVENTS}>Eventos</Link>
```

```tsx
import { PAGINATION } from "@/constants";

const pageSize = PAGINATION.DEFAULT_PAGE_SIZE; // 20
```

## Boas práticas

- Nomear em `UPPER_SNAKE_CASE` ou como objetos `as const`.
- Evitar números mágicos e strings repetidas no código.
- Exportar pelo `index.ts` (barrel) desta pasta.
