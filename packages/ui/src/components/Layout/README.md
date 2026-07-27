# ButterflyLayout

Wrapper estrutural raiz para composição de páginas.

## Objetivo

Agrupar o conteúdo principal de uma view em um container flexível, preparado para integração com tokens de layout e espaçamento.

## Exemplos de uso

```tsx
import { Layout } from "@corredora/ui/components/Layout";

<Layout>
  <Container>
    <Section>...</Section>
  </Container>
</Layout>
```

## Boas práticas

- Usar um `Layout` por página ou rota.
- Não embutir lógica de negócio — apenas estrutura.
- Combinar com `Container` e `Section` para hierarquia clara.

## Acessibilidade

- Wrapper neutro (`<div>`) — landmarks semânticos ficam em `Section` e `<main>` do App Router.
- Não intercepta navegação por teclado.
- `className` permite extensão sem quebrar semântica.

## Responsividade

- Classe base `butterfly-layout` — estilos responsivos via CSS global e tokens de breakpoint (futuro).

## Design Tokens (futuro)

- `spacing.layout.*` — padding externo
- `breakpoints.container` — largura máxima herdada por filhos
