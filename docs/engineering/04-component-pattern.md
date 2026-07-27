# 04 — Component Pattern

Como criamos e organizamos componentes React.

## Hierarquia

```text
components/ui/       → atômicos, sem negócio (Button, Input, Card)
components/layout/   → estrutura persistente (Navbar, Footer)
components/shared/   → compostos genéricos (Search, EmptyState)
features/*/components/ → específicos de domínio (EventCard, LoginForm)
```

## Anatomia de um componente

```text
components/ui/Button/
├── Button.tsx        # implementação
├── Button.test.tsx   # testes (futuro)
├── index.ts          # export
└── README.md         # contrato
```

## Padrão de implementação

```tsx
// components/ui/Button/Button.tsx
import { cn } from "@/lib";

interface ButtonProps {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({
  variant = "primary",
  size = "md",
  disabled = false,
  children,
  onClick,
}: ButtonProps) {
  return (
    <button
      className={cn("btn", `btn--${variant}`, `btn--${size}`)}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

```tsx
// components/ui/Button/index.ts
export { Button } from "./Button";
export type { ButtonProps } from "./Button";
```

## Regras

### Props

- Tudo via props — sem dependência de contexto de negócio em `components/ui/`.
- Props opcionais com valor default na desestruturação.
- Tipar com `interface`, exportar o tipo quando reutilizável.

### Composição

- Preferir `children` e slots a props excessivas.
- Subcomponentes para estruturas complexas: `Card.Header`, `Card.Content`.

```tsx
<Card>
  <Card.Header>
    <Card.Title>Maratona DF</Card.Title>
  </Card.Header>
  <Card.Content>15 de junho</Card.Content>
</Card>
```

### Server vs Client

- Componentes em `components/ui/` devem funcionar em Server e Client Components.
- Se precisar de `"use client"`, documentar no README do componente.

### Onde NÃO criar componente

| Situação | Ação |
|---|---|
| Usado em 1 feature apenas | `features/*/components/` |
| Lógica de negócio | `features/*/hooks/` ou `services/` |
| Função pura sem JSX | `lib/` |

## Barrel exports

Cada pasta exporta via `index.ts`:

```tsx
// components/ui/index.ts
export { Button } from "./Button";
export { Card } from "./Card";
// ...
```

Importação limpa:

```tsx
import { Button, Card, Badge } from "@/components/ui";
```

## Checklist ao criar componente

- [ ] Props tipadas com interface
- [ ] Sem lógica de negócio
- [ ] Acessível (ver `05-accessibility.md`)
- [ ] Exportado no `index.ts` da pasta
- [ ] README atualizado com exemplos
