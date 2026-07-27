import { describe, expect, it } from "vitest";
import { buildLoginUrl } from "../auth/build-login-url";
import { resolveSafeReturnUrl } from "../../auth/utils/safe-return-url";

describe("Kits returnUrl", () => {
  it("builds login URL with returnUrl=/kits", () => {
    expect(buildLoginUrl("/kits")).toBe("/auth/login?returnUrl=%2Fkits");
  });

  it("accepts /kits as safe return URL", () => {
    expect(resolveSafeReturnUrl("/kits")).toBe("/kits");
  });

  it("rejects open redirects", () => {
    expect(resolveSafeReturnUrl("https://evil.example")).toBe("/corridas");
    expect(resolveSafeReturnUrl("//evil.example")).toBe("/corridas");
    expect(resolveSafeReturnUrl("javascript:alert(1)")).toBe("/corridas");
  });
});
