# 07 — Testing

Estratégia de testes da plataforma.

## Pirâmide de testes

```text
        ╱  E2E  ╲          poucos, fluxos críticos
       ╱──────────╲
      ╱ Integração ╲        features e serviços
     ╱──────────────╲
    ╱   Unitários    ╲      funções, hooks, componentes
```

## Tipos de teste

### Unitários

Testam funções e hooks isolados.

```tsx
// lib/format-date.test.ts
import { formatDate } from "./format-date";

test("formata data em português", () => {
  expect(formatDate("2026-06-18")).toBe("18 de junho de 2026");
});
```

**Onde:** `lib/`, `hooks/`, `features/*/hooks/`, utilitários.

### Componentes

Testam renderização e interação de componentes.

```tsx
// components/ui/Button/Button.test.tsx
import { render, screen } from "@testing-library/react";
import { Button } from "./Button";

test("renderiza com texto", () => {
  render(<Button>Inscrever-se</Button>);
  expect(screen.getByRole("button", { name: "Inscrever-se" })).toBeInTheDocument();
});
```

**Onde:** `components/ui/`, `components/shared/`, `features/*/components/`.

### Integração

Testam fluxos entre camadas (feature + serviço + componente).

```tsx
// features/events/events.integration.test.tsx
test("lista eventos com dados mockados", async () => {
  render(<EventsPage />);
  expect(await screen.findByText("Maratona de Brasília")).toBeInTheDocument();
});
```

**Onde:** `features/*/`.

### E2E (futuro)

Testam fluxos completos no browser.

```text
Inscrição em evento: home → eventos → detalhe → inscrição → confirmação
Login: /login → credenciais → redirect para /profile
```

**Ferramenta planejada:** Playwright.

## Convenções

| Item | Padrão |
|---|---|
| Arquivo de teste | `*.test.ts` ou `*.test.tsx` ao lado do arquivo |
| Nome do teste | Descrição em português do comportamento esperado |
| Estrutura | Arrange → Act → Assert |
| Mocks | Apenas serviços externos (API, storage) |

## O que testar

- [ ] Funções de `lib/` com lógica
- [ ] Hooks com comportamento condicional
- [ ] Componentes de `components/ui/` (renderização, props, a11y)
- [ ] Fluxos críticos de features (listagem, formulários, auth)
- [ ] Serviços com transformação de dados

## O que NÃO testar

- Implementação interna de bibliotecas (Next.js, React).
- Estilos visuais (usar revisão manual ou screenshot testing no futuro).
- Configurações e arquivos de setup.

## Comandos (futuro)

```bash
pnpm --filter web test          # rodar todos os testes
pnpm --filter web test:watch    # modo watch
pnpm --filter web test:coverage # cobertura
```

## Cobertura mínima (meta)

| Camada | Meta |
|---|---|
| `lib/` | 90% |
| `hooks/` | 80% |
| `components/ui/` | 80% |
| `features/` | 70% |
| Global | 75% |
