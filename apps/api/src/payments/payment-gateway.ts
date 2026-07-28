export type CreateCheckoutInput = {
  /** Internal Payment.id — returned in webhook metadata. */
  paymentId: string;
  kitPickupRequestId: string;
  amount: string;
  currency: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
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
 * Thin payment gateway port — Stripe (prod) or Mock (local/CI).
 * Domain never sees card data.
 */
export interface PaymentGateway {
  readonly provider: string;
  createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult>;
  /**
   * Verify webhook authenticity and map to a domain event.
   * Returns null when the event is ignored (e.g. non-payment event).
   */
  verifyAndParseWebhook(params: {
    rawBody: Buffer;
    signatureHeader: string | undefined;
  }): Promise<VerifiedPaymentEvent | null>;
}
