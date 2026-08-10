import { describe, expect, it } from "vitest";
import { resolveSafeReturnUrl } from "./safe-return-url";

describe("resolveSafeReturnUrl", () => {
  it("preserves internal corridas paths", () => {
    expect(resolveSafeReturnUrl("/corridas/meia-maratona-brasilia")).toBe(
      "/corridas/meia-maratona-brasilia",
    );
    expect(resolveSafeReturnUrl("/corridas/e2e-registro-livre")).toBe(
      "/corridas/e2e-registro-livre",
    );
  });

  it("rejects absolute and protocol-relative URLs", () => {
    expect(resolveSafeReturnUrl("https://example.com")).toBe("/");
    expect(resolveSafeReturnUrl("//example.com")).toBe("/");
    expect(resolveSafeReturnUrl("http://evil.test/x")).toBe("/");
  });

  it("rejects javascript and scheme-like paths", () => {
    expect(resolveSafeReturnUrl("javascript:alert(1)")).toBe("/");
    expect(resolveSafeReturnUrl("/javascript:alert(1)")).toBe("/");
  });

  it("defaults to Home when raw is missing", () => {
    expect(resolveSafeReturnUrl(null)).toBe("/");
    expect(resolveSafeReturnUrl(undefined)).toBe("/");
  });

  it("uses custom fallback when provided", () => {
    expect(resolveSafeReturnUrl(null, "/corridas")).toBe("/corridas");
    expect(resolveSafeReturnUrl(undefined, "/perfil")).toBe("/perfil");
  });
});
