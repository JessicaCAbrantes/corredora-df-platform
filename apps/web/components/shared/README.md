# components/shared/

Componentes compostos reutilizados entre múltiplas features.

## Objetivo

Evitar duplicação de blocos de interface usados em mais de um domínio, sem acoplar a regra de negócio de uma feature específica.

## Componentes previstos

- `Search/` — campo de busca reutilizável.
- `EmptyState/` — estado vazio para listas e resultados.

## Exemplos de uso

```tsx
import { Search } from "@/components/shared";
import { EmptyState } from "@/components/shared";

<Search placeholder="Buscar eventos..." onSearch={handleSearch} />
<EmptyState title="Nenhum resultado" description="Tente outro termo." />
```

## Boas práticas

- Se um componente é usado por apenas uma feature, ele deve viver dentro da própria feature.
- Manter genérico o suficiente para servir múltiplos contextos via props.
- Exportar pelo `index.ts` (barrel) desta pasta.
