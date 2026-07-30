/**
 * Unit tests for AuthService (login) + password + session cookie + Real Auth Boundary
 * + login brute-force limiter.
 * Run via: pnpm --filter api test
 */
import { HttpException, HttpStatus } from "@nestjs/common";
import type { Request } from "express";
import { resolveCurrentUserId } from "./auth.boundary";
import { AuthService } from "./auth.service";
import { LoginAttemptLimiter } from "./login-attempt-limiter";
import { hashPassword, verifyPassword } from "./password";
import {
  createSessionToken,
  readCookieValue,
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "./session-cookie";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function expectHttpError(
  fn: () => Promise<unknown>,
  status: number,
  code: string,
): Promise<void> {
  try {
    await fn();
    throw new Error(`Expected HttpException ${code}`);
  } catch (error: unknown) {
    assert(error instanceof HttpException, `Expected HttpException, got ${error}`);
    assert(error.getStatus() === status, `Expected status ${status}`);
    const body = error.getResponse() as { error?: { code?: string } };
    assert(body.error?.code === code, `Expected code ${code}, got ${body.error?.code}`);
  }
}

function mockRequest(cookie?: string, extras?: Partial<Request>): Request {
  return {
    headers: cookie ? { cookie } : {},
    body: extras?.body,
    query: extras?.query,
    ...extras,
  } as Request;
}

async function run(): Promise<void> {
  const secret = "test-auth-secret-for-unit-tests";
  const previousSecret = process.env.AUTH_SECRET;
  process.env.AUTH_SECRET = secret;

  // --- password ---
  {
    const stored = hashPassword("corredora123");
    assert(stored.startsWith("scrypt$"), "scrypt prefix");
    assert(verifyPassword("corredora123", stored), "valid password");
    assert(!verifyPassword("wrong", stored), "invalid password");
    assert(!verifyPassword("corredora123", "garbage"), "malformed stored");
  }

  // --- session cookie create / verify ---
  {
    const token = createSessionToken("usr_test_01", secret, 1_700_000_000, 3600);
    assert(
      verifySessionToken(token, secret, 1_700_000_000) === "usr_test_01",
      "valid token → userId",
    );
    assert(
      verifySessionToken(token, secret, 1_700_000_000 + 3601) === null,
      "expired → null",
    );
    assert(
      verifySessionToken(token + "x", secret, 1_700_000_000) === null,
      "tampered → null",
    );
    assert(
      verifySessionToken(undefined, secret) === null,
      "absent → null",
    );
    assert(
      verifySessionToken("not.a.valid.token", secret) === null,
      "invalid format → null",
    );
    const [payload] = token.split(".");
    assert(
      verifySessionToken(`${payload}.AAAA`, secret, 1_700_000_000) === null,
      "bad signature → null",
    );
  }

  // --- readCookieValue ---
  {
    const header = `${SESSION_COOKIE_NAME}=abc.def; other=1`;
    assert(
      readCookieValue(header, SESSION_COOKIE_NAME) === "abc.def",
      "reads session cookie",
    );
    assert(readCookieValue(undefined, SESSION_COOKIE_NAME) === undefined, "no header");
  }

  // --- Real Auth Boundary ---
  {
    const liveToken = createSessionToken("usr_boundary_01", secret);
    assert(
      resolveCurrentUserId(
        mockRequest(`${SESSION_COOKIE_NAME}=${liveToken}`), process.env.AUTH_SECRET ?? "",
      ) === "usr_boundary_01",
      "valid cookie → userId",
    );
    assert(resolveCurrentUserId(mockRequest(), process.env.AUTH_SECRET ?? "") === null, "no cookie → null");
    assert(
      resolveCurrentUserId(
        mockRequest(`${SESSION_COOKIE_NAME}=${liveToken}tampered`), process.env.AUTH_SECRET ?? "",
      ) === null,
      "tampered cookie → null",
    );

    const expired = createSessionToken("usr_x", secret, 1_000_000_000, 1);
    assert(
      resolveCurrentUserId(
        mockRequest(`${SESSION_COOKIE_NAME}=${expired}`), process.env.AUTH_SECRET ?? "",
      ) === null,
      "expired cookie → null",
    );

    const withBody = mockRequest(`${SESSION_COOKIE_NAME}=${liveToken}`, {
      body: { userId: "attacker" },
    } as Partial<Request>);
    assert(
      resolveCurrentUserId(withBody, process.env.AUTH_SECRET ?? "") === "usr_boundary_01",
      "body.userId ignored",
    );

    process.env.AUTH_SECRET = "";
    assert(
      resolveCurrentUserId(
        mockRequest(`${SESSION_COOKIE_NAME}=${liveToken}`), process.env.AUTH_SECRET ?? "",
      ) === null,
      "missing AUTH_SECRET → null (no mock fallback)",
    );
    process.env.AUTH_SECRET = secret;

    assert(
      resolveCurrentUserId(
        mockRequest(`${SESSION_COOKIE_NAME}=${liveToken}`), process.env.AUTH_SECRET ?? "",
      ) !== "user_mock_01",
      "no user_mock_01 fallback",
    );
  }

  // --- AuthService.login + brute-force ---
  {
    const passwordHash = hashPassword("corredora123");
    const prisma = {
      user: {
        findUnique: async ({ where }: { where: { email?: string; id?: string } }) => {
          if (where.email === "runner@corredora.df") {
            return {
              id: "usr_seed_01",
              email: "runner@corredora.df",
              passwordHash,
              createdAt: new Date(),
            };
          }
          if (where.id === "usr_seed_01") {
            return {
              id: "usr_seed_01",
              email: "runner@corredora.df",
              passwordHash,
              createdAt: new Date(),
            };
          }
          return null;
        },
      },
    };
    const config = {
      get(key: string) {
        if (key === "AUTH_SECRET") return secret;
        if (key === "NODE_ENV") return "development";
        return undefined;
      },
    };

    const limiter = new LoginAttemptLimiter().configure({
      maxAttempts: 3,
      windowMs: 60_000,
    });
    const service = new AuthService(
      prisma as never,
      config as never,
      limiter,
    );

    assert(
      service.normalizeEmail("  Runner@Corredora.DF ") === "runner@corredora.df",
      "email normalization",
    );

    const ok = await service.login(
      "  Runner@Corredora.DF ",
      "corredora123",
      "127.0.0.1",
    );
    assert(ok.user.id === "usr_seed_01", "login returns user id");
    assert(ok.user.email === "runner@corredora.df", "login returns email");
    assert(typeof ok.token === "string" && ok.token.includes("."), "creates token");
    assert(ok.cookieName === SESSION_COOKIE_NAME, "cookie name");
    assert(ok.cookieOptions.httpOnly === true, "HttpOnly");
    assert(ok.cookieOptions.sameSite === "lax", "SameSite=Lax");
    assert(ok.cookieOptions.secure === false, "secure false in development");
    assert(!("accessToken" in ok), "no accessToken in result object shape for body");

    await expectHttpError(
      () => service.login("missing@corredora.df", "corredora123", "10.0.0.1"),
      HttpStatus.UNAUTHORIZED,
      "INVALID_CREDENTIALS",
    );
    await expectHttpError(
      () => service.login("runner@corredora.df", "wrong", "10.0.0.2"),
      HttpStatus.UNAUTHORIZED,
      "INVALID_CREDENTIALS",
    );

    // Valid login still works after failures within limit (separate IP keys).
    const afterFailures = await service.login(
      "runner@corredora.df",
      "corredora123",
      "10.0.0.3",
    );
    assert(afterFailures.user.id === "usr_seed_01", "valid login after other failures");

    // Brute-force: 3 failures → blocked on 4th
    const bruteIp = "203.0.113.50";
    const bruteEmail = "bruteforce@corredora.df";
    await expectHttpError(
      () => service.login(bruteEmail, "wrong", bruteIp),
      HttpStatus.UNAUTHORIZED,
      "INVALID_CREDENTIALS",
    );
    await expectHttpError(
      () => service.login(bruteEmail, "wrong", bruteIp),
      HttpStatus.UNAUTHORIZED,
      "INVALID_CREDENTIALS",
    );
    await expectHttpError(
      () => service.login(bruteEmail, "wrong", bruteIp),
      HttpStatus.UNAUTHORIZED,
      "INVALID_CREDENTIALS",
    );
    await expectHttpError(
      () => service.login(bruteEmail, "wrong", bruteIp),
      HttpStatus.TOO_MANY_REQUESTS,
      "TOO_MANY_REQUESTS",
    );
    // Even correct password is blocked while window active (unknown email still blocked).
    await expectHttpError(
      () => service.login(bruteEmail, "corredora123", bruteIp),
      HttpStatus.TOO_MANY_REQUESTS,
      "TOO_MANY_REQUESTS",
    );

    // Window expiry → attempts allowed again
    let clock = Date.now();
    const timedLimiter = new LoginAttemptLimiter().configure({
      maxAttempts: 2,
      windowMs: 1_000,
      now: () => clock,
    });
    const timedService = new AuthService(
      prisma as never,
      config as never,
      timedLimiter,
    );
    const timedIp = "198.51.100.10";
    await expectHttpError(
      () => timedService.login("missing@x.df", "x", timedIp),
      HttpStatus.UNAUTHORIZED,
      "INVALID_CREDENTIALS",
    );
    await expectHttpError(
      () => timedService.login("missing@x.df", "x", timedIp),
      HttpStatus.UNAUTHORIZED,
      "INVALID_CREDENTIALS",
    );
    await expectHttpError(
      () => timedService.login("missing@x.df", "x", timedIp),
      HttpStatus.TOO_MANY_REQUESTS,
      "TOO_MANY_REQUESTS",
    );
    clock += 1_001;
    await expectHttpError(
      () => timedService.login("missing@x.df", "x", timedIp),
      HttpStatus.UNAUTHORIZED,
      "INVALID_CREDENTIALS",
    );

    // Successful login clears counter for that key
    const clearIp = "192.0.2.10";
    await expectHttpError(
      () => service.login("runner@corredora.df", "wrong", clearIp),
      HttpStatus.UNAUTHORIZED,
      "INVALID_CREDENTIALS",
    );
    await expectHttpError(
      () => service.login("runner@corredora.df", "wrong", clearIp),
      HttpStatus.UNAUTHORIZED,
      "INVALID_CREDENTIALS",
    );
    const cleared = await service.login(
      "runner@corredora.df",
      "corredora123",
      clearIp,
    );
    assert(cleared.user.id === "usr_seed_01", "success clears attempts");
    await expectHttpError(
      () => service.login("runner@corredora.df", "wrong", clearIp),
      HttpStatus.UNAUTHORIZED,
      "INVALID_CREDENTIALS",
    );

    const me = await service.getMe("usr_seed_01");
    assert(me.email === "runner@corredora.df", "getMe");
    await expectHttpError(
      () => service.getMe("missing"),
      HttpStatus.UNAUTHORIZED,
      "UNAUTHORIZED",
    );
  }

  // --- no hardcoded production secrets in Auth source ---
  {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const authDir = path.join(__dirname);
    const files = fs
      .readdirSync(authDir)
      .filter((name) => name.endsWith(".ts") && !name.endsWith(".test.ts"));
    for (const file of files) {
      const content = fs.readFileSync(path.join(authDir, file), "utf8");
      assert(
        !/AUTH_SECRET\s*=\s*["'](?!test-)[^"']+["']/.test(content),
        `${file} must not hardcode AUTH_SECRET assignment`,
      );
    }
  }

  process.env.AUTH_SECRET = previousSecret;
  console.log("auth.service.test.ts: OK");
}

void run().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
