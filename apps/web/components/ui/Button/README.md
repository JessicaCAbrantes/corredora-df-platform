# Button

Componente de ação e interação do usuário.

## Objetivo

Padronizar botões em toda a aplicação com variantes visuais consistentes (primário, secundário, outline, ghost, destructive).

## Exemplos de uso

```tsx
<Button variant="primary" onClick={handleSubmit}>
  Inscrever-se
</Button>

<Button variant="outline" size="sm" disabled>
  Carregando...
</Button>
```

## Boas práticas

- Suportar estados: `default`, `hover`, `focus`, `disabled`, `loading`.
- Usar elemento `<button>` nativo para acessibilidade.
- Não embutir lógica de negócio — receber `onClick` via props.
- Variantes definidas com Tailwind CSS e tokens do design system.
