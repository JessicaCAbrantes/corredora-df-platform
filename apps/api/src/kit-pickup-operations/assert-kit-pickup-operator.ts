import { HttpException, HttpStatus } from "@nestjs/common";

/**
 * Kit Pickup Operations — MVP operator allowlist (Phase 2.1).
 * Not a full RBAC. Allowlist must come from validated ConfigService.
 */
export function parseKitPickupOperatorIds(
  raw: string | string[] | null | undefined,
): Set<string> {
  if (Array.isArray(raw)) {
    return new Set(raw.map((id) => id.trim()).filter(Boolean));
  }
  if (typeof raw !== "string" || raw.trim() === "") {
    return new Set();
  }
  return new Set(
    raw
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id.length > 0),
  );
}

export function isKitPickupOperator(
  userId: string,
  allowlist: Iterable<string>,
): boolean {
  const set = allowlist instanceof Set ? allowlist : new Set(allowlist);
  return set.has(userId);
}

/**
 * @throws HttpException 403 when userId is not in the operator allowlist
 */
export function assertKitPickupOperator(
  userId: string,
  allowlist: Iterable<string>,
): void {
  if (!isKitPickupOperator(userId, allowlist)) {
    throw new HttpException(
      {
        status: "error",
        error: {
          code: "FORBIDDEN",
          message: "Operação restrita a operadores autorizados.",
          status: 403,
        },
      },
      HttpStatus.FORBIDDEN,
    );
  }
}
