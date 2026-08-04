# Events

Eventos e corridas da plataforma.

## Objetivo

Listar, detalhar e gerenciar eventos esportivos — inscrições, categorias e filtros.

## Permissões

| Endpoint | Público | Autenticado | Admin |
|---|---|---|---|
| Listar eventos | ✅ | ✅ | ✅ |
| Ver detalhe | ✅ | ✅ | ✅ |
| Inscrever-se | — | ✅ | — |
| Criar/editar/deletar | — | — | ✅ |

## Endpoints

| Método | Endpoint | Descrição | Permissão |
|---|---|---|---|
| `GET` | `/events` | Listar eventos | Público |
| `GET` | `/events/by-slug/:slug` | Detalhe do evento por slug | Público |
| `GET` | `/events/me/registrations` | Minhas inscrições (somente leitura) | Autenticado |
| `GET` | `/events/me/kits` | Meus kits / retirada (somente leitura) | Autenticado |
| `POST` | `/events/:id/register` | Inscrever-se | Autenticado |
| `DELETE` | `/events/:id/register` | Cancelar inscrição | Autenticado |
| `POST` | `/events` | Criar evento | Admin |
| `PATCH` | `/events/:id` | Atualizar evento | Admin |
| `DELETE` | `/events/:id` | Remover evento | Admin |

---

## Conceitos: ciclo de vida × inscrição (listagem)

O ciclo de vida do evento e o estado da inscrição são conceitos **separados** e NÃO são intercambiáveis.

### `status` — ciclo de vida do evento

```text
active | cancelled | completed
```

| Valor | Semântica |
|---|---|
| `active` | Evento publicado e vigente no calendário |
| `cancelled` | Evento cancelado |
| `completed` | Evento já ocorrido / encerrado como prova |

O filtro `?status=` opera **somente** sobre o ciclo de vida.

`status` **NÃO** indica se as inscrições estão abertas.

### `registrationStatus` — fase da inscrição (listagem)

O contrato de **listagem** (`GET /events`) expõe explicitamente:

```text
open | closed | upcoming
```

| Valor | Semântica |
|---|---|
| `open` | Janela de inscrição aberta |
| `upcoming` | Evento ativo; inscrição ainda não abriu |
| `closed` | Inscrição encerrada (prazo, lotação ou política) |

O backend/domain é a fonte de verdade. O frontend **NÃO** deriva `upcoming` a partir de datas nem de `status`.

Para eventos `cancelled` ou `completed`, a API **DEVE** retornar:

```text
registrationStatus = closed
registrationOpen = false
```

> **Nota — detalhe (`GET /events/by-slug/:slug`):** a listagem formaliza `registrationStatus`. O detalhe MVP A também expõe `registrationStatus` + `registrationOpen` (mesma regra da listagem).

### `registrationOpen` — filtro booleano derivado

```text
registrationOpen === (registrationStatus === "open")
```

Conveniência de descoberta. **NÃO** representa autorização, elegibilidade nem garantia de sucesso do `POST .../register`.

`status` e `registrationOpen` são eixos independentes (AND):

```text
GET /api/v1/events?status=active&registrationOpen=true
```

→ eventos ativos com inscrição atualmente aberta.

### `price` — preço de inscrição (listagem)

Campo **obrigatório** no item de `GET /events`.

```ts
price: {
  amount: number;   // unidades principais da moeda (ex.: 120 = R$ 120,00)
  currency: string; // ISO 4217 (ex.: "BRL")
} | null
```

Semântica:

| Valor | Significado |
|---|---|
| `{ amount, currency }` | Evento possui preço de inscrição |
| `null` | Evento é **explicitamente gratuito** |
| campo ausente | **Inválido** — não permitido no contrato |

`price` **não** representa lote, desconto, cupom nem elegibilidade de inscrição.

`amount` usa a **unidade principal** da moeda (reais, não centavos).

#### Fronteira Frontend (listagem)

```text
EventDTO.price
  { amount, currency }  → EventListItem.price = label formatada (pt-BR)
  null                  → EventListItem.price omitido
                              → EventCard exibe freeLabel ("Gratuito")
```

A omissão de `price` no Application ocorre **somente depois** de interpretar `null`. Não significa “preço desconhecido”.

> **Nota — detalhe (`GET /events/by-slug/:slug`):** o detalhe MVP A reutiliza o mesmo `price` da listagem (`{ amount, currency } | null`). Labels de apresentação (`R$ …`, “Gratuito”) ficam no Adapter frontend.

### Mapeamento para apresentação (`EventCard`)

O `EventCard` usa estado presentacional `open | closed | upcoming`. A fronteira Adapter/Application mapeia:

| API | `EventCard.status` |
|---|---|
| `status=active`, `registrationStatus=open` | `open` |
| `status=active`, `registrationStatus=upcoming` | `upcoming` |
| `status=active`, `registrationStatus=closed` | `closed` |
| `status=cancelled` | `closed` |
| `status=completed` | `closed` |

`status=active` **NÃO** implica automaticamente `EventCard.status=open`.

O Card permanece presentacional — sem HTTP, elegibilidade, auth ou regras de inscrição.

---

## Estrutura das respostas

### GET /events (coleção)

Envelope:

```json
{
  "data": [],
  "meta": {}
}
```

`meta` segue o `PaginationMeta` completo em [pagination.md](./pagination.md) (seis campos obrigatórios).

Exemplo:

```json
{
  "data": [
    {
      "id": "evt_01HXYZ",
      "name": "Maratona de Brasília",
      "slug": "maratona-brasilia-2026",
      "date": "2026-06-15T06:00:00Z",
      "city": "Brasília",
      "category": "marathon",
      "distance": "42km",
      "status": "active",
      "registrationStatus": "open",
      "registrationOpen": true,
      "price": { "amount": 149, "currency": "BRL" },
      "coverImage": "https://..."
    },
    {
      "id": "evt_01HFREE",
      "name": "5K Iniciantes DF",
      "slug": "5k-iniciantes-df",
      "date": "2026-08-02T07:00:00Z",
      "city": "Brasília",
      "category": "5k",
      "distance": "5km",
      "status": "active",
      "registrationStatus": "upcoming",
      "registrationOpen": false,
      "price": null,
      "coverImage": "https://..."
    }
  ],
  "meta": {
    "page": 1,
    "perPage": 20,
    "total": 42,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### GET /events/by-slug/:slug (item)

Lookup **exclusivo** por `slug` (unique). Não resolve por `id`.

Path param:

| Param | Tipo | Descrição |
|---|---|---|
| `slug` | string | Slug único do evento |

Envelope de sucesso (HTTP **200**):

```json
{
  "data": {
    "id": "evt_01_meia",
    "slug": "meia-maratona-brasilia",
    "name": "Meia Maratona de Brasília",
    "date": "2026-08-16T10:00:00.000Z",
    "city": "Brasília",
    "distance": "21K",
    "status": "active",
    "registrationStatus": "open",
    "registrationOpen": true,
    "price": { "amount": 149, "currency": "BRL" },
    "coverImage": "https://example.com/events/meia-maratona-brasilia.jpg",
    "kit": {
      "available": false,
      "description": "Informações do kit em breve."
    },
    "route": {
      "available": false,
      "summary": "Percurso ainda não divulgado.",
      "distanceLabel": "21K"
    },
    "schedule": {
      "items": []
    },
    "regulation": {
      "summary": "Participação sujeita ao regulamento oficial da prova.",
      "href": "#regulamento",
      "linkLabel": "Ver regulamento"
    }
  }
}
```

Campos efetivos (MVP A):

| Campo | Origem |
|---|---|
| `id`, `slug`, `name`, `date`, `city`, `distance`, `status`, `coverImage` | Prisma |
| `registrationStatus`, `registrationOpen` | mesma regra da listagem |
| `price` | mesma semântica da listagem (`null` = gratuito) |
| `kit`, `route`, `schedule`, `regulation` | **defaults degradados** (sem persistência rica neste MVP) |

Defaults MVP (sempre, enquanto não houver dados ricos):

```text
kit.available = false
kit.description = "Informações do kit em breve."
route.available = false
route.summary = "Percurso ainda não divulgado."
route.distanceLabel = distance do evento
schedule.items = []
regulation.summary = "Participação sujeita ao regulamento oficial da prova."
regulation.href = "#regulamento"
regulation.linkLabel = "Ver regulamento"
```

Slug inexistente → HTTP **404**:

```json
{
  "status": "error",
  "error": {
    "code": "EVENT_NOT_FOUND",
    "message": "Evento não encontrado.",
    "status": 404
  }
}
```

Não retorna neste MVP: `description`, `partners`, `maxParticipants`, `currentParticipants`, `kits[]`, `category` (category permanece na listagem).

---

## Paginação (listagem)

Parâmetros (contrato em [pagination.md](./pagination.md)):

| Parâmetro | Tipo | Default | Limite |
|---|---|---|---|
| `page` | number | `1` | mínimo `1` |
| `perPage` | number | `20` | máximo `100` |

Coleção vazia após filtros: HTTP **200** com `data: []` e `total: 0` — **não** `404`.

---

## Filtros (listagem)

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `search` | string | Busca por nome |
| `status` | string | Lifecycle: `active`, `cancelled`, `completed` |
| `category` | string | `marathon`, `half-marathon`, `5k`, `10k`, `trail` |
| `city` | string | Cidade do evento |
| `dateFrom` | ISO date | Data mínima do evento |
| `dateTo` | ISO date | Data máxima do evento |
| `registrationOpen` | boolean | `true` ⇔ `registrationStatus === "open"` |
| `page` | number | Página (ver paginação) |
| `perPage` | number | Itens por página |
| `sort` | string | Campo de ordenação |
| `order` | string | `asc` \| `desc` |

Combinação de filtros: **AND**.

Exemplo:

```text
GET /api/v1/events?status=active&category=5k&registrationOpen=true
```

### Category

Enum oficial:

```text
marathon | half-marathon | 5k | 10k | trail
```

`distance` no card (ex.: `"21K"`) é label de apresentação — **não** é o enum `category`.

---

## Ordenação (listagem)

Defaults oficiais de **Events** (quando `sort`/`order` omitidos):

```text
sort=date
order=asc
```

Portanto:

```text
GET /api/v1/events
```

é equivalente, para ordenação, a:

```text
GET /api/v1/events?sort=date&order=asc
```

| Parâmetro | Valores permitidos |
|---|---|
| `sort` | `date`, `name`, `createdAt` |
| `order` | `asc`, `desc` |

Valor inválido → `400 VALIDATION_ERROR` ([errors.md](./errors.md)).

Este default (`date` + `asc`) é **específico de Events** e não substitui o default global de outros recursos em [pagination.md](./pagination.md).

---

## Códigos de erro

| Código | Status | Quando |
|---|---|---|
| `UNAUTHORIZED` | 401 | Sem identidade (Auth Boundary) |
| `EVENT_NOT_FOUND` | 404 | Evento não existe |
| `EVENT_REGISTRATION_CLOSED` | 422 | Inscrições encerradas (`upcoming` / `closed`) |
| `EVENT_INACTIVE` | 422 | Evento `cancelled` ou `completed` |
| `EVENT_FULL` | 422 | Vagas esgotadas (**não emitido no MVP atual**) |
| `ALREADY_REGISTERED` | 409 | Já inscrito |

---

## POST /events/:id/register

Inscrição autenticada por **`Event.id`** (nunca slug).

Body: `{}` — `userId` **não** vem do body.

MVP atual usa a [Real Auth Boundary](../../apps/api/src/auth/README.md) (cookie HttpOnly `corredora_session`). Sem cookie válido → `401`. Usuários são semeados (sem cadastro público neste ciclo).

### Sucesso (201)

```json
{
  "data": {
    "registrationId": "clx..."
  }
}
```

### Erros

Ver tabela de códigos acima. Envelope:

```json
{
  "status": "error",
  "error": {
    "code": "ALREADY_REGISTERED",
    "message": "Usuário já está inscrito nesta corrida.",
    "status": 409
  }
}
```

Elegibilidade:

```text
status === active AND registrationStatus === open
```

`registrationOpen` **não** é fonte independente de verdade nesta operação.

---

## DELETE /events/:id/register

Cancelamento autenticado por **`Event.id`** (nunca slug). Hard delete de `EventRegistration`.

Sem body — `userId` **não** vem do cliente. Identidade via Real Auth Boundary.

Ownership:

```text
DELETE where { eventId: :id, userId: resolveCurrentUserId(request) }
```

### Sucesso (204)

Sem body.

### Erros

| Código | HTTP | Quando |
|---|---|---|
| `UNAUTHORIZED` | 401 | Sem sessão válida |
| `EVENT_NOT_FOUND` | 404 | Evento não existe |
| `REGISTRATION_NOT_FOUND` | 404 | Usuário não está inscrito (ou 2º DELETE) |

Após o cancelamento, `GET /events/me/registrations` e `GET /events/me/kits` deixam de incluir o evento.  
`POST /events/:id/register` pode ser usado novamente (unique liberado).

**Fora deste MVP:** soft delete, `cancelledAt`, janela de cancelamento, reembolso, kit retirado.

---

## GET /events/me/registrations

Histórico **somente leitura** das inscrições do usuário autenticado.

Identidade **exclusivamente** via Real Auth Boundary (`corredora_session` HttpOnly).  
Não aceita `userId` em query, body, params ou headers.

Rota estática registrada **antes** de rotas paramétricas (`:id`), para não capturar `me` como id.

### Sucesso (200)

```json
{
  "data": [
    {
      "registrationId": "clx...",
      "registeredAt": "2026-07-26T18:00:00.000Z",
      "event": {
        "id": "evt_e2e_reg_open",
        "slug": "e2e-registro-livre",
        "name": "E2E Registro Livre DF",
        "date": "2026-12-01T00:00:00.000Z",
        "city": "Brasília",
        "distance": "5K",
        "status": "active",
        "registrationStatus": "open",
        "coverImage": "..."
      }
    }
  ]
}
```

Ordenação: `createdAt DESC` (mais recente primeiro).

Sem inscrições: `{ "data": [] }` com `200`.

### Erros

| Código | HTTP | Quando |
|---|---|---|
| `UNAUTHORIZED` | 401 | Sem sessão válida |

### Known Debt (não resolvido neste MVP)

- `EventRegistration.userId` → `User.id` com FK (`ON DELETE RESTRICT`) — entregue na FASE 3.3-A
- fixtures históricas `user_mock_01` (se ainda existirem em DBs antigos; seeds atuais usam ids determinísticos)
- endpoint aspiracional `GET /users/me/registrations` (não implementar — ver `docs/api/users.md`)
- ausência de paginação
- soft delete / auditoria de cancelamento (MVP usa hard delete)

---

## GET /events/me/kits

Histórico **somente leitura** dos kits vinculados às inscrições do usuário autenticado (Retirada de Kits MVP).

Identidade **exclusivamente** via Real Auth Boundary.  
Não aceita `userId` em query, body, params ou headers.

**Não confundir** com o stub `kit` de `GET /events/by-slug/:slug` (marketing no detalhe da corrida).

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

Sem kits: `{ "data": [] }` com `200`.

Detalhe do contrato e Known Debt de pickup/shirtSize: ver [`docs/api/kits.md`](./kits.md).

---

## Fronteira Frontend (listagem)

```text
GET /api/v1/events
        ↓
Infrastructure Adapter
        ↓
Application EventListResult
        ↓
EventsListingPage
        ↓
EventCard
```

O Adapter traduz `EventDTO` + `PaginationMeta` + erros HTTP para o contrato Application/UI.

O `EventCard` não conhece HTTP, envelope, meta de API, auth nem elegibilidade.

Não é exigido Presenter, ViewModel, Repository ou Mapper layer dedicado — apenas a tradução na fronteira Adapter/Application.

## Relação com o Frontend

`features/events/` — listagem, detalhe, inscrição.
