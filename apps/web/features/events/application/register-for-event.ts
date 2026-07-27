/**
 * Application contract — RegisterForEvent.
 * Infrastructure (HTTP) stays behind this port later.
 */

export type RegisterForEventInput = {
  eventId: string;
  userId: string;
};

export type RegisterForEventError =
  | "UNAUTHENTICATED"
  | "EVENT_NOT_FOUND"
  | "REGISTRATION_CLOSED"
  | "EVENT_FULL"
  | "ALREADY_REGISTERED"
  | "EVENT_INACTIVE"
  | "UNKNOWN";

export type RegisterForEventResult =
  | { ok: true; registrationId: string }
  | { ok: false; error: RegisterForEventError };

export type RegisterForEvent = (
  input: RegisterForEventInput,
) => Promise<RegisterForEventResult>;

/** Outcomes forced via `?register=` for manual / future tests. */
export type RegisterMockOverride =
  | "success"
  | RegisterForEventError;

const OVERRIDE_ERRORS: RegisterForEventError[] = [
  "UNAUTHENTICATED",
  "EVENT_NOT_FOUND",
  "REGISTRATION_CLOSED",
  "EVENT_FULL",
  "ALREADY_REGISTERED",
  "EVENT_INACTIVE",
  "UNKNOWN",
];

export function parseRegisterMockOverride(
  value: string | null | undefined,
): RegisterMockOverride | null {
  if (!value) return null;
  if (value === "success") return "success";
  if ((OVERRIDE_ERRORS as string[]).includes(value)) {
    return value as RegisterForEventError;
  }
  return null;
}

/**
 * Mock application use case — no fetch/HTTP/DB.
 * Default: success. Override with `?register=<code>` when wired from the handler.
 */
export function createMockRegisterForEvent(options?: {
  override?: RegisterMockOverride | null;
}): RegisterForEvent {
  const override = options?.override ?? null;

  return async function registerForEvent(
    input: RegisterForEventInput,
  ): Promise<RegisterForEventResult> {
    await Promise.resolve();
    void input;

    if (override && override !== "success") {
      return { ok: false, error: override };
    }

    return {
      ok: true,
      registrationId: "reg_mock_01",
    };
  };
}
