# Search

Componente de busca reutilizável.

## Objetivo

Fornecer um campo de busca padronizado usado em eventos, parceiros, cupons, blog e comunidade.

## Exemplos de uso

```tsx
<Search
  placeholder="Buscar eventos..."
  onSearch={(query) => handleSearch(query)}
  debounceMs={300}
/>
```

## Boas práticas

- Debounce na digitação para evitar requisições excessivas.
- Ícone de busca e botão de limpar visíveis.
- Acessível via teclado (`Enter` para buscar, `Escape` para limpar).
- Não acoplar a um domínio — `onSearch` é genérico.
