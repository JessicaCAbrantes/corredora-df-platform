# Definition of Ready & Definition of Done

**PB-035** · Critérios oficiais de entrada e saída das User Stories da Plataforma Corredora DF.

| Campo | Valor |
|---|---|
| **Status** | Aprovado |
| **Versão** | 1.0 |
| **Última atualização** | 2026-07-13 |
| **Audiência** | PO, engenharia, UX, QA, DevOps |
| **Uso** | Obrigatório em **todas** as Sprints a partir da Sprint 02 |

---

## 1. Decisões

| Decisão | Motivo |
|---|---|
| **DoR e DoD separados** | Entrada (planning) ≠ saída (entrega); evita começar story incompleta e “quase pronta” |
| **Unidade = User Story** | Alinha a [user-stories.md](../product/user-stories.md); Features fecham quando o conjunto de stories estiver Done |
| **Checklists binários** | Sim/não em planning e review — sem “meio pronto” |
| **Mock permitido no Ready** | API gaps não bloqueiam Ready se mock + contrato estiverem explícitos |
| **A11y + mobile no DoD** | ADRs [008](../architecture/adr/ADR-008-mobile-first.md) e [009](../architecture/adr/ADR-009-acessibilidade.md) — requisitos, não polish |
| **Deploy contextual** | DoD de story exige merge na branch de integração; deploy staging/prod segue pipeline da Sprint (não toda story vai a produção) |
| **Fonte única** | Este documento sobrepõe trechos resumidos no handbook / catálogo; aqueles passam a apontar para cá |

### Relacionados

- [user-stories.md](../product/user-stories.md) — IDs e Gherkin  
- [engineering-handbook.md](./engineering-handbook.md) — práticas  
- [09-review-checklist.md](./09-review-checklist.md) — review  
- [07-testing.md](./07-testing.md) — pirâmide  
- [10-release-process.md](./10-release-process.md) — release  

---

## 2. Fluxo oficial da Story

```text
 Backlog
    │  PO prioriza (backlog / MoSCoW)
    ▼
 Ready          ← Definition of Ready atendida
    │  Pull no Sprint Planning
    ▼
 Sprint
    │  Story no Sprint Backlog
    ▼
 Development
    │  Branch feat|fix/* · implementação
    ▼
 Review
    │  PR · code review · CI verde
    ▼
 Testing
    │  Critérios Gherkin · testes da story
    ▼
 Done           ← Definition of Done atendida
```

| Estágio | Dono principal | Gate |
|---|---|---|
| Backlog | PO | Existe no catálogo / board com ID |
| Ready | PO + Eng + UX | **DoR** |
| Sprint | Time | Capacidade + dependências ok |
| Development | Dev | Handbook / ADRs |
| Review | Reviewer | Checklist + CI |
| Testing | Dev + QA | Gherkin + testes listados |
| Done | Time | **DoD** + merge |

**Decisão:** “Testing” pode ser o próprio autor com peer review, desde que os critérios Gherkin sejam validados antes do Done — QA dedicado é Should conforme ritmo do time.

---

## 3. Definition of Ready (DoR)

### 3.1 Objetivo

Garantir que uma User Story possa ser **puxada para a Sprint** sem ambiguidade bloqueadora. Se não está Ready, **não entra no Sprint** (ou entra só como Spike explícito com tempo-box).

### 3.2 Critérios obrigatórios

Uma story só é **Ready** se **todos** forem verdadeiros:

1. **Identidade** — ID estável (`US-…`), Epic, Feature e título claros.
2. **Valor** — História no formato *Como… quero… para…* compreensível.
3. **Aceite testável** — Critérios em **Given / When / Then** (ao menos o happy path; negativos críticos listados).
4. **Prioridade e tamanho** — MoSCoW + Story Points (Fibonacci) acordados no refining/planning.
5. **Dependências conhecidas** — Listadas; blockers externos têm plano (mock, spike, ou reorder).
6. **UX mínima** — Comportamento mobile/desktop descrito ou link a wireframe/IA/spec; estados vazios/erro/loading mencionados quando aplicável.
7. **Tech mínima** — Rotas, APIs/contratos (ou mock), pasta/feature alvo e restrições (RSC, auth) apontados — tipicamente via [feature-specifications.md](../product/feature-specifications.md).
8. **Analytics** — Eventos a disparar listados **ou** marcado N/A com motivo.
9. **Testes previstos** — Unit / integração / E2E esperados descritos.
10. **Independente o bastante** — Entrega valor sozinha ou o lote inseparável está explícito no planning.

### 3.3 Checklist DoR (planning)

Copiar para o card/PR de refining:

- [ ] ID `US-*` no [catálogo](../product/user-stories.md) ou board espelhado
- [ ] Epic + Feature preenchidos
- [ ] História *Como / quero / para*
- [ ] Gherkin happy path escrito
- [ ] Gherkin de erro/unauthorized/empty (se a story toca isso)
- [ ] Prioridade MoSCoW
- [ ] SP estimados pelo time
- [ ] Dependências listadas (stories, APIs, ADRs)
- [ ] Se API incompleta: **mock aceito** + referência ao gap
- [ ] UX: mobile-first / a11y notes ou link de design
- [ ] Tech: feature path + contratos
- [ ] Analytics ou N/A
- [ ] Testes previstos listados
- [ ] Nenhum “TBD” bloqueante sem Spike associado

### 3.4 Exemplos DoR

#### Exemplo A — Ready (bom)

**US-EVT-02 — Detalhe do evento**

- História e Gherkin (slug válido / 404) no catálogo  
- Depende de US-EVT-01; API `GET /events/:id` documentada  
- UX: CTA inscrição conforme status; mobile sticky Should fora desta story  
- Testes: E2E detalhe + 404  
- Analytics: `view_event_detail`  
→ **Pode entrar no Sprint 05**

#### Exemplo B — Não Ready (ruim)

“Melhorar a Home”

- Sem ID, sem Gherkin, sem SP  
- “Deixar mais bonito” não é testável  
- Dependência de “design final” indefinida  
→ **Volta ao Backlog / refining** — fatiar em US-HOME-01…05

#### Exemplo C — Ready com mock

**US-KIT-01** com gap `/users/me/registrations`

- Gherkin cobre anônimo / autenticado / empty  
- Tech: “service com mock até gap fechar; contrato previsto no backlog”  
→ **Ready** — API real não é pré-requisito se o aceite do mock estiver no Gherkin ou nota da story

#### Exemplo D — Spike (não é story de produto Done)

**SPIKE-API-featured (4h)** — explorar query `featured`

- Objetivo de aprendizado; saída = decisão + update no contrato  
- Não usa DoD de feature completa; saída = ADR curto ou seção no `events.md`

---

## 4. Definition of Done (DoD)

### 4.1 Objetivo

Garantir que “pronto” signifique **entregável, verificável e integrado**, não “funciona na minha máquina”.

### 4.2 Critérios obrigatórios

Uma story só é **Done** se **todos** forem verdadeiros:

1. **Aceite** — Todos os Given/When/Then da story passam (happy path + cenários listados).
2. **Código no lugar certo** — Feature First, services para I/O, sem violação de boundaries ([ADR-001](../architecture/adr/ADR-001-arquitetura-feature-first.md)).
3. **Qualidade estática** — Lint + typecheck + build da área afetada passam.
4. **Testes** — Testes previstos na story executados e passando (ver §4.4).
5. **Review** — PR aprovado (≥1 reviewer) com checklist relevante ([09](./09-review-checklist.md)).
6. **CI** — Pipeline do PR verde (quando existir; ADR-010).
7. **Merge** — Squash/merge na branch de integração (`develop`), sem --no-verify.
8. **UX acordada** — Mobile-first na superfície pública; estados de UI tratados.
9. **A11y mínimo** — Semântica, foco, labels, um h1/página, `alt` onde couber (ADR-009).
10. **Analytics** — Eventos da story disparando **ou** N/A honrado.
11. **Documentação** — Atualizações exigidas pelo impacto (§4.5).
12. **Board** — Status da story = Done; bloqueios removidos.

### 4.3 Checklist DoD (fechamento)

- [ ] Gherkin validado (manual e/ou E2E)
- [ ] Edge cases da story cobertos
- [ ] `pnpm --filter web lint` (ou escopo acordado) OK
- [ ] `pnpm --filter web build` OK (ou pacote afetado)
- [ ] Testes da story OK
- [ ] PR aprovado + CI verde
- [ ] Merge em `develop`
- [ ] Sem `console.log` / secrets / arquivos gerados
- [ ] Mobile verificado (superfície pública)
- [ ] A11y smoke (teclado + roles principais)
- [ ] Analytics / N/A
- [ ] Docs atualizados se necessário
- [ ] Card movido para Done

### 4.4 Qualidade

| Área | Expectativa no DoD |
|---|---|
| TypeScript | Sem `any` injustificado |
| Arquitetura | Rotas finas; sem fetch solto na UI |
| Butterfly / UI | Reusa DS; sem CSS one-off evitável |
| Performance | Sem regressão gritante; `next/image` em imagens novas |
| Segurança | Sem secrets; inputs validados; RBAC na API se mutação protegida |
| Commits | Conventional Commits |

### 4.5 Testes

| Tipo | Quando é DoD |
|---|---|
| **Unit / componente** | Lógica ou UI interativa nova |
| **Integração (service)** | Novo endpoint/mock mapeado |
| **E2E** | Se a story listou E2E (jornadas J1–J5) — deve passar ou ter waiver escrito no PR por falta de ambiente |
| **Regressão** | Suíte existente verde no CI |

**Decisão:** ausência de E2E no MVP inicial não bloqueia DoD **se** a story não exigiu E2E e o Gherkin foi validado manualmente no Test plan do PR. A partir de US-FND-03 / pipeline E2E, stories de jornada Must devem automatizar o path crítico.

### 4.6 Documentação

Atualizar o que o impacto exigir (marcar N/A no PR se zero):

- [ ] README da feature/componente novo
- [ ] Contrato `docs/api/*` se o shape mudou
- [ ] Story/catálogo se o aceite mudou na implementação
- [ ] ADR se houve decisão estrutural
- [ ] Devlog na conclusão da Sprint (responsável da Sprint, não cada story)

### 4.7 Deploy

| Nível | Exigido no DoD da story? |
|---|---|
| Merge em `develop` | **Sim** |
| Preview de PR | Should (quando Actions/hosting existirem) |
| Deploy staging automático | Should no CD (ADR-010); não bloqueia Done da story isolada |
| Produção | **Não** por story — via release Sprint 14–15 / [release process](./10-release-process.md) |

**Decisão:** acoplar Done à produção quebraria o fluxo de entrega contínua na `develop`. “Done” = **integrado e verificável**; “Released” é gate de Sprint/MVP.

### 4.8 DoD em níveis (story vs feature vs sprint)

| Nível | Quando |
|---|---|
| **Story Done** | Este documento §4 |
| **Feature Done** | Todas as stories Must da Feature Done + checklist do [feature-catalog](../product/feature-catalog.md) §15 |
| **Sprint Done** | Meta da Sprint atendida; burndown/review; devlog; itens Done ou devolvidos ao backlog com motivo |

---

## 5. Anti-padrões (não fazer)

| Anti-padrão | Por quê proibir |
|---|---|
| Puxar story sem Gherkin | Retrabalho e “Não era isso” |
| Marcar Done sem PR/review | Qualidade não revisada |
| Done com build quebrado | Envenena `develop` |
| “Done excepto testes” | Dívida silenciosa |
| Expandir escopo no meio sem update DoR | Scope creep |
| Bloquear Ready por API 100% pronta | Mata paralelismo FE/BE — use mock |

---

## 6. Facilitação na Sprint

### Planning

1. Só entram stories **Ready** (checklist §3.3).  
2. Capacidade ≤ soma de SP Ready.  
3. Dependências ordenadas no board.

### Daily

- Bloqueio de DoR mal avaliado → spike ou devolver ao backlog.  
- Não renegociar aceite em silêncio — atualizar Gherkin com PO.

### Review / Demo

- Demo apenas stories **Done**.  
- Feedback vira novas stories (Backlog), não reabre Done sem bug ticket.

### Retro

- Medir: % stories puxadas sem DoR; % reabertas pós-Done; tempo em Review.  
- Ajustar este documento só via PR (versionar).

---

## 7. Resumo rápido (cartão de mesa)

**Ready?** ID · História · Gherkin · SP · Deps · UX · Tech · Testes · Analytics  

**Done?** Aceite · Lint/Build · Testes · Review/CI · Merge · Mobile/A11y · Docs · Board  

**Fluxo:** Backlog → Ready → Sprint → Dev → Review → Testing → Done

---

> Alterações a DoR/DoD exigem PR e comunicação no planning seguinte. Em conflito com hábitos locais do time, **prevalece este documento**.
