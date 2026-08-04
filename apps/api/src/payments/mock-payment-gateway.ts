import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type {
  CreateCheckoutInput,
  CreateCheckoutResult,
  ParsedWebhook,
  PaymentGateway,
} from "./payment-gateway";

export type MockPaymentGatewayOptions = {
  webhookSecret: string;
  /** Base URL for mock checkout page (API host). */
  publicApiBaseUrl: string;
};

/**
 * HMAC-signed mock gateway for local/CI without Stripe keys.
 * Webhook: POST /api/v1/payments/webhook with header X-Corredora-Payment-Signature.
 *
 * Synthetic event ids are stable for identical bodies (`mock_evt_<sha256>`),
 * or an explicit `eventId` field in the JSON payload when provided.
 */
export class MockPaymentGateway implements PaymentGateway {
  readonly provider = "mock";

  constructor(private readonly options: MockPaymentGatewayOptions) {}

  async createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
    const providerPaymentId = `mock_pay_${input.paymentId}`;
    const checkoutUrl = new URL(
      "/api/v1/payments/mock-checkout",
      this.options.publicApiBaseUrl,
    );
    checkoutUrl.searchParams.set("paymentId", input.paymentId);
    checkoutUrl.searchParams.set("providerPaymentId", providerPaymentId);
    checkoutUrl.searchParams.set("requestId", input.kitPickupRequestId);
    checkoutUrl.searchParams.set("amount", input.amount);
    checkoutUrl.searchParams.set("currency", input.currency);
    checkoutUrl.searchParams.set("successUrl", input.successUrl);
    checkoutUrl.searchParams.set("cancelUrl", input.cancelUrl);
    return {
      provider: this.provider,
      providerPaymentId,
      checkoutUrl: checkoutUrl.toString(),
    };
  }

  async verifyAndParseWebhook(params: {
    rawBody: Buffer;
    signatureHeader: string | undefined;
  }): Promise<ParsedWebhook> {
    if (!params.signatureHeader) {
      throw new Error("MISSING_SIGNATURE");
    }

    const expected = createHmac("sha256", this.options.webhookSecret)
      .update(params.rawBody)
      .digest("hex");

    const provided = params.signatureHeader.replace(/^sha256=/, "").trim();
    const expectedBuf = Buffer.from(expected, "utf8");
    const providedBuf = Buffer.from(provided, "utf8");
    if (
      expectedBuf.length !== providedBuf.length ||
      !timingSafeEqual(expectedBuf, providedBuf)
    ) {
      throw new Error("INVALID_SIGNATURE");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(params.rawBody.toString("utf8"));
    } catch {
      // Signature already verified — unprocessable body is a permanent ignore.
      return {
        providerEventId: `mock_evt_${createHash("sha256").update(params.rawBody).digest("hex")}`,
        event: null,
      };
    }

    if (!parsed || typeof parsed !== "object") {
      return {
        providerEventId: `mock_evt_${createHash("sha256").update(params.rawBody).digest("hex")}`,
        event: null,
      };
    }

    const body = parsed as Record<string, unknown>;
    const providerEventId = resolveMockProviderEventId(body, params.rawBody);

    const type = body.type;
    if (type !== "payment.paid" && type !== "payment.failed") {
      return { providerEventId, event: null };
    }

    const providerPaymentId =
      typeof body.providerPaymentId === "string" ? body.providerPaymentId : "";
    const paymentId = typeof body.paymentId === "string" ? body.paymentId : "";
    const kitPickupRequestId =
      typeof body.kitPickupRequestId === "string" ? body.kitPickupRequestId : "";

    if (!providerPaymentId || !paymentId || !kitPickupRequestId) {
      return { providerEventId, event: null };
    }

    if (type === "payment.failed") {
      return {
        providerEventId,
        event: {
          type: "payment.failed",
          provider: this.provider,
          providerPaymentId,
          paymentId,
          kitPickupRequestId,
        },
      };
    }

    const amount = typeof body.amount === "string" ? body.amount : "";
    const currency = typeof body.currency === "string" ? body.currency : "";
    if (!amount || !currency) {
      return { providerEventId, event: null };
    }

    return {
      providerEventId,
      event: {
        type: "payment.paid",
        provider: this.provider,
        providerPaymentId,
        paymentId,
        kitPickupRequestId,
        amount,
        currency,
      },
    };
  }

  /** Helper for mock checkout HTML form — signs a paid event. */
  signPaidEvent(payload: {
    paymentId: string;
    providerPaymentId: string;
    kitPickupRequestId: string;
    amount: string;
    currency: string;
    /** Optional stable event id for tests; otherwise derived from body hash. */
    eventId?: string;
  }): { body: string; signature: string } {
    const body = JSON.stringify({
      type: "payment.paid",
      ...(payload.eventId ? { eventId: payload.eventId } : {}),
      paymentId: payload.paymentId,
      providerPaymentId: payload.providerPaymentId,
      kitPickupRequestId: payload.kitPickupRequestId,
      amount: payload.amount,
      currency: payload.currency,
    });
    const signature = createHmac("sha256", this.options.webhookSecret)
      .update(body, "utf8")
      .digest("hex");
    return { body, signature: `sha256=${signature}` };
  }
}

function resolveMockProviderEventId(
  body: Record<string, unknown>,
  rawBody: Buffer,
): string {
  if (typeof body.eventId === "string" && body.eventId.trim() !== "") {
    return body.eventId.trim();
  }
  return `mock_evt_${createHash("sha256").update(rawBody).digest("hex")}`;
}
