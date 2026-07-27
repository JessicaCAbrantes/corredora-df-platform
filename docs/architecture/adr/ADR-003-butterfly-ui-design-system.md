# ADR-003: Butterfly UI Design System

## Status

Aceito — 2026-07-13

## Contexto

A marca Corredora DF (“Butterfly”) precisa de UI consistente na Home, jornadas e admin. Hoje já existe `packages/ui` (`@corredora/ui`) com tokens, temas e componentes (Button, Navbar, Hero, layout primitives).

## Problema

Como garantir consistência visual e velocidade de entrega de telas sem acoplar o design system ao App Router nem duplicar Button/Card em cada feature?

## Alternativas

| Alternativa | Prós | Contras |
|---|---|---|
| **A. Só Tailwind ad hoc no app** | Velocidade inicial | Inconsistência; sem contrato de componente |
| **B. Biblioteca externa (MUI/Chakra)** | Rápido | Identidade fraca; override constante |
| **C. Design system próprio (`@corredora/ui`)** | Marca; controle; reuse | Custo de manutenção |
| **D. Copiar componentes em cada app** | Isolamento | Drift garantido |

## Decisão

Adotar **Butterfly UI** como design system oficial em `packages/ui`:

1. **Tokens** tipados (`colors`, `spacing`, `typography`…) + themes light/dark.
2. **Componentes** com estrutura `Component.tsx` + `.types.ts` + `.styles.ts` + README.
3. **Sem Tailwind dentro do pacote** — classes BEM `butterfly-*`; o app integra tokens via CSS/Tailwind.
4. **peerDependency React 19**.
5. **Playground** em `apps/web` (`/playground`) para desenvolvimento visual.
6. Features consomem Butterfly; `apps/web/components/ui` só para átomos ainda não promovidos ao package.

## Consequências

**Positivas**

- Uma linguagem visual; PRs de UI revisáveis
- Features focam em domínio, não em CSS one-off
- Possível reuso em futuro `apps/admin`

**Negativas**

- Dualidade temporária `components/ui` ↔ `@corredora/ui` até consolidar
- Exige goverança (quando promover um átomo)

**Neutras**

- Identidade “borboleta” vira obrigação de produto + engenharia

## Próximos passos

- [ ] Completar tokens/temas (Sprint 02)
- [ ] Publicar exports estáveis no `package.json` do UI
- [ ] Migrar átomos restantes de `apps/web/components/ui` → package
- [ ] Critérios a11y no README de cada componente (ligado a ADR-009)
