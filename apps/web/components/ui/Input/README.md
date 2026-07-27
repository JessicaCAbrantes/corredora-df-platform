# Input

Componente de entrada de dados do usuário.

## Objetivo

Padronizar campos de formulário com label, validação visual e mensagens de erro.

## Exemplos de uso

```tsx
<Input
  label="E-mail"
  type="email"
  placeholder="seu@email.com"
  error="E-mail inválido"
/>
```

## Boas práticas

- Associar `<label>` ao input via `htmlFor` / `id`.
- Exibir mensagens de erro abaixo do campo.
- Suportar tipos comuns: `text`, `email`, `password`, `number`, `search`.
- Não gerenciar estado de formulário internamente — usar props controladas.
