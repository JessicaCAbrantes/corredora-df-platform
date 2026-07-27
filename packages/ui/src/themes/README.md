# Butterfly UI — Themes

Sistema de temas do design system da Plataforma Corredora DF.

## Objetivo

Permitir múltiplas variações visuais da plataforma sem alterar componentes ou lógica de negócio. Temas trocam tokens — componentes consomem tokens.

## Estrutura

```text
themes/
├── theme.ts          → contrato base (Theme, ThemeMetadata, ThemeRegistry)
├── light-theme.ts    → tema claro padrão
├── dark-theme.ts     → tema escuro padrão
└── README.md
```

## Tipos de tema suportados

| Tipo | Variante | Exemplo | Uso |
|---|---|---|---|
| Light | `default` | `light-default` | Tema padrão da aplicação |
| Dark | `default` | `dark-default` | Modo escuro (preferência do usuário) |
| Seasonal | `seasonal` | `seasonal-summer-2026` | Campanhas sazonais |
| Event | `event` | `event-marathon-df` | Eventos especiais com identidade própria |

## Como funcionará

```text
ThemeProvider (futuro)
  └── Theme ativo (light-default | dark-default | seasonal-* | event-*)
        └── Tokens (colors, typography, spacing...)
              └── Componentes Butterfly UI
```

### Troca de tema (futuro)

```tsx
// O usuário ou sistema seleciona um tema
setTheme("dark-default");

// Componentes reagem automaticamente via CSS variables ou Tailwind
<Button variant="primary" /> // usa tokens do tema ativo
```

### Seasonal Themes

Temas temporários para campanhas (verão, natal, aniversário da plataforma). Ativados por período ou manualmente pelo admin.

### Event Themes

Identidade visual exclusiva para eventos especiais (maratona, corrida temática). Podem sobrescrever cores primárias e assets sem afetar o restante da plataforma.

## Acessibilidade

Todo tema deve atender os requisitos documentados em `ThemeAccessibility`:

### WCAG AA

- Contraste mínimo 4.5:1 para texto normal
- Contraste mínimo 3:1 para texto grande e elementos UI
- Cada tema será validado com ferramentas de contraste antes de ser ativado

### prefers-reduced-motion

- Animações desabilitadas ou reduzidas quando o usuário ativa a preferência do sistema
- Tokens de `motion` respeitam `prefers-reduced-motion: reduce`

### Alto contraste

- Suporte a modo de alto contraste do sistema operacional
- Tokens semânticos garantem legibilidade em qualquer combinação

### Foco visível

- Todo elemento interativo possui indicador de foco visível
- Contraste do foco atende WCAG AA independente do tema

### Navegação por teclado

- Temas não alteram a ordem de tabulação
- Foco nunca é removido visualmente

## Boas práticas

- Um tema = um conjunto completo de tokens + metadados + acessibilidade.
- Temas novos estendem `Theme` — nunca criam estrutura paralela.
- Seasonal e event themes têm data de expiração planejada.
- Validar contraste de cada tema antes de ativar em produção.
- Nunca hardcodar cores em componentes — sempre consumir tokens do tema ativo.

## Estado atual

Apenas contratos (`interface`, `type`) e placeholders. Valores concretos serão definidos na fase de branding.

## Evolução

1. **Agora** — contratos de tema (este ticket)
2. **Branding** — preencher light e dark themes
3. **ThemeProvider** — React context para troca de tema
4. **Seasonal/Event** — temas dinâmicos por campanha
5. **Integração** — CSS variables + Tailwind
