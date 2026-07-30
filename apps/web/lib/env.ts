/**
 * Typed, lazy access to Web environment configuration.
 *
 * Keep validation in getters so importing this module does not throw
 * (tests that inject `baseUrl` never touch `env.apiUrl`).
 */

const DEV_FALLBACK_API_URL = "http://localhost:3001";

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

function resolveApiUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim() ?? "";
  if (raw !== "") {
    return stripTrailingSlash(raw);
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Missing required environment variable: NEXT_PUBLIC_API_URL",
    );
  }

  // development, test, and other non-production modes
  return DEV_FALLBACK_API_URL;
}

export const env = {
  /** Public Nest API origin (no trailing slash). */
  get apiUrl(): string {
    return resolveApiUrl();
  },
};
