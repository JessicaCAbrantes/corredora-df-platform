# Tests

Testes do monorepo.

## Objetivo

Centralizar configuração, utilitários e documentação de testes que transcendem um único app ou package.

## Estrutura prevista

```text
tests/
├── e2e/              → testes end-to-end (Playwright)
├── integration/      → testes de integração cross-app
├── fixtures/         → dados de teste compartilhados
└── helpers/          → utilitários de teste
```

## Estratégia

| Camada | Local | Ferramenta |
|---|---|---|
| Unitários | Ao lado do código (`*.test.ts`) | Vitest/Jest |
| Componentes | `apps/web/components/` | Testing Library |
| Integração | `apps/web/features/` | Testing Library |
| E2E | `tests/e2e/` | Playwright |

Referência completa: [docs/engineering/07-testing.md](../docs/engineering/07-testing.md)

## Cobertura mínima (meta)

| Camada | Meta |
|---|---|
| `lib/` | 90% |
| `hooks/` | 80% |
| `components/ui/` | 80% |
| `features/` | 70% |
| Global | 75% |

## Estado atual

Pasta preparada. Testes serão implementados na Sprint 13.

## Comandos (futuro)

```bash
pnpm test                  # todos os testes
pnpm test:e2e              # E2E com Playwright
pnpm test:coverage         # relatório de cobertura
```
