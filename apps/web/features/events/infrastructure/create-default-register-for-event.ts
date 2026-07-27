import {
  createMockRegisterForEvent,
  parseRegisterMockOverride,
  type RegisterForEvent,
} from "../application/register-for-event";
import { createHttpRegisterForEvent } from "./http-register-for-event";

/**
 * Composition helper — chooses Mock vs HTTP without changing the Handler.
 *
 * - `?register=<code>` or `?mock=1` → Mock (local boundary validation)
 * - otherwise → HttpRegisterForEvent Adapter
 */
export function createDefaultRegisterForEvent(): RegisterForEvent {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const override = parseRegisterMockOverride(params.get("register"));
    const forceMock = params.get("mock") === "1";

    if (override !== null || forceMock) {
      return createMockRegisterForEvent({
        override: override ?? "success",
      });
    }
  }

  return createHttpRegisterForEvent();
}
