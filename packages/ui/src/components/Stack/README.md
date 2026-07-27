# ButterflyStack

Layout flexível para empilhamento vertical ou horizontal de elementos.

## Objetivo

Distribuir elementos com espaçamento consistente sem depender de margin manual — base para formulários, listas e grupos de ações.

## Props

| Prop | Tipo | Default | Descrição |
|---|---|---|---|
| `direction` | `row` \| `column` | `column` | Direção do flex |
| `gap` | `sm` \| `md` \| `lg` | `md` | Espaçamento entre filhos |
| `align` | `start` \| `center` \| `end` \| `stretch` | `stretch` | align-items |
| `justify` | `start` \| `center` \| `end` \| `between` | `start` | justify-content |
| `children` | `ReactNode` | — | Itens empilhados |
| `className` | `string` | — | Classes adicionais |

## Exemplos de uso

```tsx
<Stack direction="column" gap="md">
  <Button>Confirmar</Button>
  <Button variant="outline">Cancelar</Button>
</Stack>

<Stack direction="row" gap="sm" justify="between">
  <span>Total</span>
  <span>R$ 120,00</span>
</Stack>
```

## Boas práticas

- Preferir `Stack` em vez de margin entre irmãos.
- `direction="row"` em mobile pode precisar de override responsivo via CSS (futuro).

## Acessibilidade

- Container neutro (`<div>`) — ordem DOM = ordem de tabulação.
- Não usar `Stack` para listas semânticas — preferir `<ul>`/`<ol>` quando aplicável.

## Responsividade

- `butterfly-stack--row` pode virar coluna em `< md` via media query (futuro).
- Gaps mapeados para `spacing.scale` nos tokens.

## Design Tokens (futuro)

- `spacing.scale` — valores de gap
- `breakpoints.md` — stack direction responsivo
