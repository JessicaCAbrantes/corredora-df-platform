# Navbar

Componente de navegação principal.

## Objetivo

Fornecer acesso persistente às seções principais da plataforma: Home, Eventos, Parceiros, Comunidade, Perfil.

## Exemplos de uso

```tsx
// app/layout.tsx
<Navbar
  links={[
    { href: "/", label: "Home" },
    { href: "/events", label: "Eventos" },
    { href: "/partners", label: "Parceiros" },
  ]}
/>
```

## Boas práticas

- Destacar rota ativa com base no pathname.
- Responsivo: menu hambúrguer em telas menores.
- Logo e links principais sempre visíveis.
- Não embutir lógica de autenticação — receber estado via props ou slot.
