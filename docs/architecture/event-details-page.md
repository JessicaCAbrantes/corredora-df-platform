# EventDetailsPage — Arquitetura Frontend

**S03-007** · Espelho técnico da arquitetura consolidada no Sprint Planning.

| Campo | Valor |
|---|---|
| **Status** | Aprovado para orientar implementação |
| **Documento de produto** | [product/event-details-page.md](../product/event-details-page.md) |
| **Feature** | `apps/web/features/events/` |
| **Rota prevista** | `/corridas/{slug}` → composição fina em `app/` + `EventDetailsPage` |
| **Última atualização** | 2026-07-19 |

> A implementação deve ser **consequência** das decisões de produto.  
> Este documento define boundaries e responsabilidades — não o código.
>
> **Observação:** Caso alguma implementação futura entre em conflito com esta arquitetura, priorizar a revisão da decisão arquitetural antes de adaptar os componentes. A arquitetura deve orientar o código, e não o contrário.

---

## 1. Premissa

A `EventDetailsPage` organiza a UI pela **jornada de decisão do corredor**, não por um agrupamento visual arbitrário de widgets.

Cada componente:

1. responde a **uma pergunta** do usuário;
2. tem **uma responsabilidade**;
3. recebe **apenas** as props necessárias;
4. **não** conhece a estrutura completa da API.

Ordem e perguntas: ver [product/event-details-page.md](../product/event-details-page.md).

---

## 2. Hierarquia de composição

```text
app/corridas/[slug]/page.tsx          ← rota fina (App Router)
        │
        ▼
features/events/.../EventDetailsPage  ← orquestração
        │
        ├── EventHero
        ├── Section 01 — Decisão
        │     ├── PricingSection
        │     └── EventCTA
        ├── Section 02 — Confirmação
        │     ├── EventKit
        │     └── EventRoute
        └── Section 03 — Apoio
              ├── EventSchedule
              └── EventRegulation
```

`Container` e `Section` (Butterfly) envolvem blocos para ritmo visual. **Não** definem a jornada nem a ordem semântica.

---

## 3. Responsabilidades

### 3.1 `EventDetailsPage`

Responsável por:

| Responsabilidade | Detalhe |
|---|---|
| **Receber dados** | Via serviços da feature / Server Components (quando houver API) |
| **Traduzir domínio** | Mapear payload → view-models / props de UI |
| **Distribuir o mínimo** | Cada filho recebe só o que precisa |
| **Orquestrar a experiência** | Garantir a ordem Hero → Decisão → Confirmação → Apoio |

**Não deve:**

- concentrar markup/estilos detalhados de cada bloco;
- expor o JSON bruto da API aos filhos;
- reordenar seções por breakpoint (só o layout visual muda).

### 3.2 Componentes

| Componente | Pergunta | Responsabilidade | Não é responsabilidade |
|---|---|---|---|
| `EventHero` | Que corrida é esta? | Nome, data, horário, distância, local (+ mídia/status) | Preço, inscrição, regulamento |
| `PricingSection` | Quanto custa? | Valor / gratuito / cupom | Disparar inscrição |
| `EventCTA` | Posso me inscrever? | Ação e estados do CTA | Calcular preço |
| `EventKit` | O kit vale a pena? | Conteúdo do kit | Fluxo completo de retirada (feature kits) |
| `EventRoute` | Como será a prova? | Percurso / natureza do trajeto | Motor de mapa genérico da plataforma |
| `EventSchedule` | Como me organizar? | Cronograma / organização | Agenda global do usuário |
| `EventRegulation` | Quais são as regras? | Resumo + acesso ao regulamento | Editor de documentos legais |

**Regra:** componentes **não** conhecem a estrutura completa da API. Contratos tipados na feature (`types/`) + mapeamento na página (ou adapter no `services/`).

### 3.3 Layout (`Container`, `Section`, `Grid`)

- Organização visual, espaçamento, largura.
- Relação **PricingSection ↔ EventCTA** permanece próxima em todos os breakpoints (empilhados ou rail), porque pertencem à mesma decisão.

---

## 4. Fluxo de dados (alvo)

```text
API / mock
    │
    ▼
features/events/services/     ← fetch + erros
    │
    ▼
EventDetailsPage              ← mapToViewModel / select props
    │
    ├──► EventHero(propsHero)
    ├──► PricingSection(propsPrice)
    ├──► EventCTA(propsCta)
    ├──► EventKit(propsKit)
    ├──► EventRoute(propsRoute)
    ├──► EventSchedule(propsSchedule)
    └──► EventRegulation(propsRegulation)
```

Alinhado a [ADR-001 Feature First](./adr/ADR-001-arquitetura-feature-first.md): rota fina, lógica na feature, UI reutilizável em `@corredora/ui` quando for primitivo de design system.

---

## 5. Princípios (checklist de review)

Antes de mergear a implementação, validar:

- [ ] A ordem na árvore React reflete Hero → Seção 01 → 02 → 03
- [ ] Nenhum componente filho importa o tipo “Event API root” completo sem necessidade
- [ ] `PricingSection` e `EventCTA` permanecem semanticamente acoplados (mesma seção de decisão)
- [ ] `Container`/`Section` não introduzem nova hierarquia de negócio
- [ ] Mudanças de layout mobile/desktop não alteram a ordem das perguntas

Princípios de produto: Progressive Disclosure · Design for Decisions · Components Have Responsibilities · First Screen Drives the Decision · Different Users, Different Journeys — ver documento de produto.

---

## 6. Fora de escopo deste documento

- Implementação dos componentes
- Contratos OpenAPI detalhados
- Checkout de inscrição completo

---

## Referências

- [product/event-details-page.md](../product/event-details-page.md)
- [ADR-001](./adr/ADR-001-arquitetura-feature-first.md)
- [ADR-004 Next.js App Router](./adr/ADR-004-nextjs-app-router.md)
- [engineering/04-component-pattern.md](../engineering/04-component-pattern.md)
