import { HttpException, HttpStatus } from "@nestjs/common";

/**
 * Kit Pickup Operations — MVP operator allowlist (Phase 2.1).
 * Not a full RBAC. Reads KIT_PICKUP_OPERATOR_USER_IDS from env.
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
  allowlist: Iterable<string> = parseKitPickupOperatorIds(
    process.env.KIT_PICKUP_OPERATOR_USER_IDS,
  ),
): boolean {
  const set = allowlist instanceof Set ? allowlist : new Set(allowlist);
  return set.has(userId);
}

/**
 * @throws HttpException 403 when userId is not in the operator allowlist
 */
export function assertKitPickupOperator(
  userId: string,
  allowlist?: Iterable<string>,
): void {
  const ids =
    allowlist ??
    parseKitPickupOperatorIds(process.env.KIT_PICKUP_OPERATOR_USER_IDS);
  if (!isKitPickupOperator(userId, ids)) {
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
