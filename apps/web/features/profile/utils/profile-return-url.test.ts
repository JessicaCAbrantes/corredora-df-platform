import { describe, expect, it } from "vitest";
import { buildLoginUrl } from "../../events/auth/build-login-url";
import { resolveSafeReturnUrl } from "../../auth/utils/safe-return-url";

describe("profile returnUrl", () => {
  it("builds login URL with /perfil returnUrl", () => {
    expect(buildLoginUrl("/perfil")).toBe(
      "/auth/login?returnUrl=%2Fperfil",
    );
  });

  it("accepts /perfil as safe return URL", () => {
    expect(resolveSafeReturnUrl("/perfil")).toBe("/perfil");
  });

  it("rejects external and javascript return URLs", () => {
    expect(resolveSafeReturnUrl("https://evil.example")).toBe("/corridas");
    expect(resolveSafeReturnUrl("//evil.example")).toBe("/corridas");
    expect(resolveSafeReturnUrl("javascript:alert(1)")).toBe("/corridas");
  });
});
