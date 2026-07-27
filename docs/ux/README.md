# UX

Documentação de experiência do usuário.

## Objetivo

Registrar padrões de interação, fluxos de navegação, wireframes e decisões de UX que guiam o frontend.

## Documentação relacionada

| Tópico | Referência |
|---|---|
| Jornadas do usuário | [product/user-journeys.md](../product/user-journeys.md) |
| Navegação | `apps/web/features/navigation/` |
| App Shell | `apps/web/components/layout/AppShell/` |
| Acessibilidade | [engineering/05-accessibility.md](../engineering/05-accessibility.md) |
| Performance | [engineering/06-performance.md](../engineering/06-performance.md) |

## Navegação

| Contexto | Componentes | Itens |
|---|---|---|
| Público | Header, MobileMenu | Home, Eventos, Parceiros, Blog |
| Autenticado | Header, Sidebar | + Perfil, Cupons, Concierge |
| Admin | Sidebar, Breadcrumb | Dashboard, CRUD, Configurações |

Definido em `constants/navigation.ts` e `types/navigation.ts`.

## Princípios de UX

- **Mobile-first** — projetar para mobile, expandir para desktop
- **Acessível** — WCAG 2.1 AA em todos os fluxos
- **Consistente** — Butterfly UI garante uniformidade visual
- **Performático** — Server Components por padrão, interação mínima no cliente

## Fluxos principais

Detalhamento completo em [product/user-journeys.md](../product/user-journeys.md).

```text
Descoberta:     Home → Eventos → Detalhe → Inscrição
Kits:           Inscrição → Retirada de Kits → Detalhe do kit
Cupons:         Home / Parceiros → Cupons → Resgate
Parceiros:      Home → Parceiros → Detalhe → Cupom
Comunidade:     Home → Feed → Post → Comentário / Grupo
Autenticação:   Login → Perfil → Edição
Admin:          Dashboard → CRUD → Publicação
```

## Responsividade

| Breakpoint | Layout |
|---|---|
| `< md` | MobileMenu (drawer) |
| `≥ md` | Header horizontal |
| `≥ lg` | Header + Sidebar (admin/conta) |

## Documentos futuros

- `wireframes/` — protótipos de tela
- `design-review.md` — checklist de revisão visual

## Estado atual

Arquitetura de navegação definida (S01-009). Wireframes e fluxos visuais pendentes.
