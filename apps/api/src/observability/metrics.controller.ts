/**
 * FASE 3.5-D3-B — Operational metrics scrape endpoint.
 * Outside /api/v1 (same convention as /health/*).
 *
 * Aggregation for consumers:
 * - Counter → sum/rate
 * - Histogram → histogram_quantile
 * - Gauge DB-backed → max() (never sum across replicas)
 */
import { timingSafeEqual } from "node:crypto";
import {
  Controller,
  Get,
  Header,
  Headers,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Env } from "../config/env.validation";
import {
  PROMETHEUS_CONTENT_TYPE,
  renderPrometheusText,
} from "./prometheus-text";

function bearerMatches(header: string | undefined, expected: string): boolean {
  if (!header || !header.startsWith("Bearer ")) return false;
  const token = header.slice("Bearer ".length).trim();
  if (!token) return false;
  const a = Buffer.from(token, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

@Controller()
export class MetricsController {
  constructor(private readonly config: ConfigService<Env, true>) {}

  @Get("metrics")
  @Header("Content-Type", PROMETHEUS_CONTENT_TYPE)
  metrics(@Headers("authorization") authorization: string | undefined): string {
    const enabled = this.config.get("METRICS_ENABLED", { infer: true });
    if (!enabled) {
      throw new HttpException(
        {
          status: "error",
          error: {
            code: "NOT_FOUND",
            message: "Not Found",
            status: 404,
          },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const expected = this.config.get("METRICS_BEARER_TOKEN", { infer: true });
    if (expected == null || !bearerMatches(authorization, expected)) {
      throw new HttpException(
        {
          status: "error",
          error: {
            code: "UNAUTHORIZED",
            message: "Unauthorized",
            status: 401,
          },
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      return renderPrometheusText();
    } catch {
      throw new HttpException(
        {
          status: "error",
          error: {
            code: "METRICS_RENDER_FAILED",
            message: "Failed to render metrics.",
            status: 500,
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
