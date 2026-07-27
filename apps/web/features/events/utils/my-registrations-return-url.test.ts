import { describe, expect, it } from "vitest";
import { buildLoginUrl } from "../auth/build-login-url";

describe("My Registrations returnUrl", () => {
  it("builds login URL with returnUrl=/minhas-inscricoes", () => {
    expect(buildLoginUrl("/minhas-inscricoes")).toBe(
      "/auth/login?returnUrl=%2Fminhas-inscricoes",
    );
  });
});
