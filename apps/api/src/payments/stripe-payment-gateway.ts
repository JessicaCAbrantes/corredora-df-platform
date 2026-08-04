import Stripe from "stripe";
import type {
  CreateCheckoutInput,
  CreateCheckoutResult,
  ParsedWebhook,
  PaymentGateway,
} from "./payment-gateway";

export type StripePaymentGatewayOptions = {
  secretKey: string;
  webhookSecret: string;
};

function amountToStripeUnitAmount(amount: string): number {
  const normalized = amount.trim();
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(normalized);
  if (!match) {
    throw new Error("INVALID_AMOUNT");
  }
  const whole = Number(match[1]);
  const cents = (match[2] ?? "00").padEnd(2, "0");
  return whole * 100 + Number(cents);
}

function stripeAmountToDecimalString(unitAmount: number): string {
  const whole = Math.floor(unitAmount / 100);
  const cents = unitAmount % 100;
  return `${whole}.${String(cents).padStart(2, "0")}`;
}

/**
 * Stripe Checkout Sessions — card data never touches Corredora servers.
 */
export class StripePaymentGateway implements PaymentGateway {
  readonly provider = "stripe";
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;

  constructor(options: StripePaymentGatewayOptions) {
    this.stripe = new Stripe(options.secretKey);
    this.webhookSecret = options.webhookSecret;
  }

  async createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
    const unitAmount = amountToStripeUnitAmount(input.amount);
    const session = await this.stripe.checkout.sessions.create({
      mode: "payment",
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      customer_email: input.customerEmail,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: input.currency.toLowerCase(),
            unit_amount: unitAmount,
            product_data: {
              name: "Serviço de retirada de kit — Corredora DF",
            },
          },
        },
      ],
      metadata: {
        paymentId: input.paymentId,
        kitPickupRequestId: input.kitPickupRequestId,
      },
    });

    if (!session.url) {
      throw new Error("STRIPE_CHECKOUT_URL_MISSING");
    }

    return {
      provider: this.provider,
      providerPaymentId: session.id,
      checkoutUrl: session.url,
    };
  }

  async verifyAndParseWebhook(params: {
    rawBody: Buffer;
    signatureHeader: string | undefined;
  }): Promise<ParsedWebhook> {
    if (!params.signatureHeader) {
      throw new Error("MISSING_SIGNATURE");
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        params.rawBody,
        params.signatureHeader,
        this.webhookSecret,
      );
    } catch {
      throw new Error("INVALID_SIGNATURE");
    }

    const providerEventId = event.id;

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentId = session.metadata?.paymentId ?? "";
      const kitPickupRequestId = session.metadata?.kitPickupRequestId ?? "";
      if (!paymentId || !kitPickupRequestId || !session.id) {
        // Authenticated but not processable — ACK via ledger (FASE 3.4-C4).
        return { providerEventId, event: null };
      }

      if (session.payment_status !== "paid") {
        return { providerEventId, event: null };
      }

      const amountTotal = session.amount_total;
      if (typeof amountTotal !== "number") {
        return { providerEventId, event: null };
      }

      return {
        providerEventId,
        event: {
          type: "payment.paid",
          provider: this.provider,
          providerPaymentId: session.id,
          paymentId,
          kitPickupRequestId,
          amount: stripeAmountToDecimalString(amountTotal),
          currency: (session.currency ?? "brl").toUpperCase(),
        },
      };
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentId = session.metadata?.paymentId ?? "";
      const kitPickupRequestId = session.metadata?.kitPickupRequestId ?? "";
      if (!paymentId || !kitPickupRequestId || !session.id) {
        return { providerEventId, event: null };
      }
      return {
        providerEventId,
        event: {
          type: "payment.failed",
          provider: this.provider,
          providerPaymentId: session.id,
          paymentId,
          kitPickupRequestId,
        },
      };
    }

    return { providerEventId, event: null };
  }
}
