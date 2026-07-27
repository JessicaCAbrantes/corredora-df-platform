# Errors

Padrão de erros da API.

## Objetivo

Respostas de erro previsíveis e acionáveis — Frontend sabe exatamente o que aconteceu e como reagir.

## Estrutura de erro

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos.",
    "status": 400,
    "details": [
      { "field": "email", "message": "E-mail inválido." },
      { "field": "password", "message": "Mínimo 8 caracteres." }
    ]
  }
}
```

### Campos

| Campo | Tipo | Descrição |
|---|---|---|
| `code` | string | Código machine-readable (UPPER_SNAKE_CASE) |
| `message` | string | Mensagem legível para o usuário (pt-BR) |
| `status` | number | HTTP status code |
| `details` | array | Erros de campo (validação) ou contexto adicional |

## Status codes

| Status | Código | Quando |
|---|---|---|
| `400` | `VALIDATION_ERROR` | Dados de entrada inválidos |
| `400` | `BAD_REQUEST` | Request malformado |
| `401` | `UNAUTHORIZED` | Token ausente ou inválido |
| `403` | `FORBIDDEN` | Sem permissão para o recurso |
| `404` | `NOT_FOUND` | Recurso não encontrado |
| `409` | `CONFLICT` | Conflito (ex: e-mail já cadastrado) |
| `422` | `UNPROCESSABLE_ENTITY` | Regra de negócio violada |
| `429` | `RATE_LIMITED` | Muitas requisições |
| `500` | `INTERNAL_ERROR` | Erro interno do servidor |

## Códigos por recurso (exemplos)

| Código | Recurso | Descrição |
|---|---|---|
| `EVENT_NOT_FOUND` | events | Evento não existe |
| `EVENT_REGISTRATION_CLOSED` | events | Inscrições encerradas |
| `COUPON_EXPIRED` | coupons | Cupom expirado |
| `COUPON_ALREADY_USED` | coupons | Cupom já utilizado |
| `USER_NOT_FOUND` | users | Usuário não existe |
| `INVALID_CREDENTIALS` | auth | E-mail ou senha incorretos |
| `TOKEN_EXPIRED` | auth | Token de acesso expirado |

## Regras

- Mensagens em **português** (pt-BR) — exibidas diretamente ao usuário.
- Códigos em **inglês** (UPPER_SNAKE_CASE) — usados pelo Frontend para lógica.
- `details` preenchido apenas em erros de validação (`400`).
- Erros `500` nunca expõem stack trace ou detalhes internos.
- Frontend trata `401` com redirect para `/login`.

## Relação com o Frontend

```tsx
// Tratamento padrão em services/
if (response.error?.code === "UNAUTHORIZED") {
  redirect("/login");
}

if (response.error?.code === "VALIDATION_ERROR") {
  setFieldErrors(response.error.details);
}
```

Referência: `docs/engineering/08-security.md`
