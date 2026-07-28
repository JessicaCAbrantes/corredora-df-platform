# Kit Pickup Services

Ofertas públicas de serviço de retirada de kit (Fase 1 — teaser Home).

## Objetivo

Catálogo público de **serviços de retirada**, associados a eventos (`internal` ou `external`).  
Não confundir com My Kits autenticado (`GET /events/me/kits` · rota `/kits`).

## Status MVP (Fase 1)

| Capacidade | Status |
|---|---|
| `Event.registrationMode` (`internal` \| `external`) | ✅ |
| Model `KitPickupService` | ✅ |
| `GET /kit-pickup-services` público | ✅ |
| Home teaser dinâmico | ✅ |
| `KitPickupRequest` / termo / pagamento / handover | ✅ Request+Termo+Gateway (Fase 2) · Operação = Fase 2.1 |
| Página `/kit-pickup` | ✅ UI mínima participante |

## Endpoints

| Método | Endpoint | Permissão |
|---|---|---|
| `GET` | `/kit-pickup-services` | Público |

## GET /kit-pickup-services

### Query

| Parâmetro | Default | Descrição |
|---|---|---|
| `page` | `1` | Página |
| `perPage` | `4` | Máximo `100` |
| `serviceAvailable` | `true` | Filtrar ofertas disponíveis |
| `sort` | `pickupStartAt` | `pickupStartAt` \| `title` \| `createdAt` |
| `order` | `asc` | `asc` \| `desc` |

### Resposta (item)

`id`, `title`, `event { id, name, slug }`, `statusLabel`, `pickupLabel`, `serviceAvailable`, `feeAmount`, `feeCurrency`, `registrationMode`.

**Não retorna:** PII, `paymentStatus`, `term`, `handover`, `userId`, `registrationId`.

## Distinções

| Superfície | Endpoint / rota | Papel |
|---|---|---|
| Catálogo público (Home) | `GET /kit-pickup-services` | Oferta |
| My Kits | `GET /events/me/kits` · `/kits` | Kits do usuário autenticado |
| Prisma `Kit` | 1:1 com Event | Kit do evento (mínimo) |

## Known Debt (Fase 2.1+)

Operação (pickup/custody/handover/delivery) · Admin · estoque · QR.
