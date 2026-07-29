import type { INestApplication } from "@nestjs/common";
import type { TestAgent } from "./helpers/test-auth";
import { createTestApp } from "./helpers/test-app";
import { loginAgent } from "./helpers/test-auth";
import {
  cancelActiveKitPickupRequests,
  disconnectTestDb,
  ensureEventRegistration,
} from "./helpers/test-db";
import { EVENTS, SERVICES, USERS } from "./helpers/constants";

describe("Kit Pickup Requests E2E", () => {
  let app: INestApplication;
  let runner: TestAgent;
  let participant2: TestAgent;
  let runnerRegistrationId: string;
  let participant2RegistrationId: string;

  beforeAll(async () => {
    app = await createTestApp();
    runner = await loginAgent(
      app,
      USERS.runner.email,
      USERS.runner.password,
    );
    participant2 = await loginAgent(
      app,
      USERS.participant2.email,
      USERS.participant2.password,
    );

    const runnerReg = await ensureEventRegistration(
      USERS.runner.id,
      EVENTS.internal,
    );
    const participant2Reg = await ensureEventRegistration(
      USERS.participant2.id,
      EVENTS.internal,
    );
    runnerRegistrationId = runnerReg.id;
    participant2RegistrationId = participant2Reg.id;
  });

  afterAll(async () => {
    await app.close();
    await disconnectTestDb();
  });

  async function createInternalRequest(
    agent: TestAgent,
    userId: string,
    registrationId: string,
  ) {
    await cancelActiveKitPickupRequests(userId, SERVICES.internal);

    return agent
      .post("/api/v1/kit-pickup-requests")
      .send({
        kitPickupServiceId: SERVICES.internal,
        registrationId,
      })
      .expect(201);
  }

  it("internal happy path: create → accept-term → PICKUP_PENDING / WAIVED", async () => {
    const created = await createInternalRequest(
      runner,
      USERS.runner.id,
      runnerRegistrationId,
    );
    expect(created.body.data.status).toBe("TERM_PENDING");
    expect(created.body.data.paymentStatus).toBe("UNPAID");
    expect(created.body.data.registrationMode).toBe("internal");
    expect(created.body.data.feeAmount).toBeNull();

    const accepted = await runner
      .post(`/api/v1/kit-pickup-requests/${created.body.data.id}/accept-term`)
      .expect(200);

    expect(accepted.body.data.status).toBe("PICKUP_PENDING");
    expect(accepted.body.data.paymentStatus).toBe("WAIVED");
    expect(accepted.body.data.term.accepted).toBe(true);
  });

  it("external happy path: create → accept-term → PAYMENT_PENDING / PENDING", async () => {
    await cancelActiveKitPickupRequests(
      USERS.runner.id,
      SERVICES.external,
    );

    const created = await runner
      .post("/api/v1/kit-pickup-requests")
      .send({
        kitPickupServiceId: SERVICES.external,
        participant: {
          fullName: "E2E External Runner",
          email: "e2e-external-runner@example.com",
          phone: "61911112222",
          externalRegistrationCode: `E2E-EXT-${Date.now()}`,
        },
      })
      .expect(201);

    expect(created.body.data.status).toBe("TERM_PENDING");
    expect(created.body.data.registrationMode).toBe("external");
    expect(created.body.data.feeAmount).toBe("10.00");

    const accepted = await runner
      .post(`/api/v1/kit-pickup-requests/${created.body.data.id}/accept-term`)
      .expect(200);

    expect(accepted.body.data.status).toBe("PAYMENT_PENDING");
    expect(accepted.body.data.paymentStatus).toBe("PENDING");
  });

  it("ownership: participant2 não acessa solicitação de runner (404)", async () => {
    const created = await createInternalRequest(
      runner,
      USERS.runner.id,
      runnerRegistrationId,
    );
    await runner
      .post(`/api/v1/kit-pickup-requests/${created.body.data.id}/accept-term`)
      .expect(200);

    const res = await participant2
      .get(`/api/v1/kit-pickup-requests/${created.body.data.id}`)
      .expect(404);

    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("casos negativos de criação", async () => {
    const cases: Array<{
      name: string;
      body: Record<string, unknown>;
      code: string;
    }> = [
      {
        name: "internal sem registrationId",
        body: { kitPickupServiceId: SERVICES.internal },
        code: "REGISTRATION_REQUIRED",
      },
      {
        name: "internal com participant",
        body: {
          kitPickupServiceId: SERVICES.internal,
          registrationId: participant2RegistrationId,
          participant: {
            fullName: "Invalid Internal",
            email: "invalid@example.com",
            phone: "61999998888",
            externalRegistrationCode: "X1",
          },
        },
        code: "PARTICIPANT_NOT_ALLOWED",
      },
      {
        name: "external sem participant",
        body: { kitPickupServiceId: SERVICES.external },
        code: "PARTICIPANT_REQUIRED",
      },
      {
        name: "external com registrationId",
        body: {
          kitPickupServiceId: SERVICES.external,
          registrationId: participant2RegistrationId,
          participant: {
            fullName: "External Invalid",
            email: "ext-invalid@example.com",
            phone: "61988887777",
            externalRegistrationCode: "EXT-001",
          },
        },
        code: "REGISTRATION_NOT_ALLOWED",
      },
      {
        name: "externalRegistrationCode apenas espaços",
        body: {
          kitPickupServiceId: SERVICES.external,
          participant: {
            fullName: "External Blank Code",
            email: "blank@example.com",
            phone: "61977776666",
            externalRegistrationCode: "   ",
          },
        },
        code: "EXTERNAL_CODE_REQUIRED",
      },
    ];

    for (const testCase of cases) {
      const res = await participant2
        .post("/api/v1/kit-pickup-requests")
        .send(testCase.body)
        .expect(400);

      expect(res.body.error.code).toBe(testCase.code);
    }
  });
});
