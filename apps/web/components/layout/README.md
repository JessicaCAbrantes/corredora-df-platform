# components/layout/

App Shell e componentes estruturais da aplicação.

## Objetivo

Definir o esqueleto visual persistente — navegação, rodapé, sidebar e estrutura de página. Compõe o layout usado em `app/layout.tsx`.

## Componentes

| Componente | Responsabilidade |
|---|---|
| `AppShell/` | Composição raiz (Header + main + Footer) |
| `Header/` | Barra superior com navegação e ações |
| `Footer/` | Rodapé institucional |
| `Sidebar/` | Navegação lateral (autenticado/admin) |
| `MobileMenu/` | Menu drawer para mobile |
| `Breadcrumb/` | Navegação hierárquica |
| `Navbar/` | Legado — será substituído por Header |

## Composição

```text
AppShell
├── SkipLink
├── Header
│   └── MobileMenu (trigger)
├── Sidebar (condicional)
├── <main id="main-content">{children}</main>
├── Footer
└── MobileMenu (drawer)
```

## Exemplos de uso

```tsx
// app/layout.tsx
import { AppShell } from "@/components/layout";

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
```

## Relação com features/navigation

- **Dados** de navegação → `constants/navigation.ts`
- **Lógica** de navegação → `features/navigation/` (hooks, services)
- **Visual** de navegação → `components/layout/` (Header, Sidebar, MobileMenu)

## Boas práticas

- `AppShell` é o único ponto de composição — páginas não montam Header/Footer.
- Componentes recebem dados via props — nunca hardcodam links.
- Responsividade: Header (desktop) + MobileMenu (mobile) + Sidebar (admin).
- Acessibilidade documentada em cada componente.
