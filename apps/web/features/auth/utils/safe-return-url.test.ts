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
    expect(resolveSafeReturnUrl("https://example.com")).toBe("/corridas");
    expect(resolveSafeReturnUrl("//example.com")).toBe("/corridas");
    expect(resolveSafeReturnUrl("http://evil.test/x")).toBe("/corridas");
  });

  it("rejects javascript and scheme-like paths", () => {
    expect(resolveSafeReturnUrl("javascript:alert(1)")).toBe("/corridas");
    expect(resolveSafeReturnUrl("/javascript:alert(1)")).toBe("/corridas");
  });

  it("uses custom fallback when provided", () => {
    expect(resolveSafeReturnUrl(null, "/")).toBe("/");
    expect(resolveSafeReturnUrl(undefined, "/")).toBe("/");
  });
});
