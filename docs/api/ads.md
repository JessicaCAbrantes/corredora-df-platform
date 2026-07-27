# Ads

Anúncios e banners promocionais.

## Objetivo

Exibir banners e anúncios em posições estratégicas da plataforma — home, eventos, sidebar.

## Permissões

| Endpoint | Público | Autenticado | Admin |
|---|---|---|---|
| Listar anúncios ativos | ✅ | ✅ | ✅ |
| Criar/editar/deletar | — | — | ✅ |

## Endpoints

| Método | Endpoint | Descrição | Permissão |
|---|---|---|---|
| `GET` | `/ads` | Listar anúncios ativos | Público |
| `GET` | `/ads/:id` | Detalhe do anúncio | Público |
| `POST` | `/ads` | Criar anúncio | Admin |
| `PATCH` | `/ads/:id` | Atualizar anúncio | Admin |
| `DELETE` | `/ads/:id` | Remover anúncio | Admin |
| `POST` | `/ads/:id/impression` | Registrar impressão | Público |
| `POST` | `/ads/:id/click` | Registrar clique | Público |

## Estrutura das respostas

### GET /ads

```json
{
  "data": [
    {
      "id": "ad_01ABC",
      "title": "Nike Running — Novos tênis",
      "image": "https://...",
      "targetUrl": "https://nike.com/running",
      "position": "home_banner",
      "partnerId": "ptr_01ABC",
      "startDate": "2026-06-01T00:00:00Z",
      "endDate": "2026-08-31T23:59:59Z",
      "active": true
    }
  ]
}
```

## Posições

| Posição | Descrição |
|---|---|
| `home_banner` | Banner principal da home |
| `home_sidebar` | Sidebar da home |
| `events_banner` | Banner na listagem de eventos |
| `blog_sidebar` | Sidebar do blog |

## Filtros

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `position` | string | Posição do anúncio |
| `active` | boolean | Apenas ativos (default: true) |

## Ordenação

| Campo | Default |
|---|---|
| `startDate` | `desc` |

## Códigos de erro

| Código | Status | Quando |
|---|---|---|
| `AD_NOT_FOUND` | 404 | Anúncio não existe |

## Relação com o Frontend

`features/home/` — banners na página inicial. Tracking de impressões/cliques.
