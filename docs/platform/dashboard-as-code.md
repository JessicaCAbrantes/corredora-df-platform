# Dashboard as Code (FASE 4.1-C3)

**Status:** Stable (processo local)  
**Escopo:** fluxo oficial edit → export → commit; convenções de UID, versionamento e review  
**Fora de escopo:** novos dashboards, mudanças de queries neste PR, Alertmanager, Grafana Cloud, produção, `apps/*`

Consome o dashboard provisionado em [grafana-local.md](./grafana-local.md) e o [Dashboard Contract D3-A](../observability/payment-dashboards.md). A aplicação permanece congelada.

---

## 1. Honesty

| Claim | Today |
|---|---|
| Dashboards versionados em Git | **Sim** — `infrastructure/observability/grafana/dashboards/*.json` |
| Fluxo edit → export → commit documentado | **Sim** (este documento) |
| Git = source of truth | **Sim** — mount read-only no container |
| Edição só na UI sem export | **Drift** — perda ao recriar o volume/container |
| Alertmanager / produção | **Não** |

---

## 2. Source of truth

| Camada | Papel |
|---|---|
| **Git** (`*.json` no repo) | Única fonte oficial do dashboard |
| **Contrato D3-A** | O que o dashboard *deve* mostrar (painéis, agregações, métricas) |
| **Grafana UI local** | Ferramenta de edição visual — **não** é a fonte oficial |
| **Volume `grafana_data`** | Estado local efêmero; pode divergir do Git até o próximo export |

O provider monta a pasta de dashboards como **read-only**. `allowUiUpdates: true` permite experimentar na UI; mudanças **não** voltam sozinhas para o Git.

---

## 3. Estrutura de diretórios

```text
infrastructure/observability/grafana/
  provisioning/
    datasources/datasource.yml   # uid prometheus (congelado)
    dashboards/dashboards.yml    # provider → /var/lib/grafana/dashboards
  dashboards/                    # JSON versionados (Git)
    README.md
    payments-ops-v1.json         # uid == payments-ops-v1
```

| Artefato | Convenção |
|---|---|
| Nome do arquivo | `{uid}.json` |
| `uid` no JSON | Igual ao nome do arquivo (sem `.json`) |
| Folder Grafana | `Corredora DF` |
| Datasource | uid `prometheus` |
| Refresh padrão | `30s` |

---

## 4. UID congelado

| Dashboard | UID | Contrato |
|---|---|---|
| Payments — Operational | **`payments-ops-v1`** | [payment-dashboards.md](../observability/payment-dashboards.md) |

Regras:

- **Nunca** deixar o Grafana gerar um UID novo no export.
- **Nunca** renomear o UID sem decisão explícita de versionamento (ex.: `payments-ops-v2` + atualização do contrato).
- Após export, conferir no JSON: `"uid": "payments-ops-v1"`.

---

## 5. Fluxo oficial: edit → export → commit

Use este fluxo para **qualquer** alteração visual ou de query no dashboard oficial.

### 5.1 Pré-requisito

```bash
docker compose -f infrastructure/docker-compose.yml up -d prometheus grafana
```

Grafana: [http://localhost:3002](http://localhost:3002) · dashboard **Payments — Operational**.

### 5.2 Editar na UI (não no JSON à mão)

1. Abra o dashboard provisionado (`payments-ops-v1`).
2. Faça a alteração visual / de query **na instância local**.
3. **Não** edite `payments-ops-v1.json` manualmente quando a mudança for layout, cores, legendas ou queries PromQL — o JSON do Grafana é verboso e fácil de corromper.

Exceção: correções mecânicas mínimas (typo em `description`, tag) podem ir direto no JSON **se** o diff for trivial e o `uid` permanecer intacto.

### 5.3 Exportar

1. **Share / Export** (ou menu do dashboard → **Export** → **Export for sharing externally** / Save to file).
2. Preferir export **sem** dados de sessão desnecessários; o arquivo deve ser o dashboard JSON completo.
3. Substitua o arquivo versionado:

```bash
# Exemplo: após salvar o export em Downloads
cp ~/Downloads/payments-ops-v1.json \
   infrastructure/observability/grafana/dashboards/payments-ops-v1.json
```

### 5.4 Sanitizar / preservar campos congelados

Antes do commit, confira no JSON exportado:

| Campo | Esperado |
|---|---|
| `uid` | `payments-ops-v1` |
| `title` | `Payments — Operational` (só muda se o contrato D3-A mudar) |
| `refresh` | `30s` |
| Datasource refs | uid `prometheus` |
| `id` | preferir `null` (provisioning) |

Se o export trouxe `id` numérico ou UID diferente, **corrija antes do commit**.

### 5.5 Revisar o diff → commit → PR

```bash
git diff infrastructure/observability/grafana/dashboards/payments-ops-v1.json
```

Checklist de review: §7.

Branch sugerida: `platform/observability-…` · PR pequeno · só plataforma/docs.

### 5.6 Validar após merge

Recrie ou reinicie o Grafana e confirme que o dashboard provisionado reflete o Git (sem depender do estado antigo do volume).

```bash
docker compose -f infrastructure/docker-compose.yml up -d --force-recreate grafana
```

---

## 6. Política de versionamento

| Mudança | Onde versionar | Notas |
|---|---|---|
| Layout / cores / legendas / eixos (mesmas métricas e painéis) | Só o JSON no Git | Sem bump de contrato |
| Query PromQL ainda alinhada ao D3-A (ex.: janela `[5m]`→`[10m]`) | JSON + menção no PR | Não altera o contrato se a pergunta operacional for a mesma |
| Novo painel, painel removido, ou mudança de *significado* | Atualizar **D3-A** primeiro | Depois o JSON |
| Agregação proibida (ex.: `sum()` em gauge de ledger) | **Rejeitar** | Contrato §3 — `max()` only |
| Nova métrica | **Fora de escopo** da plataforma 4.1-C | Reabre Fase 3.5 métricas |

Versionamento do **arquivo**: o Git é o histórico. O campo `"version"` interno do Grafana pode subir a cada export — não é semver do produto.

---

## 7. Review de mudanças em dashboards

Todo PR que toca `infrastructure/observability/grafana/dashboards/*.json` deve responder:

- [ ] `uid` preservado (`payments-ops-v1`)
- [ ] `refresh` permanece `30s` (salvo decisão explícita)
- [ ] Datasource continua uid `prometheus`
- [ ] Painéis oficiais intactos em *identidade*: Checkout funnel, Webhook outcomes, Webhook latency, Ledger health — **títulos/ids de painel do contrato** não mudam sem atualizar D3-A
- [ ] Counters/histograms: `sum`/`rate`/`histogram_quantile` — sem inventar métricas
- [ ] Ledger: **`max(...)`** — nunca `sum()` em `payment_ledger_received_*`
- [ ] Diff revisado (evitar ruído enorme sem necessidade: timestamps, `version`, ids locais)
- [ ] Sem alteração em `apps/*` nem em contratos de métricas/eventos

---

## 8. Boas práticas (anti-drift)

1. **Nunca** editar o JSON manualmente para mudanças visuais — edite no Grafana local, exporte, substitua o arquivo.
2. **Sempre** exportar e commitá-lo após uma alteração que se quer oficial.
3. **Preservar** o `uid` em todo export.
4. **Não** alterar títulos / nomes / conjunto de painéis sem atualizar o [contrato D3-A](../observability/payment-dashboards.md) antes.
5. **Revisar o diff** antes do commit — exports do Grafana costumam incluir churn irrelevante; mantenha o PR legível.
6. Tratar a UI local como rascunho: se salvou só no Grafana e não no Git, **não** está feito.
7. Após recreate do container, o que vale é o JSON do repo — confirme mentalmente “Git ganha”.

---

## 9. O que este documento não autoriza

- Novos dashboards (novo uid / novo contrato)
- Novas métricas ou mudança no contrato de observabilidade da app
- Alertmanager, Grafana Cloud, SSO, produção
- Provisionamento além do já existente em 4.1-C1

---

## 10. Relacionados

- [grafana-local.md](./grafana-local.md) — sobe Grafana + provisioning
- [observability-local.md](./observability-local.md) — Prometheus scrape
- [payment-dashboards.md](../observability/payment-dashboards.md) — contrato D3-A
- Pasta: `infrastructure/observability/grafana/dashboards/`
