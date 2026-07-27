# Versioning

Estratégia de versionamento da API.

## Objetivo

Permitir evolução da API sem quebrar clientes existentes.

## Estratégia: URL prefix

```text
/api/v1/events
/api/v1/partners
/api/v2/events  (futuro)
```

### Por que URL prefix?

- Explícito e fácil de debugar.
- Compatível com proxies, CDN e logs.
- Padrão adotado por Stripe, GitHub e Twilio.
- Simples de implementar no NestJS (`@Controller('v1/events')`).

## Regras

| Regra | Detalhe |
|---|---|
| Versão atual | `v1` |
| Prefixo | `/api/v1` em todos os endpoints |
| Breaking changes | Nova versão (`v2`) — nunca alterar `v1` |
| Deprecation | Header `Deprecation: true` + `Sunset: <date>` |
| Sunset period | Mínimo 6 meses entre deprecation e remoção |

## O que é breaking change?

- Remover ou renomear campo em resposta
- Alterar tipo de campo
- Remover endpoint
- Alterar comportamento de autenticação

## O que NÃO é breaking change?

- Adicionar campo opcional em resposta
- Adicionar novo endpoint
- Adicionar query parameter opcional

## Versionamento do contrato

Esta documentação em `docs/api/` representa **v1**. Alterações no contrato seguem:

1. Propor mudança via PR com justificativa
2. Atualizar documentação
3. Implementar no Backend
4. Atualizar `services/` no Frontend

## Relação com o Frontend

```tsx
// lib/api-client.ts (futuro)
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1`;
```

Variável de ambiente `NEXT_PUBLIC_API_URL` sem o prefixo de versão — versão definida no client.
