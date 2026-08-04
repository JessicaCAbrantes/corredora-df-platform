export type CreateCheckoutInput = {
  /** Internal Payment.id — returned in webhook metadata. */
  paymentId: string;
  kitPickupRequestId: string;
  amount: string;
  currency: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  /** FASE 3.5-C — propagated to provider metadata when present. */
  correlationId?: string;
};

export type CreateCheckoutResult = {
  provider: string;
  providerPaymentId: string;
  checkoutUrl: string;
};

export type VerifiedPaymentEvent =
  | {
      type: "payment.paid";
      provider: string;
      providerPaymentId: string;
      paymentId: string;
      kitPickupRequestId: string;
      amount: string;
      currency: string;
    }
  | {
      type: "payment.failed";
      provider: string;
      providerPaymentId: string;
      paymentId: string;
      kitPickupRequestId: string;
    };

/**
 * Result of verifying a webhook delivery.
 * `event` is null when the delivery is intentionally ignored (e.g. non-payment Stripe types).
 * `providerEventId` is always set after a successful signature verify (Stripe `event.id` or mock synthetic id).
 * `correlationId` is recovered from provider metadata when available (FASE 3.5-C).
 */
export type ParsedWebhook = {
  providerEventId: string;
  event: VerifiedPaymentEvent | null;
  correlationId?: string | null;
};

/**
 * Thin payment gateway port — Stripe (prod) or Mock (local/CI).
 * Domain never sees card data.
 */
export interface PaymentGateway {
  readonly provider: string;
  createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult>;
  /**
   * Verify webhook authenticity and map to a domain event.
   * Always returns a provider event id after successful verification.
   */
  verifyAndParseWebhook(params: {
    rawBody: Buffer;
    signatureHeader: string | undefined;
  }): Promise<ParsedWebhook>;
}
