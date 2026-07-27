# Avatar

Componente de representação visual de usuários.

## Objetivo

Exibir foto de perfil ou iniciais do usuário de forma consistente em toda a aplicação.

## Exemplos de uso

```tsx
<Avatar src="/user.jpg" alt="João Silva" size="md" />
<Avatar fallback="JS" size="sm" />
```

## Boas práticas

- Suportar tamanhos: `sm`, `md`, `lg`.
- Exibir `fallback` com iniciais quando a imagem não carregar.
- Sempre incluir `alt` descritivo para acessibilidade.
