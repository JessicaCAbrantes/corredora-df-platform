/**
 * FASE 3.5-D2 — Periodic DB sample for ledger RECEIVED gauges.
 * Does not COUNT on every webhook; interval is configurable.
 */
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PaymentWebhookEventStatus } from "@prisma/client";
import type { Env } from "../config/env.validation";
import { PrismaService } from "../prisma/prisma.service";
import {
  applyLedgerReceivedSample,
  DEFAULT_LEDGER_METRICS_SAMPLE_MS,
  type LedgerReceivedRow,
  paymentMetricsRegistry,
} from "./payment-metrics";

function resolveSampleIntervalMs(): number {
  const raw = process.env.PAYMENT_METRICS_LEDGER_SAMPLE_MS;
  if (raw === undefined || raw === "") {
    return DEFAULT_LEDGER_METRICS_SAMPLE_MS;
  }
  const n = Number(raw);
  if (!Number.isFinite(n)) return DEFAULT_LEDGER_METRICS_SAMPLE_MS;
  // 0 disables the sampler (tests / intentional off).
  return Math.max(0, Math.floor(n));
}

export async function sampleLedgerReceivedMetrics(
  prisma: Pick<PrismaService, "paymentWebhookEvent">,
  providersHint: readonly string[],
  now: Date = new Date(),
): Promise<LedgerReceivedRow[]> {
  const groups = await prisma.paymentWebhookEvent.groupBy({
    by: ["provider"],
    where: { status: PaymentWebhookEventStatus.RECEIVED },
    _count: { _all: true },
    _min: { receivedAt: true },
  });

  const rows: LedgerReceivedRow[] = groups.map((g) => ({
    provider: g.provider,
    count: g._count._all,
    oldestReceivedAt: g._min.receivedAt,
  }));

  applyLedgerReceivedSample(rows, providersHint, now, paymentMetricsRegistry);
  return rows;
}

@Injectable()
export class PaymentLedgerMetricsSampler
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PaymentLedgerMetricsSampler.name);
  private timer: ReturnType<typeof setInterval> | null = null;
  private readonly intervalMs: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<Env, true>,
  ) {
    this.intervalMs = resolveSampleIntervalMs();
  }

  onModuleInit(): void {
    if (this.intervalMs <= 0) {
      this.logger.debug("Ledger metrics sampler disabled (interval <= 0)");
      return;
    }
    void this.tick();
    this.timer = setInterval(() => void this.tick(), this.intervalMs);
    // Unref so the timer does not keep the process alive in short-lived contexts.
    if (typeof this.timer.unref === "function") {
      this.timer.unref();
    }
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async tick(): Promise<void> {
    try {
      const provider = this.config.get("PAYMENT_PROVIDER", { infer: true });
      const hint = provider ? [provider] : [];
      await sampleLedgerReceivedMetrics(this.prisma, hint);
    } catch (error: unknown) {
      // Best-effort — never affect request handling.
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Ledger metrics sample failed: ${message}`);
    }
  }
}
