# blog

Feature de conteúdo editorial.

## Objetivo

Publicar artigos, dicas de treino, notícias do mundo da corrida e conteúdo da plataforma.

## Exemplos de uso

```tsx
// app/blog/page.tsx
import { BlogPage } from "@/features/blog";

// app/blog/[slug]/page.tsx
import { BlogPostPage } from "@/features/blog";
```

## Boas práticas

- Tipos como `BlogPost`, `BlogCategory` em `features/blog/types/`.
- Listagem e detalhe como componentes separados.
- SEO e metadata gerenciados na camada de rota (`app/blog/`).
