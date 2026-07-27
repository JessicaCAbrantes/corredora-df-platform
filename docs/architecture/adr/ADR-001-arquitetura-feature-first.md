# ADR-001: Arquitetura Feature First

## Status

Aceito — 2026-07-13

## Contexto

O frontend concentra vários domínios (eventos, cupons, comunidade, auth, home…). Organização por “tipo técnico” (`components/`, `hooks/`, `services/` globais misturados) escala mal: mudanças de um domínio espalham-se por dezenas de pastas e geram acoplamento acidental.

O [Engineering Handbook](../../engineering/engineering-handbook.md) e as [Feature Specifications](../../product/feature-specifications.md) já pressupõem domínios auto-contidos.

## Problema

Como organizar o código frontend para que cada domínio de negócio possa evoluir com boundaries claros, ownership e deployabilidade mental (mesmo em monorepo único)?

## Alternativas

| Alternativa | Prós | Contras |
|---|---|---|
| **A. Layered (páginas / components / hooks / services globais)** | Familiar | Domínios fragmentados; imports cruzados |
| **B. Feature First (`features/<domínio>/`)** | Coesão; ownership; onboarding por domínio | Exige disciplina de não importar internals |
| **C. Microfrontends** | Deploy independente | Complexidade prematura para MVP DF |
| **D. Domain packages no monorepo (`packages/events`)** | Isolamento forte | Overhead de versionamento cedo demais |

## Decisão

Adotar **Feature First (Feature-Based Design)** em `apps/web/features/`:

```text
features/<domínio>/
  components/ hooks/ services/ types/ utils/
  index.ts  README.md
```

Regras:

1. Rotas em `app/` são **finas** — só compostos a feature.
2. UI sem negócio fica em `components/` ou `@corredora/ui`.
3. Feature A **não** importa internals de Feature B; compartilhar via `lib/`, `components/`, `types/` globais ou futuro `packages/types`.
4. I/O HTTP vive em `features/*/services/` alinhado a `docs/api/`.

Domínios iniciais: `home`, `events`, `partners`, `coupons`, `community`, `blog`, `auth`, `profile`, `concierge`, `navigation`.

## Consequências

**Positivas**

- Mudanças de “Cupons” localizadas
- Stories/PRs mapeiam 1:1 para pastas
- Facilita extrair package depois, se necessário

**Negativas**

- Tentação de duplicar Button/Card (mitigar com design system)
- Curva para quem vem de pastas “por tipo”

**Neutras**

- Admin no MVP pode viver em rotas `/admin` reutilizando services das features (não exige `features/admin` imediatamente)

## Próximos passos

- [ ] Enforce em review (checklist handbook §11)
- [ ] Documentar regra de import no ESLint (`no-restricted-imports`) quando estável
- [ ] Avaliar `packages/types` quando ≥2 apps consumirem os mesmos DTOs
