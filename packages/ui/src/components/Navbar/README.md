# ButterflyNavbar

Primeiro componente visual da Plataforma Corredora DF.

## Objetivo

Fornecer a barra de navegação principal com identidade da marca, links estáticos e CTAs de autenticação — base para todas as páginas da plataforma.

## Estrutura

```text
<header class="butterfly-navbar">
  <div class="butterfly-navbar__inner">
    <a class="butterfly-navbar__logo">🦋 Corredora DF</a>
    <nav aria-label="Navegação principal">
      <ul>
        <li><a>Home</a></li>
        ...
      </ul>
    </nav>
    <div class="butterfly-navbar__actions">
      <Button variant="ghost">Entrar</Button>
      <Button variant="primary">Cadastrar-se</Button>
    </div>
    <button class="butterfly-navbar__menu-trigger">Menu</button>
    <div id="butterfly-navbar-mobile-menu" hidden />
  </div>
</header>
```

## Props

| Prop | Tipo | Default | Descrição |
|---|---|---|---|
| `items` | `NavItem[]` | `DEFAULT_NAV_ITEMS` | Links do menu |
| `logoHref` | `string` | `"/"` | Destino do logo |
| `logoLabel` | `string` | `"Corredora DF — Página inicial"` | aria-label do logo |
| `activeItemId` | `string` | — | Item ativo (`aria-current="page"`) |
| `onLoginClick` | `() => void` | — | Placeholder para Entrar |
| `onRegisterClick` | `() => void` | — | Placeholder para Cadastrar-se |
| `className` | `string` | — | Classes adicionais |

## Menu padrão

| Item | Rota (placeholder) |
|---|---|
| Home | `/` |
| Corridas | `/corridas` |
| Retirada de Kits | `/kits` |
| Cupons | `/cupons` |
| Parceiros | `/parceiros` |
| Comunidade | `/comunidade` |
| Blog | `/blog` |

## Exemplos de uso

```tsx
import { Navbar } from "@corredora/ui/components/Navbar";

<Navbar activeItemId="home" />

<Navbar
  activeItemId="corridas"
  onLoginClick={() => console.log("login")}
  onRegisterClick={() => console.log("register")}
/>
```

## Boas práticas

- Um `Navbar` por layout — montado no `AppShell` (Sprint 03).
- Passar `activeItemId` com base na rota atual.
- Substituir `onLoginClick` / `onRegisterClick` por navegação real na Sprint 11.
- Menu mobile: trigger presente — lógica no Sprint 03.

## Acessibilidade

- `<header>` como landmark de cabeçalho.
- `<nav aria-label="Navegação principal">` para o menu.
- Lista semântica `<ul>` / `<li>` para itens.
- `aria-current="page"` no link ativo.
- Logo com `aria-label` descritivo; emoji com `aria-hidden`.
- Trigger mobile com `aria-expanded`, `aria-controls` e `aria-label`.
- Painel mobile com `hidden` e `aria-hidden` até implementação.
- Foco visível via classes CSS e token `semantic.color.focus` (futuro).
- Todos os links e botões navegáveis por teclado (`Tab`, `Enter`).

## Responsividade

| Breakpoint | Comportamento |
|---|---|
| `≥ md` | Menu horizontal visível; trigger oculto via CSS |
| `< md` | Menu desktop oculto; trigger visível (futuro) |

Classes BEM em `Navbar.styles.ts` — estilos responsivos na folha CSS global (futuro).

## Design Tokens (futuro)

- `semantic.color.action.primary` — botão Cadastrar-se
- `semantic.color.foreground` — links do menu
- `spacing.component.md` — padding interno
- `z-index.sticky` — navbar fixa no topo

## Estado atual

Dados estáticos. Sem autenticação. Sem API. Menu mobile — apenas estrutura.
