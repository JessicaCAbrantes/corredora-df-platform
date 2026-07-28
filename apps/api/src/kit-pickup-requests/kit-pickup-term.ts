import { createHash } from "node:crypto";

/** Canonical term version for Kit Pickup Request MVP (Phase 2). */
export const KIT_PICKUP_TERM_VERSION = "v1";

/**
 * Official Portuguese term text — content lives in code for MVP.
 * Hash is stored on acceptance for immutability checks.
 */
export const KIT_PICKUP_TERM_TEXT = `Termo de Serviço de Retirada de Kit — Corredora DF (v1)

Ao aceitar este termo, declaro que:
1. Solicito à Corredora DF o serviço de retirada/custódia do kit do evento indicado;
2. As informações fornecidas (incluindo código de inscrição externa, quando aplicável) são verdadeiras;
3. Autorizo a Corredora DF a retirar o kit em meu nome junto à organização do evento, quando cabível;
4. Entendo que a taxa cobrada, se houver, refere-se ao serviço de retirada e não substitui a inscrição no evento;
5. Comprometo-me a retirar o kit no local e horário informados pela Corredora DF.

Este aceite é registrado com data/hora e versão do termo.`;

export function hashKitPickupTerm(content: string = KIT_PICKUP_TERM_TEXT): string {
  return createHash("sha256").update(content, "utf8").digest("hex");
}
