import {
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Env } from "../config/env.validation";
import { PrismaService } from "../prisma/prisma.service";
import { LoginAttemptLimiter } from "./login-attempt-limiter";
import { verifyPassword } from "./password";
import {
  buildSessionCookieOptions,
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  type SessionCookieOptions,
} from "./session-cookie";

export type AuthUserDto = {
  id: string;
  email: string;
};

export type LoginSuccess = {
  user: AuthUserDto;
  token: string;
  cookieName: string;
  cookieOptions: SessionCookieOptions;
};

function apiError(status: HttpStatus, code: string, message: string): never {
  throw new HttpException(
    {
      status: "error",
      error: {
        code,
        message,
        status,
      },
    },
    status,
  );
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<Env, true>,
    private readonly loginAttemptLimiter: LoginAttemptLimiter,
  ) {}

  normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  async login(
    email: string,
    password: string,
    clientIp = "unknown",
  ): Promise<LoginSuccess> {
    const normalized = this.normalizeEmail(email);
    const attemptKey = this.loginAttemptLimiter.buildKey(clientIp, normalized);

    if (this.loginAttemptLimiter.isBlocked(attemptKey)) {
      apiError(
        HttpStatus.TOO_MANY_REQUESTS,
        "TOO_MANY_REQUESTS",
        "Muitas tentativas de login. Tente novamente em alguns minutos.",
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { email: normalized },
    });

    // Same error path for missing user and bad password (no account enumeration).
    if (!user || !verifyPassword(password, user.passwordHash)) {
      this.loginAttemptLimiter.recordFailure(attemptKey);
      apiError(
        HttpStatus.UNAUTHORIZED,
        "INVALID_CREDENTIALS",
        "E-mail ou senha incorretos.",
      );
    }

    this.loginAttemptLimiter.reset(attemptKey);

    const secret = this.config.get("AUTH_SECRET", { infer: true });
    const nodeEnv = this.config.get("NODE_ENV", { infer: true });
    const token = createSessionToken(user.id, secret);

    return {
      user: { id: user.id, email: user.email },
      token,
      cookieName: SESSION_COOKIE_NAME,
      cookieOptions: buildSessionCookieOptions(nodeEnv, SESSION_TTL_SECONDS),
    };
  }

  async getMe(userId: string): Promise<AuthUserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      apiError(
        HttpStatus.UNAUTHORIZED,
        "UNAUTHORIZED",
        "Usuário não autenticado.",
      );
    }

    return { id: user.id, email: user.email };
  }

  logoutCookieOptions(): SessionCookieOptions & { maxAge: number } {
    const nodeEnv = this.config.get("NODE_ENV", { infer: true });
    return {
      ...buildSessionCookieOptions(nodeEnv, SESSION_TTL_SECONDS),
      maxAge: 0,
    };
  }
}
