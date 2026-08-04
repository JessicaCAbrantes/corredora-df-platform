/**
 * Unit tests — FASE 3.5-C correlation IDs.
 * Run via: pnpm --filter api test
 */
import {
  getCorrelationId,
  resolveInboundCorrelationId,
  runWithCorrelationId,
} from "../observability/correlation-context";
import {
  buildPaymentDecisionPayload,
  emitPaymentDecisionLog,
  type PaymentDecisionPayload,
} from "../payments/payment-decision-log";
import { MockPaymentGateway } from "../payments/mock-payment-gateway";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function main(): Promise<void> {
  // --- inbound header resolution ---
  {
    const kept = resolveInboundCorrelationId("abc-def-12");
    assert(kept === "abc-def-12", "keeps valid inbound");
    const generated = resolveInboundCorrelationId("!!");
    assert(generated.length >= 8, "rejects invalid, generates");
    assert(resolveInboundCorrelationId(undefined).length >= 8, "generates when missing");
  }

  // --- one id per ALS scope ---
  {
    const seen: string[] = [];
    runWithCorrelationId("corr-request-1", () => {
      seen.push(getCorrelationId()!);
      emitPaymentDecisionLog(
        {
          environment: "test",
          event: "payment.checkout.created",
          category: "audit",
          provider: "mock",
          result: "success",
        },
        (p) => {
          seen.push(p.correlationId!);
        },
      );
      const nested = buildPaymentDecisionPayload({
        environment: "test",
        event: "payment.checkout.rejected",
        category: "warn",
        provider: "mock",
        result: "rejected",
        code: "INVALID_STATUS",
        reason: "invalid_transition",
      });
      seen.push(nested.correlationId!);
    });
    assert(seen.length === 3, "three observations");
    assert(seen.every((id) => id === "corr-request-1"), "same id in request scope");
    assert(getCorrelationId() === undefined, "cleared outside scope");
  }

  // --- checkout metadata carries correlation for mock webhook recovery ---
  {
    const gateway = new MockPaymentGateway({
      webhookSecret: "test_webhook_secret_value",
      publicApiBaseUrl: "http://localhost:3001",
    });
    const checkout = await gateway.createCheckout({
      paymentId: "kpp_c",
      kitPickupRequestId: "kpr_c",
      amount: "10.00",
      currency: "BRL",
      successUrl: "http://localhost/ok",
      cancelUrl: "http://localhost/cancel",
      correlationId: "corr-checkout-flow",
    });
    assert(
      checkout.checkoutUrl.includes("correlationId=corr-checkout-flow"),
      "mock URL carries correlation",
    );

    const signed = gateway.signPaidEvent({
      paymentId: "kpp_c",
      providerPaymentId: checkout.providerPaymentId,
      kitPickupRequestId: "kpr_c",
      amount: "10.00",
      currency: "BRL",
      correlationId: "corr-checkout-flow",
      eventId: "evt_corr_1",
    });
    const parsed = await gateway.verifyAndParseWebhook({
      rawBody: Buffer.from(signed.body, "utf8"),
      signatureHeader: signed.signature,
    });
    assert(parsed.correlationId === "corr-checkout-flow", "webhook recovers correlation");
    assert(parsed.event?.type === "payment.paid", "paid event");
  }

  // --- decision log under recovered webhook correlation ---
  {
    const events: PaymentDecisionPayload[] = [];
    runWithCorrelationId("corr-from-metadata", () => {
      emitPaymentDecisionLog(
        {
          environment: "test",
          event: "payment.webhook.payment_confirmed",
          category: "audit",
          provider: "mock",
          paymentId: "kpp_w",
          requestId: "kpr_w",
          result: "success",
          providerEventId: "evt_w",
        },
        (p) => events.push(p),
      );
    });
    assert(events.length === 1, "one event");
    assert(events[0].correlationId === "corr-from-metadata", "webhook log correlated");
  }

  console.log("correlation.test.ts: OK");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
