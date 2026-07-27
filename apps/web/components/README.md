# components/

Componentes React reutilizáveis e independentes de regra de negócio.

## Objetivo

Centralizar a interface reutilizável da aplicação, separada por responsabilidade visual e estrutural. Componentes aqui não conhecem domínio de negócio.

## Organização

- `ui/` — componentes atômicos: Button, Card, Badge, Avatar, Input, Modal, Loading.
- `layout/` — estrutura da aplicação: Navbar, Footer.
- `shared/` — compostos reutilizados entre features: Search, EmptyState.

## Exemplos de uso

```tsx
import { Button, Card } from "@/components/ui";
import { Navbar, Footer } from "@/components/layout";
import { Search, EmptyState } from "@/components/shared";
```

## Boas práticas

- Componentes não devem acessar serviços nem conter regras de negócio.
- Componentes específicos de um domínio pertencem à feature correspondente em `features/`.
- Cada subpasta possui seu próprio README com contrato e exemplos.
- Exportar via barrel files (`index.ts`) em cada subpasta.
