import { Injectable } from "@nestjs/common";

export type LoginAttemptLimiterOptions = {
  maxAttempts?: number;
  windowMs?: number;
  now?: () => number;
};

type AttemptWindow = {
  count: number;
  windowStart: number;
};

/** Default: 5 failed attempts per IP+email within 15 minutes. */
export const DEFAULT_LOGIN_MAX_ATTEMPTS = 5;
export const DEFAULT_LOGIN_WINDOW_MS = 15 * 60 * 1000;

/**
 * In-memory login brute-force limiter (single-instance only).
 *
 * Limitations (pré-produção):
 * - Counters are per process — not shared across instances
 * - Process restart clears all state
 * - Suitable for local / single-node pré-produção only
 * - Distributed rate limiting is a future production requirement
 */
@Injectable()
export class LoginAttemptLimiter {
  private maxAttempts = DEFAULT_LOGIN_MAX_ATTEMPTS;
  private windowMs = DEFAULT_LOGIN_WINDOW_MS;
  private now: () => number = () => Date.now();
  private readonly entries = new Map<string, AttemptWindow>();

  /** Test helper — override limits / clock without Nest DI tokens. */
  configure(options: LoginAttemptLimiterOptions): this {
    if (options.maxAttempts !== undefined) {
      this.maxAttempts = options.maxAttempts;
    }
    if (options.windowMs !== undefined) {
      this.windowMs = options.windowMs;
    }
    if (options.now !== undefined) {
      this.now = options.now;
    }
    return this;
  }

  buildKey(ip: string, normalizedEmail: string): string {
    return `${ip.trim() || "unknown"}|${normalizedEmail}`;
  }

  isBlocked(key: string): boolean {
    this.expireIfNeeded(key);
    const entry = this.entries.get(key);
    return entry !== undefined && entry.count >= this.maxAttempts;
  }

  recordFailure(key: string): void {
    this.expireIfNeeded(key);
    const entry = this.entries.get(key);
    const now = this.now();
    if (!entry) {
      this.entries.set(key, { count: 1, windowStart: now });
      return;
    }
    entry.count += 1;
  }

  reset(key: string): void {
    this.entries.delete(key);
  }

  private expireIfNeeded(key: string): void {
    const entry = this.entries.get(key);
    if (!entry) return;
    if (this.now() - entry.windowStart >= this.windowMs) {
      this.entries.delete(key);
    }
  }
}
