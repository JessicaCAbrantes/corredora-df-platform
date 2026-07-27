# Breadcrumb

Navegação hierárquica (migalhas de pão).

## Objetivo

Indicar a localização do usuário na hierarquia de páginas — especialmente em admin e páginas aninhadas.

## Quando usar

| Contexto | Exemplo |
|---|---|
| Admin | Admin → Eventos → Editar Evento |
| Blog | Blog → Categoria → Artigo |
| Eventos | Eventos → Maratona DF 2026 |

## Exemplos de uso

```tsx
<Breadcrumb
  items={[
    { label: "Admin", href: "/admin" },
    { label: "Eventos", href: "/admin/events" },
    { label: "Editar" },
  ]}
/>
```

## Acessibilidade

- `<nav aria-label="Breadcrumb">`
- `<ol>` para lista ordenada
- Item atual com `aria-current="page"`
- Separador visual não lido por leitores de tela

## Boas práticas

- Último item sem link (página atual).
- Gerar items automaticamente a partir da rota (futuro: hook).
- Não usar na home — apenas em páginas aninhadas.
