# concierge

Feature de serviço de concierge.

## Objetivo

Oferecer atendimento personalizado — suporte a inscrições, dúvidas sobre eventos, recomendações e serviços premium.

## Exemplos de uso

```tsx
// app/concierge/page.tsx
import { ConciergePage } from "@/features/concierge";
```

## Boas práticas

- Formulários de contato e chat isolados nesta feature.
- Reutilizar `Input`, `Button` e `Modal` de `components/ui`.
- Serviços de comunicação em `features/concierge/services/`.
