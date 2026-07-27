# Loading

Componente de indicador de carregamento.

## Objetivo

Comunicar ao usuário que uma operação está em andamento — fetch de dados, submissão de formulário, navegação.

## Exemplos de uso

```tsx
<Loading size="md" />
<Loading fullPage message="Carregando eventos..." />
```

## Boas práticas

- Variantes: spinner inline, skeleton, full-page overlay.
- Usar em conjunto com `loading.tsx` do App Router quando apropriado.
- Evitar bloquear a interface inteira para operações rápidas.
