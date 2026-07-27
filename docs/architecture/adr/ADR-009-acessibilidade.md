# ADR-009: Acessibilidade

## Status

Aceito — 2026-07-13

## Contexto

A missão inclui corrida acessível a “todos os corpos e ritmos”. Valores de produto listam acessibilidade. Existe guia [05-accessibility.md](../../engineering/05-accessibility.md) e metas WCAG 2.1 AA no handbook/DoD.

## Problema

Como tornar acessibilidade um **requisito de arquitetura e entrega**, não um polish opcional após o MVP?

## Alternativas

| Alternativa | Prós | Contras |
|---|---|---|
| **A. A11y “depois do launch”** | Velocidade falsa | Débito caro; exclusão; risco legal/reputação |
| **B. WCAG 2.1 AA como gate de DoD** | Padrão claro; testável | Exige disciplina e tooling |
| **C. Certificação formal imediata** | Evidência externa | Custo alto cedo demais |
| **D. Só lint automático (eslint-plugin-jsx-a11y)** | Barato | Não cobre contraste real, foco, fluxos |

## Decisão

Adotar **acessibilidade WCAG 2.1 nível AA** como requisito oficial de engenharia:

1. **HTML semântico** e landmarks (`header`, `nav`, `main`, `footer`, `section`).
2. **Um `h1` por página** (Hero na Home; páginas de feature idem).
3. Controles nativos (`button`, `a`, `input`) focáveis por teclado; foco visível.
4. Imagens informativas com `alt`; decorativas com `aria-hidden`.
5. Contraste via tokens Butterfly (overlay no Hero).
6. Formulários com `<label>` / `aria-describedby` para erros.
7. **DoD / PR checklist** incluem a11y (handbook + review checklist).
8. Tooling: `eslint-plugin-jsx-a11y` (quando habilitado) + testes por role no Testing Library + amostragem manual por teclado.
9. Fluxos autenticados e admin também entram no escopo AA (não só marketing).

Exceções temporárias devem ser registradas na story e pagas em sprint seguinte — não silenciadas.

## Consequências

**Positivas**

- Inclusão alinhada à marca
- Melhor SEO semântico e qualidade geral
- Menos retrabalho pós-audit Sprint 15

**Negativas**

- Algumas UIs “bonitas” precisam redesenho (hover-only, ícones sem nome)
- Tempo de review um pouco maior

**Neutras**

- Certificação externa continua Could pós-MVP

## Próximos passos

- [ ] Habilitar lint a11y no `apps/web`
- [ ] Critérios a11y nos READMEs dos componentes Butterfly
- [ ] Auditoria Lighthouse/axe na Sprint 15 (MVP)
- [ ] Trecho a11y no template de PR
