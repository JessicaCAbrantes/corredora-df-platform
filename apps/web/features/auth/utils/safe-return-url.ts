/**
 * Accept only same-origin relative paths for post-login redirects.
 * Rejects protocol-relative, absolute, and javascript: URLs.
 */
export function resolveSafeReturnUrl(
  raw: string | null | undefined,
  fallback = "/corridas",
): string {
  if (typeof raw !== "string") {
    return fallback;
  }

  const trimmed = raw.trim();
  if (!trimmed.startsWith("/")) {
    return fallback;
  }
  if (trimmed.startsWith("//")) {
    return fallback;
  }
  if (trimmed.includes("://")) {
    return fallback;
  }
  if (/[\x00-\x1f]/.test(trimmed)) {
    return fallback;
  }
  // Block scheme-like prefixes after the leading slash (e.g. /javascript:...)
  if (/^\/[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return fallback;
  }

  return trimmed;
}
