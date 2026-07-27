# types/

Tipos e interfaces TypeScript globais.

## Objetivo

Definir tipos compartilhados por toda a aplicação — entidades base, DTOs, tipos utilitários e contratos de resposta da API.

## Exemplos de uso

```tsx
import type { ApiResponse, PaginatedResult } from "@/types";

type EventsResponse = ApiResponse<PaginatedResult<Event>>;
```

## Boas práticas

- Tipos específicos de um domínio ficam na feature correspondente em `features/`.
- Evitar `any`; preferir tipos explícitos e utilitários do TypeScript.
- Exportar pelo `index.ts` (barrel) desta pasta.
- Usar `type` para unions e `interface` para contratos extensíveis.
