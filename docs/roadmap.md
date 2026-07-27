# Roadmap — Plataforma Corredora DF

Planejamento de sprints do MVP da plataforma.

```text
Sprint 01  →  Fundação              ✅
Sprint 02  →  Butterfly UI           🔜
Sprint 03  →  Layout
Sprint 04  →  Home
Sprint 05  →  Eventos
Sprint 06  →  Parceiros
Sprint 07  →  Cupons
Sprint 08  →  Concierge
Sprint 09  →  Comunidade
Sprint 10  →  Blog
Sprint 11  →  Login
Sprint 12  →  Painel Administrativo
Sprint 13  →  Testes
Sprint 14  →  Deploy
Sprint 15  →  MVP
```

---

## Sprint 01 — Fundação

**Status:** ✅ Concluída (13 jul 2026)

**Tickets:** S01-005 · S01-006 · S01-007 · S01-008 · S01-009 · S01-010 · S01-011

**Entregáveis:**
- [x] Monorepo (pnpm + Turborepo)
- [x] Next.js em `apps/web` rodando
- [x] Arquitetura frontend (features, components, lib, hooks...)
- [x] 10 features preparadas (incl. navigation)
- [x] App Shell e navegação tipada
- [x] Butterfly UI — tokens e temas (tipos)
- [x] Pacote `@corredora/ui`
- [x] Manual de Engenharia (10 guias)
- [x] API Contract (15 documentos)
- [x] Estrutura enterprise em `docs/`
- [x] `scripts/` e `tests/` na raiz
- [x] Devlog Sprint 01

**Devlog:** [devlog/2026-06-18.md](./devlog/2026-06-18.md)

---

## Sprint 02 — Butterfly UI

**Status:** 🔜 Próxima

**Escopo:**
- Definir paleta de cores e valores de branding
- Preencher Design Tokens em `packages/ui/src/tokens/`
- Implementar light e dark theme com valores concretos
- Integrar tokens com Tailwind CSS em `apps/web`
- Implementar componentes base: Button, Card, Badge, Avatar, Input, Modal, Loading

**Entregáveis:**
- [ ] Tokens com valores definitivos
- [ ] Light theme + dark theme preenchidos
- [ ] Integração Tailwind (`tailwind.config` consumindo tokens)
- [ ] 7 componentes atômicos funcionais
- [ ] Exportação via `@corredora/ui`

**Pacote:** `packages/ui/`  
**Referência:** [design-system/](./design-system/)

---

## Sprint 03 — Layout

**Status:** Pendente

**Escopo:**
- AppShell funcional em `app/layout.tsx`
- Header com navegação pública
- Footer institucional
- MobileMenu responsivo
- AppProviders configurado

**Entregáveis:**
- [ ] AppShell composto
- [ ] Header + Footer funcionais
- [ ] MobileMenu (< md)
- [ ] Itens em `constants/navigation.ts` preenchidos
- [ ] Layout responsivo mobile-first

**Pacote:** `apps/web/components/layout/`

---

## Sprint 04 — Home

**Escopo:** Página inicial — hero, destaques, eventos, parceiros, CTA.  
**Feature:** `features/home/`

---

## Sprint 05 — Eventos

**Escopo:** Listagem, detalhe, inscrição, filtros.  
**Feature:** `features/events/` · **API:** [api/events.md](./api/events.md)

---

## Sprint 06 — Parceiros

**Escopo:** Listagem e detalhe de parceiros.  
**Feature:** `features/partners/` · **API:** [api/partners.md](./api/partners.md)

---

## Sprint 07 — Cupons

**Escopo:** Listagem, resgate, validação.  
**Feature:** `features/coupons/` · **API:** [api/coupons.md](./api/coupons.md)

---

## Sprint 08 — Concierge

**Escopo:** Atendimento personalizado, formulário de contato.  
**Feature:** `features/concierge/`

---

## Sprint 09 — Comunidade

**Escopo:** Feed, grupos, rankings.  
**Feature:** `features/community/` · **API:** [api/community.md](./api/community.md)

---

## Sprint 10 — Blog

**Escopo:** Listagem, artigo, categorias, SEO.  
**Feature:** `features/blog/` · **API:** [api/blog.md](./api/blog.md)

---

## Sprint 11 — Login

**Escopo:** Auth, sessão, perfil.  
**Features:** `features/auth/`, `features/profile/` · **API:** [api/auth.md](./api/auth.md)

---

## Sprint 12 — Painel Administrativo

**Escopo:** Dashboard, CRUD, gestão de usuários.  
**App:** `apps/admin/` (futuro) ou rotas `/admin` em `apps/web`

---

## Sprint 13 — Testes

**Escopo:** Unitários, integração, E2E (Playwright).  
**Referência:** [engineering/07-testing.md](./engineering/07-testing.md) · **Pasta:** `tests/`

---

## Sprint 14 — Deploy

**Escopo:** CI/CD, staging, production, Docker.  
**Referência:** [engineering/10-release-process.md](./engineering/10-release-process.md)

---

## Sprint 15 — MVP

**Escopo:** Revisão final, performance, acessibilidade, release v1.0.0.  
**Meta:** Plataforma Corredora DF em produção.

---

## Visão geral

| Sprint | Nome | Status | Pacote / Feature |
|---|---|---|---|
| 01 | Fundação | ✅ | monorepo, docs, arquitetura |
| 02 | Butterfly UI | 🔜 | `packages/ui/` |
| 03 | Layout | — | `components/layout/` |
| 04 | Home | — | `features/home/` |
| 05 | Eventos | — | `features/events/` |
| 06 | Parceiros | — | `features/partners/` |
| 07 | Cupons | — | `features/coupons/` |
| 08 | Concierge | — | `features/concierge/` |
| 09 | Comunidade | — | `features/community/` |
| 10 | Blog | — | `features/blog/` |
| 11 | Login | — | `features/auth/` |
| 12 | Admin | — | painel administrativo |
| 13 | Testes | — | `tests/` |
| 14 | Deploy | — | CI/CD |
| 15 | MVP | — | release v1.0.0 |

---

> Cada sprint concluída gera entrada no [devlog](./devlog/).
