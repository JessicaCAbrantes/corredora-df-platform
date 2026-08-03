import { createHash, createHmac } from "node:crypto";

export function resolveMockWebhookSecret(authSecret: string): string {
  return createHash("sha256")
    .update(`corredora-mock-payment:${authSecret}`)
    .digest("hex");
}

export function signMockPaidWebhook(
  payload: {
    paymentId: string;
    providerPaymentId: string;
    kitPickupRequestId: string;
    amount: string;
    currency: string;
    eventId?: string;
  },
  webhookSecret: string,
): { body: string; signature: string } {
  const body = JSON.stringify({
    type: "payment.paid",
    ...(payload.eventId ? { eventId: payload.eventId } : {}),
    paymentId: payload.paymentId,
    providerPaymentId: payload.providerPaymentId,
    kitPickupRequestId: payload.kitPickupRequestId,
    amount: payload.amount,
    currency: payload.currency,
  });
  const signature = createHmac("sha256", webhookSecret)
    .update(body, "utf8")
    .digest("hex");
  return { body, signature: `sha256=${signature}` };
}
