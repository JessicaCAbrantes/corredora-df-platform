# EventDetailsPage — Arquitetura da Página de Detalhes da Corrida

**S03-007** · Arquitetura consolidada no Sprint Planning (evolui [S03-006](#histórico)).

| Campo | Valor |
|---|---|
| **Status** | Aprovado para orientar implementação |
| **Sprint** | Sprint 03 |
| **Feature prevista** | `apps/web/features/events/` |
| **Rota prevista** | `/corridas/{slug}` |
| **Entrada principal** | Clique em `EventCard` (Home, listagem, busca, link externo) |
| **Documento de arquitetura** | [architecture/event-details-page.md](../architecture/event-details-page.md) |
| **Última atualização** | 2026-07-19 |

> **Escopo:** decisões de produto e hierarquia da experiência.  
> Implementação React, rotas e APIs são **consequência** deste documento — não o ponto de partida.
>
> **Observação:** Caso alguma implementação futura entre em conflito com esta arquitetura, priorizar a revisão da decisão arquitetural antes de adaptar os componentes. A arquitetura deve orientar o código, e não o contrário.

Alinhado a: [user-journeys.md](./user-journeys.md) (Jornada 1), [home-information-architecture.md](./home-information-architecture.md), [ADR-001 Feature First](../architecture/adr/ADR-001-arquitetura-feature-first.md).

---

## 1. Objetivo da página

A `EventDetailsPage` existe para ajudar o corredor a **decidir participar de uma prova**.

O `EventCard` responde: *“existe uma corrida interessante?”*  
Esta página responde: *“esta é a corrida certa para mim — e posso me inscrever agora?”*

### Organização por jornada de decisão

A página **não** se organiza apenas por agrupamento visual de componentes.  
Cada bloco responde a uma **pergunta natural** do corredor. A ordem dos blocos é a ordem dessas perguntas.

```text
Que corrida é esta?
        ↓
Quanto custa?  ·  Posso me inscrever?
        ↓
O kit vale a pena?  ·  Como será a prova?
        ↓
Como me organizar?  ·  Quais são as regras?
```

---

## 2. Princípios arquiteturais

| Princípio | Significado nesta página |
|---|---|
| **Progressive Disclosure** | Só aprofundar (kit, percurso, regulamento) depois que a identidade e a decisão de inscrição estão claras |
| **Design for Decisions** | Cada seção existe para destravar uma decisão, não para “preencher a página” |
| **Components Have Responsibilities** | Um componente = uma responsabilidade = uma pergunta do usuário |
| **First Screen Drives the Decision** | Hero + Seção 01 devem bastar para a maioria decidir se continua ou abandona |
| **Different Users, Different Journeys** | Quem já decidiu pode ir direto ao CTA; quem aprofunda encontra Seções 02–03 sem poluir a primeira tela |

---

## 3. Hierarquia da página

Ordem canônica (independente de layout mobile/desktop):

```text
Navbar (global)
      ↓
EventHero
      ↓
Section 01 — Decisão
  · PricingSection
  · EventCTA
      ↓
Section 02 — Confirmação
  · EventKit
  · EventRoute
      ↓
Section 03 — Informações de apoio
  · EventSchedule
  · EventRegulation
      ↓
Footer (global)
```

### 3.1 EventHero

| Campo | Valor |
|---|---|
| **Pergunta** | *Que corrida é esta?* |
| **Responsabilidade** | Identificar a prova e o fit básico de agenda/nível/local |
| **Informações** | Nome · Data · Horário · Distância · Local |
| **Complementos** | Imagem / placeholder · status de inscrição (quando fizer parte da identidade) |

**Por que nesta posição:** é a primeira tela da decisão. Sem confirmar *qual* prova e *quando/onde/qual distância*, preço e CTA são prematuros.

**Relação com os demais:** alimenta o contexto mental do usuário antes da Seção 01. Não inclui preço nem CTA — esses pertencem à decisão de participação.

---

### 3.2 Section 01 — Decisão

| Campo | Valor |
|---|---|
| **Perguntas** | *Quanto custa?* · *Posso me inscrever?* |
| **Componentes** | `PricingSection` · `EventCTA` |
| **Objetivo** | Fechar (ou adiar) a decisão de participação |

**Observações de produto:**

- Preço e CTA fazem parte da **mesma decisão**. Devem permanecer **próximos** na hierarquia.
- O layout pode variar (empilhados no mobile; rail sticky no desktop), mas a **relação semântica** entre eles permanece.
- Estados do CTA (abertas / em breve / encerradas / já inscrito) não mudam a posição da seção — só o significado da ação.

**Por que após o Hero:** o usuário só avalia custo e inscrição depois de saber se a prova cabe na vida dele.

---

### 3.3 Section 02 — Confirmação

| Campo | Valor |
|---|---|
| **Perguntas** | *O kit vale a pena?* · *Como será a prova?* |
| **Componentes** | `EventKit` · `EventRoute` |
| **Objetivo** | Reforçar a decisão após o interesse inicial |

**Por que nesta posição:** confirma o valor percebido e a expectativa da experiência **depois** que preço/CTA já estão visíveis. Quem precisa só se inscrever não é forçado a ler kit/percurso antes do CTA.

---

### 3.4 Section 03 — Informações de apoio

| Campo | Valor |
|---|---|
| **Perguntas** | *Como me organizar?* · *Quais são as regras da prova?* |
| **Componentes** | `EventSchedule` · `EventRegulation` |
| **Objetivo** | Conteúdo complementar para quem aprofunda a consulta |

**Por que por último (Progressive Disclosure):** cronograma detalhado e regulamento são consultados sob demanda. Colocá-los no topo aumenta abandono e atrasa a conversão.

---

## 4. Mapa pergunta → componente → responsabilidade

| Pergunta do corredor | Bloco | Componente | Responsabilidade única |
|---|---|---|---|
| Que corrida é esta? | Hero | `EventHero` | Identidade + metadados de fit (nome, data, horário, distância, local) |
| Quanto custa? | Seção 01 | `PricingSection` | Exibir valor / gratuito / indicação de cupom |
| Posso me inscrever? | Seção 01 | `EventCTA` | Ação e estados de inscrição |
| O kit vale a pena? | Seção 02 | `EventKit` | O que está incluso no kit |
| Como será a prova? | Seção 02 | `EventRoute` | Percurso / natureza do trajeto |
| Como me organizar? | Seção 03 | `EventSchedule` | Cronograma / organização pré-prova |
| Quais são as regras? | Seção 03 | `EventRegulation` | Regulamento (resumo + acesso ao completo) |

Qualquer desenvolvedor deve conseguir responder, para cada peça: **por que existe**, **qual pergunta responde**, **o que não é responsabilidade dela**, e **por que vem nesta ordem**.

---

## 5. Wireframe textual

```text
┌─────────────────────────────────────────────┐
│  Header / Navbar                            │
└─────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│  EventHero                                  │
│  “Que corrida é esta?”                      │
│  · Nome                                     │
│  · Data · Horário · Distância · Local       │
│  · Mídia / status                           │
└─────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│  Section 01 — Decisão                       │
│  “Quanto custa? / Posso me inscrever?”      │
│  · PricingSection                           │
│  · EventCTA                                 │
└─────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│  Section 02 — Confirmação                   │
│  “O kit vale a pena? / Como será a prova?”  │
│  · EventKit                                 │
│  · EventRoute                               │
└─────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│  Section 03 — Informações de apoio          │
│  “Como me organizar? / Quais as regras?”    │
│  · EventSchedule                            │
│  · EventRegulation                          │
└─────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│  Footer                                     │
└─────────────────────────────────────────────┘
```

---

## 6. Responsabilidades (visão de produto → implementação)

Detalhamento técnico em [architecture/event-details-page.md](../architecture/event-details-page.md).

| Camada | Responsabilidade |
|---|---|
| **`EventDetailsPage`** | Receber dados, traduzir para o domínio da UI, distribuir props mínimas, **orquestrar a ordem da experiência** |
| **Componentes** | Uma pergunta cada; props mínimas; sem conhecer o payload completo da API |
| **`Container` / `Section`** | Apenas organização visual; não definem a jornada |

A página **não** concentra lógica de apresentação (estilos, markup detalhado de preço, etc.).

---

## 7. Responsividade

A **relação entre componentes** permanece a mesma em qualquer breakpoint. Muda só o arranjo visual.

| Viewport | Comportamento |
|---|---|
| **Mobile** | Coluna única na ordem canônica; `PricingSection` + `EventCTA` empilhados e próximos; CTA sticky inferior opcional |
| **Desktop** | Mesma ordem lógica; Seção 01 pode usar rail sticky (preço + CTA laterais) enquanto Seções 02–03 rolam |
| **Invariant** | Hero → Decisão → Confirmação → Apoio — nunca reordenar por conveniência de layout |

---

## 8. Acessibilidade (requisitos gerais)

| Área | Requisito |
|---|---|
| Headings | Um `h1` (nome da corrida); seções com hierarquia clara |
| Status / CTA | Não só por cor; estados anunciáveis |
| Imagens | `alt` descritivo / placeholder acessível |
| Teclado e foco | CTA, links de regulamento e expansões operáveis |
| Contraste | Texto legível sobre mídia do Hero |

Detalhes de engenharia: [ADR-009](../architecture/adr/ADR-009-acessibilidade.md).

---

## 9. Integrações futuras

| Integração | Papel |
|---|---|
| API de eventos | Dados do Hero, kit, percurso, cronograma, regulamento |
| API de preços / lotes | `PricingSection` |
| API de inscrição + auth | `EventCTA` e estados |
| Analytics | Funil view → CTA → inscrição |

A página orquestra; os componentes **não** buscam a API diretamente no desenho alvo Feature First.

---

## 10. Relação com o que já existe

| Existente | Relação |
|---|---|
| `EventCard` | Entrada; teaser da decisão que esta página completa |
| `Hero` (Home) | Hero de marca — distinto do `EventHero` de prova |
| `Section` / `Container` / `Grid` / `Button` | Primitivos Butterfly para layout e CTA |

---

## Histórico

| Versão | Mudança |
|---|---|
| **S03-006** | Primeira IA: camadas de informação, wireframe amplo (parceiros, galeria, etc.) |
| **S03-007** | Consolidação Sprint Planning: hierarquia por **perguntas do corredor**; Hero absorve metadados de fit; Seções Decisão / Confirmação / Apoio; componentes oficiais `PricingSection`, `EventRoute`, `EventSchedule` |

Itens do S03-006 não listados na hierarquia canônica (parceiros da prova, galeria, FAQ genérico) ficam **fora do núcleo MVP** desta página até nova decisão de produto — não devem quebrar a ordem Hero → 01 → 02 → 03.

---

## Referências

- [architecture/event-details-page.md](../architecture/event-details-page.md) — responsabilidades técnicas
- [user-journeys.md](./user-journeys.md) — Jornada 1
- [home-information-architecture.md](./home-information-architecture.md) — entrada via Home
- [ADR-001](../architecture/adr/ADR-001-arquitetura-feature-first.md) — Feature First
