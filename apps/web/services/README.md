# services/

Camada de acesso a dados e comunicação com APIs.

## Objetivo

Isolar chamadas HTTP à API da plataforma (NestJS) e a serviços externos. Componentes e hooks consomem serviços — nunca `fetch` direto.

## Exemplos de uso

```tsx
import { apiClient } from "@/services";

const events = await apiClient.get("/events");
```

```tsx
// Dentro de uma feature — serviço específico
import { getEvents } from "@/features/events/services";
```

## Boas práticas

- Serviços específicos de um domínio ficam na feature correspondente.
- Aqui ficam apenas serviços transversais (cliente base da API, upload).
- Exportar pelo `index.ts` (barrel) desta pasta.
- Tratar erros e tipar respostas com TypeScript.
