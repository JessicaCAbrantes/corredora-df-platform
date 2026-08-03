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

## Operational docs

| Doc | Conteúdo |
|---|---|
| [seeding.md](./seeding.md) | Política de seed, fail-closed em production, `ALLOW_DB_SEED` (3.3-C) |
| [backup.md](./backup.md) | `pg_dump` / restore + backups gerenciados (3.3-C) |
| [checklist.md](./checklist.md) | Checklist pré/pós deploy e review de migrations (3.3-C) |
| [fase-3.3-d-deferred.md](./fase-3.3-d-deferred.md) | 3.3-D: CHECKs/índices **deferred** (decisão consciente) |

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

Este “drift” Prisma × Postgres é **intencional** (FASE 3.3-B). Comentários equivalentes estão no model `KitPickupRequest`.

### Checklist de review de migrations

Ver [checklist.md](./checklist.md). Em resumo: **não** `DROP` o índice parcial sem redesign de produto.

## Foreign keys para `User` (resumo)

| Origem | Campo | `onDelete` |
|---|---|---|
| `event_registrations` | `user_id` | Restrict |
| `kit_pickup_requests` | `user_id` | Restrict |
| `kit_pickup_requests` | `picked_up_by`, `custody_by`, `ready_by`, `delivered_by` | Restrict |
| `pickup_term_acceptances` | `accepted_by_user_id` | Restrict |

## FASE 3.3 status

| Sprint | Status |
|---|---|
| 3.3-A User Foreign Keys | Done |
| 3.3-B Audit FKs + partial unique docs | Done |
| 3.3-C Seed policy + backup/checklist | Done |
| 3.3-D CHECKs + indexes | **Deferred** — see [fase-3.3-d-deferred.md](./fase-3.3-d-deferred.md) |

## Roadmap

- Payments hardening → **FASE 3.4**
- Observability → **FASE 3.5**
- Containers → **FASE 3.6**
- Deploy / CD → **FASE 3.7 / 3.8**
