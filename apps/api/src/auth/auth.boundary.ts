import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Request } from "express";
import type { Env } from "../config/env.validation";
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
 * Secret comes only from validated ConfigService at runtime (single source of truth).
 */

/**
 * Pure resolver — secret must be supplied by the caller (ConfigService in runtime).
 */
export function resolveCurrentUserId(
  request: Request,
  secret: string,
): string | null {
  if (typeof secret !== "string" || secret.trim() === "") {
    return null;
  }

  const raw =
    typeof request.headers?.cookie === "string"
      ? request.headers.cookie
      : undefined;
  const token = readCookieValue(raw, SESSION_COOKIE_NAME);
  return verifySessionToken(token, secret);
}

@Injectable()
export class AuthBoundaryService {
  constructor(private readonly config: ConfigService<Env, true>) {}

  resolveCurrentUserId(request: Request): string | null {
    const secret = this.config.get("AUTH_SECRET", { infer: true });
    return resolveCurrentUserId(request, secret);
  }
}
