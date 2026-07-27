# API — Plataforma Corredora DF

Contrato oficial entre Frontend (Next.js) e Backend (NestJS).

## Objetivo

Definir como Frontend e Backend se comunicam **antes** de qualquer endpoint ser implementado. Esta documentação é a fonte de verdade para ambas as equipes.

## Base URL

```text
Desenvolvimento:  http://localhost:3001/api/v1
Staging:          https://staging-api.corredoradf.com.br/api/v1
Produção:         https://api.corredoradf.com.br/api/v1
```

## Convenções

| Tópico | Documento |
|---|---|
| Formato de resposta | [response-pattern.md](./response-pattern.md) |
| Paginação | [pagination.md](./pagination.md) |
| Erros | [errors.md](./errors.md) |
| Versionamento | [versioning.md](./versioning.md) |

## Recursos

| Recurso | Documento | Permissões |
|---|---|---|
| Autenticação | [auth.md](./auth.md) | Público |
| Usuários | [users.md](./users.md) | Autenticado |
| Eventos | [events.md](./events.md) | Público / Admin |
| Parceiros | [partners.md](./partners.md) | Público / Admin |
| Cupons | [coupons.md](./coupons.md) | Autenticado / Admin |
| Kits | [kits.md](./kits.md) | Público / Admin |
| Comunidade | [community.md](./community.md) | Autenticado |
| Blog | [blog.md](./blog.md) | Público / Admin |
| Notificações | [notifications.md](./notifications.md) | Autenticado |
| Anúncios | [ads.md](./ads.md) | Público / Admin |

## Padrão REST

- Recursos nomeados com substantivos no plural (`/events`, `/partners`).
- Métodos HTTP semânticos (GET, POST, PUT, PATCH, DELETE).
- Status codes padronizados (ver [errors.md](./errors.md)).
- Respostas no formato único (ver [response-pattern.md](./response-pattern.md)).
- Versionamento via URL prefix (ver [versioning.md](./versioning.md)).

## Autenticação

```text
Authorization: Bearer <access_token>
```

Tokens emitidos via `/auth/login`. Refresh via `/auth/refresh`. Detalhes em [auth.md](./auth.md).

## Permissões

| Nível | Descrição | Acesso |
|---|---|---|
| `public` | Sem autenticação | Leitura de conteúdo público |
| `authenticated` | Usuário logado | Perfil, cupons, comunidade |
| `admin` | Administrador | CRUD de todos os recursos |

## Headers comuns

| Header | Valor | Obrigatório |
|---|---|---|
| `Content-Type` | `application/json` | Em requests com body |
| `Accept` | `application/json` | Sim |
| `Authorization` | `Bearer <token>` | Endpoints autenticados |
| `Accept-Language` | `pt-BR` | Opcional (futuro: i18n) |

## Relação com o Frontend

| Feature Frontend | Recurso API |
|---|---|
| `features/auth/` | `auth.md` |
| `features/profile/` | `users.md` |
| `features/events/` | `events.md` |
| `features/partners/` | `partners.md` |
| `features/coupons/` | `coupons.md` |
| `features/community/` | `community.md` |
| `features/blog/` | `blog.md` |
| `features/home/` | `events.md`, `partners.md`, `ads.md` |

## Estado atual

Apenas documentação de contrato. Nenhum endpoint implementado. Nenhuma dependência instalada.

## Evolução

1. **Agora** — contratos de API (este ticket)
2. **Sprint futura** — NestJS + Prisma + implementação
3. **OpenAPI** — gerar spec a partir dos contratos
4. **SDK** — cliente tipado em `apps/web/services/`
