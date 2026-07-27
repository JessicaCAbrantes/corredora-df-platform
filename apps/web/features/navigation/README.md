# features/navigation

Feature de navegação da Plataforma Corredora DF.

## Objetivo

Centralizar a lógica de navegação — filtragem por contexto (público, autenticado, admin), estado ativo, permissões e composição dos menus. Componentes visuais vivem em `components/layout/`; esta feature orquestra a lógica.

## Estrutura

```text
navigation/
├── components/   → componentes de navegação com lógica (NavLink, NavMenu)
├── hooks/        → useNavigation, useActiveRoute, useNavContext
├── services/     → resolução de navegação por permissão
├── types/        → tipos específicos da feature (re-export ou extensão)
├── index.ts      → API pública
└── README.md
```

## Navegação pública

Destinada a visitantes não autenticados. Itens definidos em `constants/navigation.ts` → `PUBLIC_NAVIGATION`.

```text
Home | Eventos | Parceiros | Blog | Comunidade | Login
```

- Exibida no `Header` e `MobileMenu`
- Sem itens que requerem `requiresAuth`
- Footer com links institucionais

## Navegação autenticada

Para usuários logados. Extende a navegação pública com itens de conta.

```text
Home | Eventos | Parceiros | Cupons | Comunidade | Perfil | Concierge
```

- Itens com `requiresAuth: true` em `AUTHENTICATED_NAVIGATION`
- Avatar/menu do usuário no `Header`
- Sidebar opcional em páginas de conta

## Expansão futura — Painel Administrativo

Sprint 12 adicionará `ADMIN_NAVIGATION` com itens restritos por `roles: ["admin"]`.

```text
Dashboard | Eventos | Parceiros | Cupons | Usuários | Configurações
```

- Rota base: `/admin`
- Layout separado com `Sidebar` persistente
- Breadcrumb para hierarquia de páginas admin
- Filtragem via `services/` por papel do usuário

## Acessibilidade

- Navegação usa elemento `<nav>` com `aria-label` descritivo
- Item ativo marcado com `aria-current="page"`
- Submenus com `aria-expanded` e `aria-haspopup`
- Skip link no `AppShell` para pular navegação
- Contraste de links ativos atende WCAG AA
- Referência: `docs/engineering/05-accessibility.md`

## Navegação por teclado

- `Tab` percorre itens de navegação em ordem lógica
- `Enter`/`Space` ativa links e botões
- `Escape` fecha `MobileMenu` e submenus
- Setas (`↑↓`) navegam entre itens em menus verticais (`Sidebar`)
- Focus trap no `MobileMenu` quando aberto
- Foco retorna ao trigger ao fechar menu

## Responsividade

| Breakpoint | Componente ativo | Comportamento |
|---|---|---|
| `< md` | `MobileMenu` | Menu hambúrguer, navegação em drawer |
| `≥ md` | `Header` | Links horizontais na barra superior |
| `≥ lg` | `Header` + `Sidebar` (opcional) | Sidebar em páginas de conta/admin |

- `AppShell` compõe Header + conteúdo + Footer
- `Sidebar` visível apenas em contextos autenticado/admin
- Transição entre mobile e desktop sem perda de estado

## Exemplos de uso (futuro)

```tsx
import { useNavigation } from "@/features/navigation";

const { items, activeItem } = useNavigation("public");
```

```tsx
// app/layout.tsx
import { AppShell } from "@/components/layout";

export default function RootLayout({ children }) {
  return <AppShell>{children}</AppShell>;
}
```

## Boas práticas

- Dados de navegação em `constants/navigation.ts` — lógica em `features/navigation/`
- Componentes de layout são visuais; feature de navigation é comportamental
- Nunca hardcodar links em componentes — consumir constants
- Novos itens: adicionar em constants, não em componentes
