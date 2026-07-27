# AppShell

Componente raiz que compõe a estrutura da aplicação.

## Objetivo

Orquestrar Header, Sidebar (opcional), conteúdo principal, Footer e MobileMenu em um layout consistente para todas as páginas.

## Composição

```text
AppShell
├── SkipLink (acessibilidade)
├── Header
├── Sidebar (condicional — autenticado/admin)
├── <main>{children}</main>
├── Footer
└── MobileMenu (condicional — mobile)
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

## Boas práticas

- Único ponto de composição do layout — páginas não montam Header/Footer diretamente.
- Recebe `children` do App Router.
- Skip link como primeiro elemento focável.
- `<main>` com `id="main-content"` para skip link target.
