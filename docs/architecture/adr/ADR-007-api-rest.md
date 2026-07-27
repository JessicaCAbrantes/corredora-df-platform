# ADR-007: API REST

## Status

Aceito — 2026-07-13

## Contexto

Contratos já existem em `docs/api/` (events, auth, coupons, community…). Frontend e (futuro) eventuais clientes móveis precisam de uma API estável, versionada e compreensível.

## Problema

Qual estilo de API pública adotar para comunicação FE↔BE com versionamento, paginação e erros uniformes?

## Alternativas

| Alternativa | Prós | Contras |
|---|---|---|
| **A. REST + JSON versionado por URL** | Universal; cacheável; bate com docs atuais | Over/under-fetch eventual |
| **B. GraphQL** | Query flexível | Complexidade ops/auth; time menor |
| **C. tRPC** | DX TS | Acopla clientes; pior para terceiros |
| **D. REST sem versionamento** | Simples | Breaking changes dolorosas |

## Decisão

Adotar **API REST JSON** com:

1. Base **`/api/v1`**
2. Recursos no plural (`/events`, `/partners`)
3. Verbos HTTP semânticos
4. Envelope de resposta único ([response-pattern.md](../../api/response-pattern.md))
5. Paginação offset `page` + `perPage` ([pagination.md](../../api/pagination.md))
6. Erros tipados com códigos ([errors.md](../../api/errors.md))
7. **API-first:** contrato no markdown/OpenAPI antes ou junto da implementação
8. Auth via `Authorization: Bearer` e/ou cookie httpOnly (detalhe em ADR de sessão futuro)
9. Roles: `public` | `authenticated` | `admin`

Não adotar GraphQL no MVP. BFF GraphQL só se um ADR futuro justificar.

## Consequências

**Positivas**

- Docs atuais já são a fonte da verdade
- Fácil testar com curl/Postman/Playwright
- Versionar `v2` sem quebrar `v1`

**Negativas**

- Possível chattyidade (mitigar com includes pontuais ou endpoints compostos só se necessário)
- Gaps (`featured`, pickup windows) precisam ser fechados no contrato

**Neutras**

- OpenAPI gerado a partir do Nest reforça sync FE/BE

## Próximos passos

- [ ] Fechar gaps listados no product backlog (§ Gaps de API)
- [ ] Publicar OpenAPI a partir do Nest
- [ ] SDK/client tipado em `apps/web` (`lib/api-client` + services)
- [ ] Política de deprecação documentada em `versioning.md`
