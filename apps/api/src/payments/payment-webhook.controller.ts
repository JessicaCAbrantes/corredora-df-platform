import { createHash } from "node:crypto";
import {
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { MockPaymentGateway } from "./mock-payment-gateway";
import { PaymentsService } from "./payments.service";
import { isSignatureVerifyError } from "./webhook-http-policy";

function getRawBody(request: Request): Buffer {
  const raw = (request as Request & { rawBody?: Buffer }).rawBody;
  if (Buffer.isBuffer(raw)) {
    return raw;
  }
  if (typeof request.body === "string") {
    return Buffer.from(request.body, "utf8");
  }
  if (Buffer.isBuffer(request.body)) {
    return request.body;
  }
  return Buffer.from(JSON.stringify(request.body ?? {}), "utf8");
}

@Controller("payments")
export class PaymentWebhookController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Gateway webhook — authenticated by provider signature, not user session.
   * Idempotency: UNIQUE(provider, event_id) ledger short-circuit (FASE 3.4-C1/C2).
   * HTTP retry contract (FASE 3.4-C4): 401 signature only; permanent → 200+PROCESSED;
   * PAYMENT_NOT_FOUND / transient → 500+RECEIVED.
   */
  @Post("webhook")
  @HttpCode(HttpStatus.OK)
  async webhook(
    @Req() request: Request,
    @Headers("stripe-signature") stripeSignature: string | undefined,
    @Headers("x-corredora-payment-signature") mockSignature: string | undefined,
  ): Promise<{ received: true }> {
    const gateway = this.paymentsService.getGateway();
    const signature =
      gateway.provider === "stripe" ? stripeSignature : mockSignature;
    const rawBody = getRawBody(request);

    let parsed;
    try {
      parsed = await gateway.verifyAndParseWebhook({
        rawBody,
        signatureHeader: signature,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "INVALID_SIGNATURE";
      if (!isSignatureVerifyError(message)) {
        throw new HttpException(
          {
            status: "error",
            error: {
              code: "WEBHOOK_VERIFY_ERROR",
              message: "Falha ao verificar webhook.",
              status: 500,
            },
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        {
          status: "error",
          error: {
            code: message,
            message: "Assinatura de webhook inválida.",
            status: 401,
          },
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const payloadHash = createHash("sha256").update(rawBody).digest("hex");

    try {
      await this.paymentsService.processVerifiedWebhook({
        providerEventId: parsed.providerEventId,
        event: parsed.event,
        payloadHash,
      });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          status: "error",
          error: {
            code: "WEBHOOK_PROCESSING_ERROR",
            message: "Falha ao processar webhook.",
            status: 500,
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return { received: true };
  }

  /**
   * Dev-only mock checkout page — confirms payment via signed webhook call.
   * Only registered when using MockPaymentGateway.
   */
  @Get("mock-checkout")
  async mockCheckout(
    @Query("paymentId") paymentId: string,
    @Query("providerPaymentId") providerPaymentId: string,
    @Query("requestId") requestId: string,
    @Query("amount") amount: string,
    @Query("currency") currency: string,
    @Query("successUrl") successUrl: string,
    @Query("cancelUrl") cancelUrl: string,
    @Res() res: Response,
  ): Promise<void> {
    const gateway = this.paymentsService.getGateway();
    if (!(gateway instanceof MockPaymentGateway)) {
      throw new HttpException(
        {
          status: "error",
          error: {
            code: "NOT_AVAILABLE",
            message: "Mock checkout indisponível.",
            status: 404,
          },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"/><title>Mock Checkout — Corredora DF</title>
<style>
body{font-family:system-ui,sans-serif;max-width:28rem;margin:3rem auto;padding:0 1rem;line-height:1.5}
button{display:block;width:100%;margin:.5rem 0;padding:.75rem;font-size:1rem;cursor:pointer}
.pay{background:#0b6;color:#fff;border:0}
.cancel{background:#eee;border:0}
.err{color:#b00}
</style>
</head>
<body>
<h1>Pagamento simulado</h1>
<p>Valor: <strong>${escapeHtml(amount)} ${escapeHtml(currency)}</strong></p>
<p>Request: <code>${escapeHtml(requestId)}</code></p>
<p id="msg" class="err" hidden></p>
<form id="pay" method="post">
  <button class="pay" type="submit">Confirmar pagamento (mock)</button>
</form>
<p><a class="cancel" href="${escapeHtml(cancelUrl)}">Cancelar</a></p>
<script>
document.getElementById("pay").addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = ${JSON.stringify({
    type: "payment.paid",
    paymentId,
    providerPaymentId,
    kitPickupRequestId: requestId,
    amount,
    currency,
  })};
  const body = JSON.stringify(payload);
  const res = await fetch("/api/v1/payments/webhook", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Corredora-Payment-Signature": ${JSON.stringify(
        gateway.signPaidEvent({
          paymentId,
          providerPaymentId,
          kitPickupRequestId: requestId,
          amount,
          currency,
        }).signature,
      )}
    },
    body
  });
  if (!res.ok) {
    document.getElementById("msg").hidden = false;
    document.getElementById("msg").textContent = "Falha ao confirmar pagamento.";
    return;
  }
  window.location.href = ${JSON.stringify(successUrl)};
});
</script>
</body>
</html>`;

    res.status(200).type("html").send(html);
  }
}

function escapeHtml(value: string | undefined): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
