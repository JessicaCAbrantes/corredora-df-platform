import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Stateless signed session cookie (Auth MVP).
 *
 * Format: base64url(JSON payload) + "." + base64url(HMAC-SHA256)
 * Payload: { userId: string, exp: number }  // exp = unix seconds
 */

export const SESSION_COOKIE_NAME = "corredora_session";

/** 7 days */
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

export type SessionPayload = {
  userId: string;
  exp: number;
};

function base64UrlEncode(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(input: string): Buffer {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return Buffer.from(padded + pad, "base64");
}

function sign(payloadPart: string, secret: string): string {
  const digest = createHmac("sha256", secret).update(payloadPart).digest();
  return base64UrlEncode(digest);
}

export function createSessionToken(
  userId: string,
  secret: string,
  nowSeconds: number = Math.floor(Date.now() / 1000),
  ttlSeconds: number = SESSION_TTL_SECONDS,
): string {
  const payload: SessionPayload = {
    userId,
    exp: nowSeconds + ttlSeconds,
  };
  const payloadPart = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(payloadPart, secret);
  return `${payloadPart}.${signature}`;
}

/**
 * @returns userId when token is valid; null when absent/invalid/expired/tampered.
 */
export function verifySessionToken(
  token: string | undefined | null,
  secret: string,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): string | null {
  if (!token || typeof token !== "string") {
    return null;
  }
  if (!secret) {
    return null;
  }

  const dot = token.indexOf(".");
  if (dot <= 0 || dot === token.length - 1) {
    return null;
  }

  const payloadPart = token.slice(0, dot);
  const signaturePart = token.slice(dot + 1);
  if (payloadPart.includes(".") || signaturePart.includes(".")) {
    return null;
  }

  const expected = sign(payloadPart, secret);
  const actualBuf = Buffer.from(signaturePart);
  const expectedBuf = Buffer.from(expected);
  if (actualBuf.length !== expectedBuf.length) {
    return null;
  }
  if (!timingSafeEqual(actualBuf, expectedBuf)) {
    return null;
  }

  let payload: unknown;
  try {
    payload = JSON.parse(base64UrlDecode(payloadPart).toString("utf8"));
  } catch {
    return null;
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    typeof (payload as SessionPayload).userId !== "string" ||
    typeof (payload as SessionPayload).exp !== "number"
  ) {
    return null;
  }

  const { userId, exp } = payload as SessionPayload;
  if (!userId || !Number.isFinite(exp)) {
    return null;
  }
  if (exp <= nowSeconds) {
    return null;
  }

  return userId;
}

export function readCookieValue(
  cookieHeader: string | undefined,
  name: string,
): string | undefined {
  if (!cookieHeader) {
    return undefined;
  }
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq <= 0) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    if (key !== name) {
      continue;
    }
    return decodeURIComponent(trimmed.slice(eq + 1).trim());
  }
  return undefined;
}

export type SessionCookieOptions = {
  httpOnly: true;
  path: "/";
  sameSite: "lax";
  secure: boolean;
  maxAge: number;
};

export function buildSessionCookieOptions(
  nodeEnv: string,
  ttlSeconds: number = SESSION_TTL_SECONDS,
): SessionCookieOptions {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: nodeEnv === "production",
    maxAge: ttlSeconds * 1000,
  };
}
