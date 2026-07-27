# MobileMenu

Menu de navegação para dispositivos móveis.

## Objetivo

Exibir navegação em drawer/overlay quando a tela é menor que `md`. Ativado pelo botão hambúrguer no `Header`.

## Comportamento

- Abre como drawer lateral ou overlay fullscreen
- Exibe todos os itens de `constants/navigation.ts`
- Fecha com `Escape`, clique no overlay ou navegação
- Focus trap enquanto aberto

## Exemplos de uso

```tsx
<Header>
  <MobileMenuTrigger />
</Header>
<MobileMenu navigation={publicNavigation} />
```

## Acessibilidade

- Trigger com `aria-expanded` e `aria-controls`
- Drawer com `role="dialog"` e `aria-modal="true"`
- Focus trap — tab não escapa do menu
- Foco retorna ao trigger ao fechar

## Boas práticas

- Visível apenas em `< md` (breakpoint do design system).
- Animação de entrada/saída respeitando `prefers-reduced-motion`.
- Mesmos itens do Header — fonte única em constants.
