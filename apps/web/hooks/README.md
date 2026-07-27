# hooks/

Hooks React customizados e reutilizáveis.

## Objetivo

Encapsular lógica de estado e efeitos genéricos que não pertencem a um domínio específico.

## Exemplos de uso

```tsx
import { useDebounce } from "@/hooks";

const debouncedQuery = useDebounce(searchQuery, 300);
```

```tsx
import { useMediaQuery } from "@/hooks";

const isMobile = useMediaQuery("(max-width: 768px)");
```

## Boas práticas

- Hooks específicos de um domínio devem viver dentro da feature correspondente em `features/`.
- Nomear sempre com o prefixo `use`.
- Exportar pelo `index.ts` (barrel) desta pasta.
- Um hook = uma responsabilidade.
