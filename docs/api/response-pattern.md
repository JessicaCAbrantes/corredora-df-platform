# Response Pattern

Formato único de resposta para todos os endpoints da API.

## Objetivo

Garantir que Frontend e Backend compartilham a mesma estrutura de dados em toda comunicação — sucesso ou erro.

## Resposta de sucesso — item único

```json
{
  "data": {
    "id": "evt_01HXYZ",
    "name": "Maratona de Brasília",
    "date": "2026-06-15"
  }
}
```

## Resposta de sucesso — coleção

```json
{
  "data": [
    { "id": "evt_01HXYZ", "name": "Maratona de Brasília" },
    { "id": "evt_01HABC", "name": "Corrida Noturna DF" }
  ],
  "meta": {
    "page": 1,
    "perPage": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

## Resposta de sucesso — ação sem retorno

```json
{
  "data": null,
  "message": "Inscrição realizada com sucesso."
}
```

## Resposta de erro

```json
{
  "error": {
    "code": "EVENT_NOT_FOUND",
    "message": "Evento não encontrado.",
    "status": 404,
    "details": []
  }
}
```

## Estrutura tipada (contrato)

```text
ApiResponse<T>
├── data: T | T[] | null
├── meta?: PaginationMeta     (apenas em coleções)
├── message?: string          (mensagens informativas)
└── error?: ApiError           (apenas em erros)
```

## Regras

- `data` e `error` nunca coexistem na mesma resposta.
- Coleções paginadas sempre incluem `meta` (ver [pagination.md](./pagination.md)).
- `message` é opcional e para feedback ao usuário — não para lógica.
- Campos `null` são omitidos em respostas de sucesso (sem `error: null`).
- Datas em formato ISO 8601 (`2026-06-15T08:00:00Z`).
- IDs como strings (`evt_01HXYZ`), nunca números sequenciais expostos.

## Relação com o Frontend

```tsx
// apps/web/services/api-client.ts (futuro)
interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
  message?: string;
}

interface ApiErrorResponse {
  error: ApiError;
}
```

Consumido por `features/*/services/` e tipado em `types/`.
