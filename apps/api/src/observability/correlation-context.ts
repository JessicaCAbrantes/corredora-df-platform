/**
 * FASE 3.5-C — Request-scoped correlation context (AsyncLocalStorage).
 * Docs: docs/observability/correlation.md
 */
import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

export const CORRELATION_ID_HEADER = "x-correlation-id";

type CorrelationStore = {
  correlationId: string;
};

const storage = new AsyncLocalStorage<CorrelationStore>();

export function generateCorrelationId(): string {
  return randomUUID();
}

export function getCorrelationId(): string | undefined {
  return storage.getStore()?.correlationId;
}

export function runWithCorrelationId<T>(
  correlationId: string,
  fn: () => T,
): T {
  return storage.run({ correlationId }, fn);
}

/**
 * Prefer inbound header when present and non-empty; otherwise generate.
 * Rejects oversized / non-printable values by regenerating.
 */
export function resolveInboundCorrelationId(
  headerValue: string | string[] | undefined,
): string {
  const raw = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  const trimmed = typeof raw === "string" ? raw.trim() : "";
  if (
    trimmed.length >= 8 &&
    trimmed.length <= 128 &&
    /^[\w.:-]+$/.test(trimmed)
  ) {
    return trimmed;
  }
  return generateCorrelationId();
}
