# Product Vision — Plataforma Corredora DF

**PB-027** · Documento oficial de visão do produto.

| Campo | Valor |
|---|---|
| **Status** | Aprovado |
| **Versão** | 1.0 |
| **Última atualização** | 2026-07-13 |
| **Audiência** | Produto, engenharia, design, negócios e stakeholders |

---

## 1. Missão

**Conectar corredores, eventos e parceiros no Distrito Federal em uma única plataforma digital — da descoberta da corrida à celebração na linha de chegada.**

A Corredora DF existe para eliminar a fragmentação que hoje obriga o corredor a buscar informações em sites distintos, grupos de mensagem e redes sociais. Centralizamos descoberta, inscrição, benefícios, retirada de kits e comunidade com experiência moderna, acessível e pensada para o celular.

---

## 2. Visão

**Ser a plataforma de referência para o ecossistema de corrida no Distrito Federal até 2028** — onde todo corredor encontra seu próximo evento, todo organizador gerencia sua corrida e todo parceiro alcança seu público com relevância.

Em termos de produto, isso significa:

- **Para corredores:** um hub confiável que acompanha toda a jornada — inspirar, inscrever, preparar, participar e compartilhar.
- **Para organizadores:** ferramentas simples para divulgar eventos, gerenciar inscrições e comunicar participantes.
- **Para parceiros:** visibilidade qualificada e mecanismos mensuráveis de conversão (cupons, destaques, conteúdo).
- **Para a região:** fortalecer o calendário esportivo do DF e a identidade da comunidade local de corrida.

A identidade visual **Butterfly** (borboleta) simboliza transformação pessoal — cada corredor, independente do nível, passa por uma jornada de evolução que a plataforma apoia.

---

## 3. Valores

| Valor | O que significa no produto |
|---|---|
| **Acessibilidade** | WCAG 2.1 AA, mobile-first, linguagem clara — corrida é para todos os corpos e ritmos |
| **Confiança** | Informações de eventos verificadas, transparência em inscrições e benefícios, comunicação honesta |
| **Comunidade** | A plataforma cresce quando corredores se conectam; engajamento genuíno acima de métricas vazias |
| **Simplicidade** | Menos cliques até o objetivo; interfaces limpas; complexidade técnica invisível ao usuário |
| **Regionalidade** | Foco no DF como diferencial — calendário local, parceiros locais, conteúdo relevante ao contexto brasiliense |
| **Excelência técnica** | Performance, segurança e manutenibilidade como requisitos de produto, não apenas de engenharia |

---

## 4. Objetivos

### 4.1 Curto prazo (0–6 meses · Sprints 01–15)

Lançar o **MVP funcional** com os módulos essenciais do ecossistema:

| Objetivo | Indicador de conclusão |
|---|---|
| Fundação técnica sólida | Monorepo, design system, contratos de API, arquitetura frontend |
| Experiência visual coesa | Butterfly UI com tokens, temas e componentes base |
| Jornada de descoberta | Home, listagem e detalhe de eventos, parceiros e blog públicos |
| Engajamento inicial | Cupons, comunidade e concierge disponíveis |
| Conta de usuário | Autenticação, perfil e painel administrativo |
| Produção | Deploy, testes e release v1.0.0 |

**Meta de produto:** um corredor consegue descobrir uma corrida, criar conta, inscrever-se e acessar benefícios sem sair da plataforma.

### 4.2 Médio prazo (6–18 meses · pós-MVP)

Evoluir de vitrine digital para **plataforma operacional** do ecossistema:

| Objetivo | Descrição |
|---|---|
| Onboarding de organizadores | Fluxo self-service para publicar e gerenciar eventos |
| Personalização | Recomendações de eventos, notificações contextuais, home adaptada ao perfil |
| Ecossistema de parceiros | Dashboard de parceiro, campanhas, métricas de cupons e anúncios |
| Comunidade ativa | Grupos por distância/região, rankings, moderação escalável |
| Expansão de conteúdo | Blog editorial regular, SEO orgânico, newsletter automatizada |
| Dados e insights | Métricas para organizadores (inscrições, perfil de participantes) |

**Meta de produto:** organizadores e parceiros adotam a plataforma como canal primário, não secundário.

### 4.3 Longo prazo (18–36 meses)

Consolidar a **liderança regional** e explorar novas frentes de valor:

| Objetivo | Descrição |
|---|---|
| Referência no Centro-Oeste | Expansão para entorno do DF e parcerias interestaduais |
| Marketplace de experiências | Concierge ampliado: viagens, hospedagem, assessoria esportiva |
| Integrações | Wearables, Strava, pagamentos, certificados digitais |
| Inteligência | Recomendações preditivas, previsão de demanda para organizadores |
| Sustentabilidade do modelo | Receita recorrente via parceiros, organizadores e serviços premium |

**Meta de produto:** a Corredora DF é sinônimo de corrida no DF — mencionada antes de qualquer alternativa.

---

## 5. Personas

### 5.1 Corredor iniciante

| Dimensão | Perfil |
|---|---|
| **Quem é** | Adulto 25–40 anos, começou a correr recentemente, mora no DF |
| **Motivação** | Saúde, desafio pessoal, evento com amigos |
| **Dores** | Não sabe qual prova escolher; medo de não estar preparado; dificuldade em encontrar informações confiáveis |
| **Comportamento** | Busca no Google e Instagram; consulta pelo celular; precisa de orientação clara |
| **O que busca na plataforma** | Corridas para iniciantes (5K, 10K), conteúdo educativo, comunidade acolhedora |
| **Jornada principal** | Home → Eventos → Detalhe → Cadastro → Inscrição |
| **Módulos críticos** | Home, Eventos, Blog, Comunidade |

**Decisão de produto:** reduzir fricção na primeira inscrição — descoberta sem login, linguagem inclusiva, destaque de provas acessíveis.

---

### 5.2 Corredor experiente

| Dimensão | Perfil |
|---|---|
| **Quem é** | Corredor 30–50 anos, múltiplas provas por ano, conhece o circuito local |
| **Motivação** | Performance, novos desafios (meia, maratona, trail), pertencimento à comunidade |
| **Dores** | Falta de centralização; cupons e benefícios espalhados; pouca visibilidade de rankings e grupos |
| **Comportamento** | Usuário recorrente; compara eventos; interage em comunidade; valoriza eficiência |
| **O que busca na plataforma** | Calendário completo, cupons exclusivos, grupos, rankings, concierge |
| **Jornada principal** | Login → Cupons / Comunidade → Inscrição em prova-alvo |
| **Módulos críticos** | Eventos, Cupons, Comunidade, Concierge, Perfil |

**Decisão de produto:** retenção via benefícios tangíveis (cupons) e engajamento social (comunidade, rankings) — não apenas catálogo de eventos.

---

### 5.3 Organizador

| Dimensão | Perfil |
|---|---|
| **Quem é** | Empresa de eventos, assessoria esportiva ou grupo independente que produz corridas no DF |
| **Motivação** | Preencher vagas, profissionalizar comunicação, reduzir trabalho operacional |
| **Dores** | Divulgação fragmentada; gestão manual de inscrições; dificuldade em medir alcance |
| **Comportamento** | Desktop para gestão; mobile para acompanhamento; precisa de confiabilidade |
| **O que busca na plataforma** | Publicar eventos, gerenciar inscrições, comunicar participantes, visibilidade |
| **Jornada principal** | Admin → Criar evento → Publicar → Acompanhar inscrições |
| **Módulos críticos** | Painel Admin, Eventos, Kits, Notificações |

**Decisão de produto:** no MVP, organizadores operam via painel admin interno; no médio prazo, self-service para reduzir dependência da equipe Corredora DF.

---

### 5.4 Parceiro

| Dimensão | Perfil |
|---|---|
| **Quem é** | Marca de equipamentos, nutrição, saúde, mídia ou serviços do ecossistema running |
| **Motivação** | Alcançar corredores qualificados, associar marca a eventos, medir ROI de campanhas |
| **Dores** | Público genérico em anúncios; dificuldade em vincular campanha a conversão real |
| **Comportamento** | Avalia métricas; renova parceria com base em resultados; patrocina eventos específicos |
| **O que busca na plataforma** | Página de parceiro, cupons, banners, destaque em eventos, relatórios |
| **Jornada principal** | Parceiros (vitrine) → Detalhe → Cupom resgatado pelo corredor |
| **Módulos críticos** | Parceiros, Cupons, Ads, Eventos (patrocínio) |

**Decisão de produto:** parceiros são motor de receita e credibilidade — visibilidade na Home e em eventos com tracking de impressões e cliques.

---

## 6. North Star Metric

### Inscrições confirmadas em eventos por mês

**Por que esta métrica:**

- Captura o valor entregue ao **corredor** (compromisso real com uma prova).
- Reflete sucesso do **organizador** (vagas preenchidas).
- Indica saúde do **ecossistema** (eventos ativos + demanda).
- É mensurável desde o MVP (`POST /events/:id/register`).
- Conecta descoberta (topo do funil) a conversão (objetivo de negócio).

**Definição:** número de inscrições com status `confirmed` em eventos listados na plataforma, contabilizadas no mês calendário.

**Complemento qualitativo:** entrevistas trimestrais com corredores e organizadores para validar se o crescimento quantitativo corresponde a satisfação real.

---

## 7. KPIs

### 7.1 Produto

| KPI | Descrição | Meta MVP (6 meses) |
|---|---|---|
| Inscrições mensais | North Star — inscrições confirmadas | Baseline + crescimento mês a mês |
| Taxa de conversão Home → evento | Visitantes que acessam detalhe de evento | ≥ 20% |
| Taxa de conversão evento → inscrição | Visualizações de detalhe que viram inscrição | ≥ 5% |
| Tempo até primeira inscrição | Dias entre cadastro e primeira inscrição | ≤ 7 dias |
| Retenção D30 | Usuários que retornam após 30 dias do cadastro | ≥ 25% |
| NPS | Satisfação geral com a plataforma | ≥ 40 |

### 7.2 Comunidade

| KPI | Descrição | Meta MVP (6 meses) |
|---|---|---|
| Usuários ativos mensais (MAU) | Usuários autenticados com ação no mês | Crescimento sustentado |
| Posts por semana | Conteúdo gerado em `/comunidade` | ≥ 20 (orgânico) |
| Taxa de participação | MAU que interagem na comunidade | ≥ 15% |
| Membros em grupos | Total em grupos ativos | ≥ 100 |
| Engajamento no blog | Pageviews em artigos / sessões | Crescimento orgânico |

### 7.3 Negócio

| KPI | Descrição | Meta MVP (6 meses) |
|---|---|---|
| Parceiros ativos | Marcas com presença na plataforma | ≥ 10 |
| Cupons resgatados | Total de resgates (`POST /coupons/:id/redeem`) | Baseline + tendência |
| Taxa de resgate | Cupons resgatados / cupons disponibilizados | ≥ 30% |
| Eventos ativos | Eventos com inscrições abertas | ≥ 15 simultâneos |
| Receita de parceiros | Faturamento com patrocínios e campanhas | Definir modelo no pós-MVP |
| CAC | Custo de aquisição por corredor cadastrado | Monitorar; otimizar após MVP |

> Detalhamento operacional de métricas será expandido em `docs/product/metrics.md` (futuro).

---

## 8. Diferenciais competitivos

| Diferencial | Descrição | Por que importa |
|---|---|---|
| **Foco regional (DF)** | Calendário e parceiros centrados no Distrito Federal | Alternativas nacionais tratam o DF como mais um estado; nós priorizamos o ecossistema local |
| **Jornada completa** | Descoberta → inscrição → kit → comunidade em um só lugar | Concorrentes resolvem apenas listagem ou apenas inscrição |
| **Ecossistema de benefícios** | Cupons e parceiros integrados à experiência, não banners genéricos | Valor tangível para o corredor; ROI mensurável para o parceiro |
| **Comunidade nativa** | Feed, grupos e rankings dentro da plataforma | Reduz dependência de grupos externos fragmentados |
| **Experiência moderna** | Next.js, mobile-first, acessível, Butterfly UI | Sites de eventos locais frequentemente desatualizados |
| **API-first** | Contratos documentados antes da implementação | Permite evolução rápida, integrações futuras e consistência |
| **Concierge** | Atendimento humano para dúvidas complexas | Diferencial de serviço em um mercado dominado por autoatendimento limitado |

### Posicionamento

```text
                    Jornada completa
                          ▲
                          │
           Corredora DF   │   Apps nacionais
           (regional +    │   (amplo, genérico)
            ecossistema)  │
                          │
    ◄─────────────────────┼─────────────────────►
    Nicho regional        │              Abrangência nacional
                          │
           Sites de       │   Redes sociais /
           eventos        │   grupos de mensagem
           (fragmentado)  │
                          ▼
                    Apenas listagem
```

---

## 9. Riscos

| Risco | Impacto | Probabilidade | Mitigação |
|---|---|---|---|
| **Baixa adoção inicial** | Plataforma sem eventos ou usuários suficientes | Média | Parcerias com organizadores locais antes do launch; eventos âncora no calendário |
| **Conteúdo desatualizado** | Corredores perdem confiança em dados de eventos | Alta | Processo de curadoria no admin; validação de datas e vagas; notificações de alteração |
| **Dependência de poucos organizadores** | Concentração de inscrições em 2–3 eventos | Média | Diversificar calendário; onboarding de novos organizadores no médio prazo |
| **Engajamento de comunidade fraco** | Seção social vazia prejudica retenção | Média | Seed de conteúdo inicial; grupos por distância; integração com eventos (pós-prova) |
| **Modelo de receita indefinido** | Sustentabilidade financeira incerta pós-MVP | Média | Definir pricing para parceiros e organizadores antes da Sprint 12; testar cupons patrocinados |
| **Atraso técnico (API/backend)** | Frontend pronto sem dados reais | Média | Contratos API prontos; mocks em serviços; desenvolvimento paralelo a partir da Sprint 05 |
| **Concorrência de players nacionais** | Dificuldade em destacar-se | Baixa | Reforçar regionalidade e jornada completa; não competir em escala, competir em profundidade |
| **LGPD e dados pessoais** | Risco legal e reputacional | Baixa | Política de privacidade desde o MVP; consentimento explícito; engenharia seguindo [security.md](../engineering/08-security.md) |
| **Sazonalidade** | Picos em março–junho e setembro–novembro; vales no verão | Alta | Conteúdo editorial e comunidade nos períodos baixos; planejamento de campanhas |

---

## 10. Próximos passos

### Imediato (Sprint 02–04)

| # | Ação | Responsável | Referência |
|---|---|---|---|
| 1 | Concluir Butterfly UI (tokens, temas, componentes) | Engenharia + Design | [roadmap.md](../roadmap.md) Sprint 02 |
| 2 | Implementar AppShell, Navbar e Footer | Engenharia | Sprint 03 |
| 3 | Desenvolver Home conforme IA oficial | Engenharia + Produto | [home-information-architecture.md](./home-information-architecture.md) |
| 4 | Formalizar gaps de API identificados na Home | Produto + Backend | §4.3 da Home IA |

### Curto prazo (Sprint 05–12)

| # | Ação | Responsável |
|---|---|---|
| 5 | Entregar módulos do MVP na ordem do roadmap | Engenharia |
| 6 | Iniciar conversas com 3–5 organizadores locais | Produto / Negócios |
| 7 | Fechar primeiros parceiros para launch | Negócios |
| 8 | Criar `docs/product/metrics.md` com baselines | Produto |
| 9 | Criar `docs/product/user-stories.md` por sprint | Produto |

### Médio prazo (pós-MVP)

| # | Ação | Responsável |
|---|---|---|
| 10 | Lançar onboarding self-service para organizadores | Produto + Engenharia |
| 11 | Dashboard de parceiro com métricas de campanha | Produto + Engenharia |
| 12 | Revisão trimestral desta visão com stakeholders | Produto |

---

## Referências

| Documento | Descrição |
|---|---|
| [roadmap.md](../roadmap.md) | Planejamento de sprints até o MVP |
| [home-information-architecture.md](./home-information-architecture.md) | Arquitetura da Home (PB-026) |
| [ux/README.md](../ux/README.md) | Princípios de UX e fluxos |
| [api/README.md](../api/README.md) | Contratos de API |
| [design-system/README.md](../design-system/README.md) | Butterfly UI e tokens |

---

> Este documento é a referência estratégica do produto. Decisões de escopo, priorização e design devem ser avaliadas contra missão, visão e North Star Metric aqui definidos. Revisão formal a cada trimestre ou a cada marco de sprint major (MVP, v2.0).
