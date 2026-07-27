# Database

Documentação do banco de dados da plataforma.

## Objetivo

Registrar modelagem de dados, schemas, migrations, convenções de nomenclatura e estratégias de persistência.

## Escopo

| Tópico | Local no repositório |
|---|---|
| Schemas e migrations | `database/` (raiz) |
| Contratos de API | [api/](../api/) |
| Tipos compartilhados | `packages/types/` |

## Stack planejada

- **PostgreSQL** — banco relacional principal
- **Prisma** — ORM e gerenciamento de migrations
- **Docker** — ambiente local de desenvolvimento

## Convenções (planejadas)

| Elemento | Convenção | Exemplo |
|---|---|---|
| Tabelas | snake_case, plural | `events`, `user_profiles` |
| Colunas | snake_case | `created_at`, `event_id` |
| IDs | UUID ou prefixado | `evt_01HXYZ` |
| Timestamps | `created_at`, `updated_at` | ISO 8601 UTC |
| Soft delete | `deleted_at` | Nullable timestamp |

## Entidades principais (previstas)

```text
users ──┬── events (inscrições)
        ├── coupons (resgates)
        ├── community_posts
        └── notifications

events ──┬── partners
         ├── kits
         └── registrations

partners ── coupons
blog_posts
ads
```

## Documentos futuros

- `schema.md` — diagrama ER
- `migrations.md` — estratégia de migrations
- `seeding.md` — dados de desenvolvimento

## Estado atual

Pasta `database/` na raiz preparada. Nenhum schema implementado.
