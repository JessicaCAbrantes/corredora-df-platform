# styles/

Estilos globais e tokens de design.

## Objetivo

Complementar o `app/globals.css` com temas, variáveis CSS, animações e customizações do Tailwind que não cabem em componentes.

## Exemplos de uso

```css
/* styles/animations.css */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

```tsx
// app/layout.tsx — importar estilos complementares quando necessário
import "@/styles/animations.css";
```

## Boas práticas

- Preferir Tailwind nas classes dos componentes.
- Usar CSS global apenas para o que for realmente transversal.
- O `app/globals.css` permanece como ponto de entrada dos estilos.
