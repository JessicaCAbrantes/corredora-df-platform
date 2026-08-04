import { HttpException } from "@nestjs/common";

/**
 * FASE 3.4-C4 — Explicit webhook domain error classification.
 * Do NOT treat every 4xx as permanent ACK.
 */

/** Authenticated domain conflicts — ACK 200 after ledger PROCESSED (no Stripe storm). */
export const PERMANENT_DOMAIN_WEBHOOK_CODES = new Set([
  "PAYMENT_MISMATCH",
  "REQUEST_MISMATCH",
  "AMOUNT_MISMATCH",
  "CURRENCY_MISMATCH",
  "REQUEST_CANCELLED",
]);

/**
 * May be a create↔webhook race — leave RECEIVED and return 500 so the provider retries.
 * Do not auto-ACK in this phase.
 */
export const RETRYABLE_DOMAIN_WEBHOOK_CODES = new Set(["PAYMENT_NOT_FOUND"]);

export function getWebhookHttpErrorCode(error: unknown): string | null {
  if (!(error instanceof HttpException)) {
    return null;
  }
  const body = error.getResponse();
  if (typeof body === "object" && body !== null && "error" in body) {
    const nested = (body as { error?: { code?: unknown } }).error;
    if (nested && typeof nested.code === "string") {
      return nested.code;
    }
  }
  return null;
}

export function isPermanentDomainWebhookError(error: unknown): boolean {
  if (!(error instanceof HttpException)) {
    return false;
  }
  const status = error.getStatus();
  if (status < 400 || status >= 500) {
    return false;
  }
  const code = getWebhookHttpErrorCode(error);
  return code != null && PERMANENT_DOMAIN_WEBHOOK_CODES.has(code);
}

export function isRetryableDomainWebhookError(error: unknown): boolean {
  if (!(error instanceof HttpException)) {
    return false;
  }
  const code = getWebhookHttpErrorCode(error);
  return code != null && RETRYABLE_DOMAIN_WEBHOOK_CODES.has(code);
}

export function isSignatureVerifyError(message: string): boolean {
  return message === "MISSING_SIGNATURE" || message === "INVALID_SIGNATURE";
}
