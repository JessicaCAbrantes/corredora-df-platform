# Badge

Componente de rótulo e indicador de status.

## Objetivo

Exibir tags, categorias e estados de forma compacta — ex.: "Gratuito", "VIP", "Encerrado", "Novo".

## Exemplos de uso

```tsx
<Badge variant="success">Confirmado</Badge>
<Badge variant="warning">Últimas vagas</Badge>
<Badge variant="neutral">5 km</Badge>
```

## Boas práticas

- Variantes semânticas: `success`, `warning`, `error`, `info`, `neutral`.
- Texto curto e legível.
- Não usar como botão — badges são informativos, não interativos.
