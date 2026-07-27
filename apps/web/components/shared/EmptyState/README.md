# EmptyState

Componente de estado vazio.

## Objetivo

Comunicar ao usuário que não há conteúdo para exibir — listas vazias, buscas sem resultado, seções ainda sem dados.

## Exemplos de uso

```tsx
<EmptyState
  title="Nenhum evento encontrado"
  description="Tente ajustar os filtros ou volte mais tarde."
  action={<Button>Explorar eventos</Button>}
/>
```

## Boas práticas

- Sempre oferecer contexto: título + descrição.
- Incluir ação opcional (CTA) quando fizer sentido.
- Ilustração ou ícone para reforçar visualmente.
- Mensagens amigáveis e orientadas à ação.
