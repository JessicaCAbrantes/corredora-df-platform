import {
  Controller,
  Get,
  HttpStatus,
  Res,
} from "@nestjs/common";
import type { Response } from "express";
import { PrismaService } from "../prisma/prisma.service";

type LiveResponse = {
  status: "ok";
};

type ReadyResponse = {
  status: "ready" | "not_ready";
  database: "up" | "down";
};

type LegacyHealthResponse = {
  /** Process is alive (always ok if this handler runs). */
  status: "ok";
  /** Optional PostgreSQL connectivity via Prisma (`SELECT 1`). */
  database: "up" | "down";
};

/**
 * Process + DB probes. Outside `/api/v1` (excluded in main.ts / test-app).
 *
 * - GET /health/live  — liveness (no DB)
 * - GET /health/ready — readiness (DB required; 503 when down)
 * - GET /health       — legacy: always HTTP 200; includes `database` field
 */
@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("live")
  live(): LiveResponse {
    return { status: "ok" };
  }

  @Get("ready")
  async ready(@Res({ passthrough: true }) res: Response): Promise<ReadyResponse> {
    const databaseUp = await this.prisma.isDatabaseHealthy();
    if (!databaseUp) {
      res.status(HttpStatus.SERVICE_UNAVAILABLE);
      return { status: "not_ready", database: "down" };
    }
    return { status: "ready", database: "up" };
  }

  /**
   * Legacy probe — always HTTP 200.
   * Prefer `/health/live` and `/health/ready` for orchestration.
   */
  @Get()
  async check(): Promise<LegacyHealthResponse> {
    const databaseUp = await this.prisma.isDatabaseHealthy();
    return {
      status: "ok",
      database: databaseUp ? "up" : "down",
    };
  }
}
