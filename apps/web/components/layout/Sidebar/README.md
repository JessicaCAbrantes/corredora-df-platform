# Sidebar

Navegação lateral para contextos autenticado e administrativo.

## Objetivo

Exibir navegação vertical em páginas de conta (`/profile`, `/coupons`) e painel admin (`/admin/*`).

## Quando usar

| Contexto | Visível | Itens |
|---|---|---|
| Público | Não | — |
| Autenticado | Opcional (páginas de conta) | Perfil, Cupons, Concierge |
| Admin | Sim (sempre em `/admin`) | Dashboard, Eventos, Usuários |

## Exemplos de uso

```tsx
<AppShell sidebar={<Sidebar navigation={authenticatedNavigation} />}>
  {children}
</AppShell>
```

## Acessibilidade

- `<nav aria-label="Navegação lateral">`
- Navegação por setas (`↑↓`) entre itens
- Item ativo com `aria-current="page"`

## Boas práticas

- Colapsável em tablets (`md`–`lg`).
- Oculta em mobile (navegação via MobileMenu).
- Largura fixa com transição suave ao colapsar.
