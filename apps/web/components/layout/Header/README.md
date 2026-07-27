# Header

Barra superior da aplicação.

## Objetivo

Exibir logo, navegação principal e ações do usuário (login, perfil, notificações). Substitui/evolui o `Navbar/` existente.

## Responsabilidades

- Logo e link para home
- Links de navegação (consumidos de `constants/navigation.ts`)
- Destaque da rota ativa
- Menu do usuário (autenticado) ou botão de login (público)
- Trigger do `MobileMenu` em telas menores

## Exemplos de uso

```tsx
// Dentro de AppShell
<Header navigation={publicNavigation} />
```

## Acessibilidade

- Elemento `<header>` com `<nav aria-label="Navegação principal">`
- Item ativo com `aria-current="page"`
- Menu do usuário com `aria-haspopup` e `aria-expanded`

## Boas práticas

- Dados de navegação via props — não hardcodar links.
- Sticky no topo em scroll.
- Ocultar links horizontais em `< md` (delegar ao MobileMenu).
