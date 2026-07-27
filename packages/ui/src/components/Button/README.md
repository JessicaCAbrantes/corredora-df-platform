# ButterflyButton

Primeiro componente oficial do Butterfly UI.

## Objetivo

Fornecer um botão reutilizável, acessível e tipado — base para todos os CTAs da Plataforma Corredora DF. Estilos via classes CSS semânticas, preparadas para integração com Design Tokens.

## Estrutura

```text
Button/
├── Button.tsx         → implementação do componente
├── Button.types.ts    → tipos e interface de props
├── Button.styles.ts   → mapa de classes e composição
├── index.ts           → barrel de exportação
└── README.md
```

## Props

| Prop | Tipo | Default | Descrição |
|---|---|---|---|
| `variant` | `ButtonVariant` | `"primary"` | Estilo visual |
| `size` | `ButtonSize` | `"md"` | Tamanho |
| `disabled` | `boolean` | `false` | Desabilita interação |
| `loading` | `boolean` | `false` | Estado de carregamento |
| `children` | `ReactNode` | — | Conteúdo do botão |
| `onClick` | `() => void` | — | Handler de clique |
| `className` | `string` | — | Classes adicionais |

### Variants

| Variant | Uso | Token futuro |
|---|---|---|
| `primary` | Ação principal | `semantic.color.action.primary` |
| `secondary` | Ação secundária | `semantic.color.action.secondary` |
| `outline` | Ação com borda | `semantic.color.border` |
| `ghost` | Ação sutil | `semantic.color.surface` |
| `link` | Aparência de link | `semantic.typography.link` |

### Sizes

| Size | Uso | Token futuro |
|---|---|---|
| `sm` | Espaços compactos | `spacing.component.sm` |
| `md` | Padrão | `spacing.component.md` |
| `lg` | CTAs destacados | `spacing.component.lg` |

## Exemplos de uso

```tsx
import { Button } from "@corredora/ui/components/Button";

<Button variant="primary" onClick={handleSubmit}>
  Inscrever-se
</Button>

<Button variant="outline" size="sm" disabled>
  Indisponível
</Button>

<Button variant="primary" loading>
  Carregando...
</Button>
```

## Boas práticas

- Usar `variant="primary"` para no máximo uma ação principal por seção.
- Preferir `children` com texto claro — evitar botões só com ícone sem `aria-label`.
- Usar `loading` em vez de `disabled` durante submissões assíncronas.
- Não aninhar botões dentro de botões.
- Estilos visuais vivem em CSS global/token — não inline no componente.

## Acessibilidade

- Renderiza elemento nativo `<button>`.
- `disabled` bloqueia interação e remove do fluxo de tabulação quando aplicável.
- `loading` define `aria-busy="true"` e desabilita cliques.
- `aria-disabled` reflete estado desabilitado para leitores de tela.
- Foco visível será garantido via token `semantic.color.focus` na folha de estilos.
- Suporta todas as props nativas de `<button>` via spread (`...rest`).

## Integração com Design Tokens (futuro)

```css
/* Exemplo futuro — butterfly-button.css */
.butterfly-button--primary {
  background: var(--semantic-color-action-primary);
  color: var(--semantic-color-foreground);
  border-radius: var(--semantic-interaction-control-radius);
}
```

Classes definidas em `Button.styles.ts` — nenhum valor hardcoded no componente.

## Estado atual

Estrutura inicial implementada. Folha de estilos CSS e valores de tokens pendentes (Sprint 02).
