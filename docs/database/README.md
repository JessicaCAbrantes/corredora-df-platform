# Database

Documentação do banco de dados da plataforma Corredora DF.

## Fonte da verdade

| Artefato | Caminho |
|---|---|
| Schema Prisma | [`apps/api/prisma/schema.prisma`](../../apps/api/prisma/schema.prisma) |
| Migrations | [`apps/api/prisma/migrations/`](../../apps/api/prisma/migrations/) |
| Seed (local/CI) | [`apps/api/prisma/seed.ts`](../../apps/api/prisma/seed.ts) |
| Postgres local | [`infrastructure/docker-compose.yml`](../../infrastructure/docker-compose.yml) |

## Stack

- **PostgreSQL** — banco relacional (ADR-006)
- **Prisma** — ORM + migrations em `apps/api/prisma`
- **Docker Compose** — Postgres de desenvolvimento (porta host **5433**)

## Convenções

| Elemento | Convenção |
|---|---|
| Tabelas | `snake_case`, plural (`@@map`) |
| Colunas | `snake_case` (`@map`) |
| FKs de domínio / auditoria para `User` | `onDelete: Restrict`, `onUpdate: Cascade` |
| Soft delete | não implementado (MVP) |

## Partial unique — Active Kit Pickup (decisão consciente)

Prisma **não** modela índices únicos parciais no `schema.prisma`.

O índice abaixo existe **somente** no PostgreSQL (migration `20260728010000_kit_pickup_requests`) e é a garantia de “uma solicitação ativa por `(user, service)`”:

```sql
CREATE UNIQUE INDEX "kit_pickup_requests_active_user_service_uidx"
ON "kit_pickup_requests" ("user_id", "kit_pickup_service_id")
WHERE "status" <> 'CANCELLED';
```

Linhas `CANCELLED` podem ser recriadas. O app também trata `P2002` / `ACTIVE_REQUEST_EXISTS`.

Este “drift” Prisma × Postgres é **intencional** (FASE 3.3-B). Comentários equivalentes estão no model `KitPickupRequest` e no SQL da migration.

### Checklist de review de migrations

Antes de aprovar qualquer migration futura:

1. Verificar se o SQL **não** contém `DROP INDEX "kit_pickup_requests_active_user_service_uidx"`.
2. Se `prisma migrate diff` sugerir remover esse índice, **rejeitar** a alteração salvo redesign explícito de produto.

## Foreign keys para `User` (resumo)

| Origem | Campo | `onDelete` |
|---|---|---|
| `event_registrations` | `user_id` | Restrict |
| `kit_pickup_requests` | `user_id` | Restrict |
| `kit_pickup_requests` | `picked_up_by`, `custody_by`, `ready_by`, `delivered_by` | Restrict |
| `pickup_term_acceptances` | `accepted_by_user_id` | Restrict |

## Documentos futuros (roadmap)

- Backup / restore runbook → FASE 3.3-D / ops
- Seeds fail-closed em production → FASE 3.3-C
- CHECK constraints seletivos → sprint própria (após 3.3-B)
