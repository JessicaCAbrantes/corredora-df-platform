# Kits

Kits de corrida associados a eventos.

## Objetivo

Expor, em modo **somente leitura**, os kits vinculados às inscrições do usuário autenticado (Retirada de Kits MVP — F-03.03).

> **Distinção:** o stub `EventDetailsDto.kit` no detalhe da corrida (`GET /events/by-slug/:slug`) é marketing/placeholder e **não** é esta vertical. A retirada autenticada usa `GET /events/me/kits`.

## Implementado neste MVP

| Método | Endpoint | Descrição | Permissão |
|---|---|---|---|
| `GET` | `/events/me/kits` | Kits das inscrições do usuário autenticado | Autenticado |

Identidade **exclusivamente** via Real Auth Boundary (`corredora_session`).  
Não aceita `userId` em query, body, params ou headers.

### Sucesso (200)

```json
{
  "data": [
    {
      "kitId": "kit_01_meia",
      "status": "available",
      "event": {
        "id": "evt_01_meia",
        "slug": "meia-maratona-brasilia",
        "name": "Meia Maratona de Brasília",
        "date": "2026-08-16T10:00:00.000Z",
        "city": "Brasília",
        "distance": "21K"
      }
    }
  ]
}
```

Ordenação: `EventRegistration.createdAt DESC`.

Sem kits (sem inscrição ou evento sem kit seed): `{ "data": [] }` com `200`.

### Erros

| Código | HTTP | Quando |
|---|---|---|
| `UNAUTHORIZED` | 401 | Sem sessão válida |

### Modelo mínimo

```text
Kit { id, eventId (unique), createdAt }
Event 1 — 0..1 Kit
```

Sem `pickup*`, `shirtSize`, items, sizes, admin CRUD neste ciclo.

### Frontend

Rota: `/kits` → `MyKitsPage`  
Adapter: `createHttpGetMyKits()` — sem argumento `userId`  
Gate anônimo: `/auth/login?returnUrl=/kits`

## Aspiracional (não implementado)

| Método | Endpoint | Nota |
|---|---|---|
| `GET` | `/kits` | Catálogo público — futuro |
| `GET` | `/kits/:id` | Detalhe público — futuro |
| `GET` | `/events/:eventId/kits` | Catálogo por evento — futuro |
| `POST/PATCH/DELETE` | `/kits` | Admin CRUD — futuro |
| `GET` | `/users/me/registrations` | Aspiracional — usar `/events/me/registrations` |
| `GET` | `/users/me/kits` | **Não implementar** — domínio Events |

Campos futuros (Known Debt): `pickupLocation`, `pickupStart`, `pickupEnd`, `shirtSize`, PATCH tamanho, Concierge, QR.
