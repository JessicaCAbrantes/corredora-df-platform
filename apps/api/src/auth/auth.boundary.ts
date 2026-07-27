import type { Request } from "express";
import {
  readCookieValue,
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "./session-cookie";

/**
 * Real Auth Boundary — Auth MVP
 *
 * Resolves the authenticated `userId` from the signed HttpOnly session cookie.
 * Never accepts userId from body, query, route, or client-controlled headers.
 *
 * Swap point (same signature as Temporary Auth Boundary):
 *   resolveCurrentUserId(req): string | null
 *
 * No production fallback to user_mock_01.
 * No X-Corredora-Dev-Anonymous shortcut.
 * No DB lookup per request (stateless cookie).
 */

function resolveAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (typeof secret !== "string" || secret.trim() === "") {
    return "";
  }
  return secret;
}

/**
 * @returns opaque User.id, or null when unauthenticated.
 */
export function resolveCurrentUserId(request: Request): string | null {
  const secret = resolveAuthSecret();
  if (!secret) {
    return null;
  }

  const raw =
    typeof request.headers?.cookie === "string"
      ? request.headers.cookie
      : undefined;
  const token = readCookieValue(raw, SESSION_COOKIE_NAME);
  return verifySessionToken(token, secret);
}
