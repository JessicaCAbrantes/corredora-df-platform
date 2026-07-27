# providers/

Provedores de contexto global da aplicação.

## Objetivo

Centralizar a composição de contextos React que envolvem toda a árvore de componentes — tema, autenticação, cache de dados, toasts.

## Exemplos de uso

```tsx
// app/layout.tsx
import { AppProviders } from "@/providers";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
```

## Boas práticas

- Providers são Client Components (`"use client"`).
- Cada provider em seu próprio arquivo; compor todos em `AppProviders`.
- Exportar pelo `index.ts` (barrel) desta pasta.
- Evitar providers com estado que muda com frequência — preferir bibliotecas especializadas.
