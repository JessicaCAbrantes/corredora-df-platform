# ADR-000: Como utilizar ADRs

## Status

Aceito — 2026-07-13

## Contexto

A Plataforma Corredora DF é um monorepo com frontend, backend futuro, design system e documentação de produto. Decisões implícitas (“sempre foi assim”) se perdem com o crescimento do time e forçam rediscussões caras. Precisamos de um formato único, leve e versionado em Git.

## Problema

Como documentar decisões arquiteturais de forma que:

1. Sejam descobráveis por quem entra no projeto
2. Capturem alternativas rejeitadas (não só o resultado)
3. Possam ser substituídas sem apagar histórico
4. Não virem burocracia que ninguém escreve

## Alternativas

| Alternativa | Prós | Contras |
|---|---|---|
| **A. Só README / wiki** | Rápido | Mistura tutoriais com decisões; histórico opaco |
| **B. Confluence / Notion** | Colaboração rica | Fora do Git; drift vs código |
| **C. ADRs numerados no repositório** | Versionados; PRs; próximos ao código | Exige disciplina mínima |
| **D. Comentários longos no código** | Locais | Não explicam trade-offs de sistema |

## Decisão

Adotar **Architecture Decision Records** no repositório, em:

```text
docs/architecture/adr/ADR-NNN-titulo-kebab-case.md
```

Regras:

1. **Um ADR = uma decisão** (não um tutorial completo).
2. **Numeração sequencial** com zero-padding de 3 dígitos (`000`, `001`…).
3. **Status obrigatório:** Proposto → Aceito → (Substituído | Depreciado).
4. **Estrutura fixa:** Status, Contexto, Problema, Alternativas, Decisão, Consequências, Próximos passos.
5. **Idioma:** português (alinhado à documentação do produto); identificadores técnicos em inglês.
6. **Substituição:** ADR novo referencia o antigo; o antigo muda status para `Substituído por ADR-XXX` — não se apaga.
7. **Review:** ADRs Aceitos entram via PR como qualquer doc de engenharia.
8. **Escopo:** decisões de arquitetura/plataforma. Detalhe de implementação fica no [Engineering Handbook](../../engineering/engineering-handbook.md); o “quê” de produto fica em `docs/product/`.

## Consequências

**Positivas**

- Rastreabilidade Git (blame, PRs, bisect semântico)
- Onboarding mais rápido (“por que NestJS?” → ADR-005)
- Debates futuros partem de alternativas já avaliadas

**Negativas / custos**

- Overhead de escrever ADR para mudanças estruturais
- Risco de ADRs desatualizados se status não for mantido

**Neutras**

- `docs/adr/` permanece como redirecionamento para esta pasta

## Próximos passos

- [x] Publicar ADR-000 a ADR-010 (fundação)
- [ ] Exigir ADR em PRs que alterem stack, boundaries ou padrões cross-cutting (checklist de review)
- [ ] Revisar status trimestralmente junto com o handbook
