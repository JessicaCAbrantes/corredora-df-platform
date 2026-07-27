# events

Feature de eventos e corridas.

## Objetivo

Listagem, detalhes, fluxo de inscrição, histórico read-only de inscrições e retirada read-only de kits.

## Rotas

- Listagem: `/corridas` → `EventsListingPage`
- Detalhe: `/corridas/[slug]` → `EventDetailsPage`
- Minhas inscrições: `/minhas-inscricoes` → `MyRegistrationsPage`
- Retirada de kits: `/kits` → `MyKitsPage`

## Minhas inscrições (MVP)

```text
/minhas-inscricoes
  → GET /api/v1/events/me/registrations (credentials: include)
  → lista | estado vazio
  → Cancelar inscrição → DELETE /api/v1/events/:id/register (confirm)
  → refetch lista
```

Anônimo / `401` → `/auth/login?returnUrl=/minhas-inscricoes`.

Adapters:
- `createHttpGetMyRegistrations()` — **sem** argumento `userId`
- `createHttpCancelEventRegistration(eventId)` — usa `event.id` (nunca slug)

Navegação para o evento usa `event.slug` → `/corridas/{slug}`.

Navbar autenticada: Perfil · Minhas inscrições · Sair.  
Navbar principal já inclui Retirada de Kits → `/kits`.

## Retirada de Kits (MVP)

```text
/kits
  → GET /api/v1/events/me/kits (credentials: include)
  → lista read-only | estado vazio
```

Anônimo / `401` → `/auth/login?returnUrl=/kits`.

Adapter: `createHttpGetMyKits()` — **sem** argumento `userId`.

Distinto do stub `EventKit` no detalhe da corrida (marketing). Este fluxo usa apenas kits persistidos vinculados a eventos em que o usuário está inscrito.

Sem PATCH de tamanho, pickup window, Concierge ou QR neste ciclo.

## Inscrição

```text
EventCTA.onAction
  → useRegisterForEventAction (Handler — contrato estável)
  → getSession (GET /api/v1/auth/me, credentials: include)
  → RegisterForEvent port
        ↑
   Mock ( ?register= | ?mock=1 )  |  HttpRegisterForEvent (default)
  → RegistrationUiState
```

Anonymous (`getSession` → null) → `/auth/login?returnUrl=/corridas/{slug}`.

Application fala a linguagem do negócio (`RegisterForEventResult`).  
Infrastructure fala HTTP (`POST /api/v1/events/:id/register`).

### Base URL

`NEXT_PUBLIC_API_URL` (sem trailing slash) + `/api/v1/events/:id/register`

### Query params

| Query | Efeito |
|---|---|
| (default) | HTTP Adapter + sessão real via `/auth/me` |
| `?mock=1` | Força Mock de Registration (sucesso) |
| `?register=<code>` | Mock de Registration com resultado controlado |

Códigos: `success`, `ALREADY_REGISTERED`, `REGISTRATION_CLOSED`, `EVENT_FULL`, `EVENT_INACTIVE`, `EVENT_NOT_FOUND`, `UNKNOWN`

## Arquitetura

Opção A — sem Presenter/Mapper/Repository. Handler não importa Infrastructure.
