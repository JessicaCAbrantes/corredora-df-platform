# Notifications

Notificações para usuários.

## Objetivo

Enviar e gerenciar notificações — inscrições confirmadas, novos eventos, cupons, interações na comunidade.

## Permissões

Todos os endpoints requerem **autenticação**.

## Endpoints

| Método | Endpoint | Descrição | Permissão |
|---|---|---|---|
| `GET` | `/notifications` | Listar notificações | Autenticado |
| `GET` | `/notifications/unread-count` | Contagem não lidas | Autenticado |
| `PATCH` | `/notifications/:id/read` | Marcar como lida | Autenticado |
| `PATCH` | `/notifications/read-all` | Marcar todas como lidas | Autenticado |
| `DELETE` | `/notifications/:id` | Remover notificação | Autenticado |

## Estrutura das respostas

### GET /notifications

```json
{
  "data": [
    {
      "id": "ntf_01ABC",
      "type": "event_registration",
      "title": "Inscrição confirmada",
      "message": "Você está inscrito na Maratona de Brasília",
      "read": false,
      "actionUrl": "/events/evt_01HXYZ",
      "createdAt": "2026-06-18T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "perPage": 20, "total": 5, "totalPages": 1 }
}
```

## Tipos de notificação

| Tipo | Descrição |
|---|---|
| `event_registration` | Confirmação de inscrição |
| `event_reminder` | Lembrete de evento próximo |
| `coupon_available` | Novo cupom disponível |
| `community_interaction` | Curtida ou comentário |
| `system` | Avisos da plataforma |

## Filtros

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `read` | boolean | Filtrar lidas/não lidas |
| `type` | string | Tipo de notificação |

## Ordenação

| Campo | Default |
|---|---|
| `createdAt` | `desc` |

## Códigos de erro

| Código | Status | Quando |
|---|---|---|
| `NOTIFICATION_NOT_FOUND` | 404 | Notificação não existe |

## Relação com o Frontend

Badge de notificações no `Header`. Consumido por `features/navigation/` (futuro).
