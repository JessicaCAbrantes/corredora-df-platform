import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

type HealthResponse = {
  /** Process is alive (always ok if this handler runs). */
  status: "ok";
  /** Optional PostgreSQL connectivity via Prisma (`SELECT 1`). */
  database: "up" | "down";
};

/**
 * Process + optional DB liveness.
 * Outside `/api/v1` (excluded in main.ts). Not a business-domain envelope.
 *
 * Behavior:
 * - HTTP 200 whenever the Nest process answers
 * - `status` reflects process liveness only
 * - `database` is "up" | "down" independently (does not fail the request)
 */
@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check(): Promise<HealthResponse> {
    const databaseUp = await this.prisma.isDatabaseHealthy();

    return {
      status: "ok",
      database: databaseUp ? "up" : "down",
    };
  }
}
