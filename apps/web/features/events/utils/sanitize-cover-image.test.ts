import { describe, expect, it } from "vitest";
import { sanitizeCoverImageSrc } from "./sanitize-cover-image";

describe("sanitizeCoverImageSrc", () => {
  it("keeps relative and non-example absolute URLs", () => {
    expect(sanitizeCoverImageSrc("/events/5k.svg")).toBe("/events/5k.svg");
    expect(sanitizeCoverImageSrc("https://cdn.corredoradf.test/meia.jpg")).toBe(
      "https://cdn.corredoradf.test/meia.jpg",
    );
  });

  it("omits example.com placeholders and blanks", () => {
    expect(sanitizeCoverImageSrc("https://example.com/meia.jpg")).toBeUndefined();
    expect(sanitizeCoverImageSrc("http://www.example.com/x")).toBeUndefined();
    expect(sanitizeCoverImageSrc("")).toBeUndefined();
    expect(sanitizeCoverImageSrc("   ")).toBeUndefined();
    expect(sanitizeCoverImageSrc(undefined)).toBeUndefined();
  });
});
