# lib/

Utilitários e infraestrutura de baixo nível.

## Objetivo

Centralizar funções puras, helpers genéricos e configuração de clientes — sem dependência de React.

## Exemplos de uso

```tsx
import { cn } from "@/lib";

<div className={cn("base-class", isActive && "active-class")} />
```

```tsx
import { formatDate } from "@/lib";

formatDate("2026-06-18"); // "18 de junho de 2026"
```

## Boas práticas

- Código aqui não deve depender de React nem de componentes.
- Preferir funções puras, pequenas e testáveis.
- Exportar pelo `index.ts` (barrel) desta pasta.
