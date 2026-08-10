/**
 * Faculty MVP F4 — omit placeholder seed covers that break in the browser.
 * Keeps real relative/absolute product URLs intact.
 */
export function sanitizeCoverImageSrc(
  coverImage: string | null | undefined,
): string | undefined {
  if (typeof coverImage !== "string") return undefined;
  const trimmed = coverImage.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\/(www\.)?example\.com(\/|$)/i.test(trimmed)) {
    return undefined;
  }
  return trimmed;
}
