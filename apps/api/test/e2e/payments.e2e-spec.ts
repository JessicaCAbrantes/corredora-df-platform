import type { INestApplication } from "@nestjs/common";
import type { TestAgent } from "./helpers/test-auth";
import { createTestApp } from "./helpers/test-app";
import { loginAgent } from "./helpers/test-auth";
import {
  cancelActiveKitPickupRequests,
  countPaymentsForRequest,
  disconnectTestDb,
} from "./helpers/test-db";
import {
  resolveMockWebhookSecret,
  signMockPaidWebhook,
} from "./helpers/test-payments";
import { SERVICES, USERS } from "./helpers/constants";

describe("Payments E2E", () => {
  let app: INestApplication;
  let runner: TestAgent;
  let requestId: string;
  let paymentId: string;
  let providerPaymentId: string;
  let webhookSecret: string;

  beforeAll(async () => {
    app = await createTestApp();
    runner = await loginAgent(
      app,
      USERS.runner.email,
      USERS.runner.password,
    );

    const authSecret = process.env.AUTH_SECRET;
    if (!authSecret) {
      throw new Error("AUTH_SECRET is required for payment E2E tests");
    }
    webhookSecret =
      process.env.PAYMENT_WEBHOOK_SECRET ??
      resolveMockWebhookSecret(authSecret);

    await cancelActiveKitPickupRequests(USERS.runner.id, SERVICES.external);

    const created = await runner
      .post("/api/v1/kit-pickup-requests")
      .send({
        kitPickupServiceId: SERVICES.external,
        participant: {
          fullName: "E2E Payment Runner",
          email: "e2e-payment@example.com",
          phone: "61933334444",
          externalRegistrationCode: `E2E-PAY-${Date.now()}`,
        },
      })
      .expect(201);

    requestId = created.body.data.id;

    await runner
      .post(`/api/v1/kit-pickup-requests/${requestId}/accept-term`)
      .expect(200);

    const paymentStart = await runner
      .post(`/api/v1/kit-pickup-requests/${requestId}/payment`)
      .expect(200);

    paymentId = paymentStart.body.data.paymentId;
    providerPaymentId = `mock_pay_${paymentId}`;
  });

  afterAll(async () => {
    await app.close();
    await disconnectTestDb();
  });

  it("webhook confirma pagamento → PICKUP_PENDING / PAID", async () => {
    const { body, signature } = signMockPaidWebhook(
      {
        paymentId,
        providerPaymentId,
        kitPickupRequestId: requestId,
        amount: "10.00",
        currency: "BRL",
      },
      webhookSecret,
    );

    await runner
      .post("/api/v1/payments/webhook")
      .set("Content-Type", "application/json")
      .set("X-Corredora-Payment-Signature", signature)
      .send(body)
      .expect(200);

    const detail = await runner
      .get(`/api/v1/kit-pickup-requests/${requestId}`)
      .expect(200);

    expect(detail.body.data.status).toBe("PICKUP_PENDING");
    expect(detail.body.data.paymentStatus).toBe("PAID");
  });

  it("webhook duplicado é idempotente", async () => {
    const before = await runner
      .get(`/api/v1/kit-pickup-requests/${requestId}`)
      .expect(200);

    const { body, signature } = signMockPaidWebhook(
      {
        paymentId,
        providerPaymentId,
        kitPickupRequestId: requestId,
        amount: "10.00",
        currency: "BRL",
      },
      webhookSecret,
    );

    await runner
      .post("/api/v1/payments/webhook")
      .set("Content-Type", "application/json")
      .set("X-Corredora-Payment-Signature", signature)
      .send(body)
      .expect(200);

    const after = await runner
      .get(`/api/v1/kit-pickup-requests/${requestId}`)
      .expect(200);

    expect(after.body.data.status).toBe(before.body.data.status);
    expect(after.body.data.paymentStatus).toBe(before.body.data.paymentStatus);
    expect(after.body.data.updatedAt).toBe(before.body.data.updatedAt);

    const paymentCount = await countPaymentsForRequest(requestId);
    expect(paymentCount).toBe(1);
  });

  it("novo /payment após PAID retorna 409", async () => {
    const res = await runner
      .post(`/api/v1/kit-pickup-requests/${requestId}/payment`)
      .expect(409);

    expect(res.body.error.code).toBe("INVALID_STATUS");
  });
});
