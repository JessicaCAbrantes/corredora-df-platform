# Card

Componente de agrupamento visual de conteúdo.

## Objetivo

Encapsular blocos de informação com borda, sombra e espaçamento consistentes — usado em listagens de eventos, parceiros, cupons, etc.

## Exemplos de uso

```tsx
<Card>
  <Card.Header>
    <Card.Title>Maratona de Brasília</Card.Title>
  </Card.Header>
  <Card.Content>15 de junho de 2026</Card.Content>
</Card>
```

## Boas práticas

- Compor com subcomponentes (`Header`, `Title`, `Content`, `Footer`) quando necessário.
- Manter genérico — conteúdo vem via `children` ou props.
- Garantir contraste e hierarquia visual clara.
