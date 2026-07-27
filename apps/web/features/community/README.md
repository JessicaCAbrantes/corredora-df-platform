# community

Feature da comunidade de corredores.

## Objetivo

Conectar corredores — grupos, discussões, rankings e interação social dentro da plataforma.

## Exemplos de uso

```tsx
// app/community/page.tsx
import { CommunityPage } from "@/features/community";
```

## Boas práticas

- Componentes sociais exclusivos (ex.: `PostCard`, `GroupList`) ficam aqui.
- Reutilizar `Avatar` de `components/ui` para perfis.
- Estado e feeds gerenciados por hooks da feature.
