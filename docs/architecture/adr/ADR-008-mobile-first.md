# ADR-008: Mobile First

## Status

Aceito — 2026-07-13

## Contexto

Personas de corredores consultam eventos, kits e cupons principalmente no celular (deslocamento, filas de retirada, redes sociais). UX docs e Product Vision já afirmam mobile-first. Home IA define carrosséis &lt; md e Navbar drawer.

## Problema

Como definir o padrão de responsividade e prioridade de UX para não tratar mobile como “adaptação tardia” de um layout desktop?

## Alternativas

| Alternativa | Prós | Contras |
|---|---|---|
| **A. Desktop first + media queries down** | Fácil para dashboards | Mobile vira remendo; CSS maior |
| **B. Mobile first (progressive enhancement)** | Alinha ao uso real; CSS cresce para cima | Exige disciplina de breakpoints |
| **C. Apps nativos separados** | UX nativa | Custo MVP injustificável |
| **D. Só PWA sem responsividade web** | — | Não cobre SEO/web pública bem |

## Decisão

Adotar **Mobile First** como padrão de UX e CSS:

1. Projetar e implementar **primeiro o viewport estreito**, depois `md` / `lg`.
2. Breakpoints alinhados ao Tailwind/tokens do design system.
3. **Navbar:** drawer &lt; `md`; horizontal ≥ `md` (ADR-003 / layout Sprint 03).
4. Grids de cards: 1 coluna → 2–3; carrossel horizontal permitido em listagens densas no mobile.
5. CTAs de conversão (inscrição) com área de toque adequada; evitar hover-only.
6. **Admin** pode ser desktop-first (exceção documentada) — operadores usam desktop; superfícies públicas não.
7. Performance mobile é requisito (LCP, imagens, JS) — ver ADR-009 (a11y) e performance handbook.

## Consequências

**Positivas**

- Jornadas J1–J5 usáveis no contexto real
- Menos regressões “quebrou no iPhone”
- Coerência com Product Vision / UX README

**Negativas**

- Wireframes desktop não são a fonte da verdade
- Componentes complexos (tabelas admin) precisam padrões próprios

**Neutras**

- Não implica app store no MVP

## Próximos passos

- [ ] Checklist mobile no DoD de stories públicas
- [ ] Testes manuais em 360–430px nas PRs de UI
- [ ] Definir tokens de breakpoint canônicos no Butterfly UI
