import type { INestApplication } from "@nestjs/common";
import type { TestAgent } from "./helpers/test-auth";
import { createTestApp } from "./helpers/test-app";
import { api, loginAgent } from "./helpers/test-auth";
import {
  cancelActiveKitPickupRequests,
  disconnectTestDb,
  ensureEventRegistration,
} from "./helpers/test-db";
import { EVENTS, SERVICES, USERS } from "./helpers/constants";

describe("Kit Pickup Operations E2E", () => {
  let app: INestApplication;
  let runner: TestAgent;
  let participant2: TestAgent;
  let stateMachineRequestId: string;

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

    const registration = await ensureEventRegistration(
      USERS.participant2.id,
      EVENTS.internal,
    );

    await cancelActiveKitPickupRequests(
      USERS.participant2.id,
      SERVICES.internal,
    );

    const created = await participant2
      .post("/api/v1/kit-pickup-requests")
      .send({
        kitPickupServiceId: SERVICES.internal,
        registrationId: registration.id,
      })
      .expect(201);

    stateMachineRequestId = created.body.data.id;

    await participant2
      .post(`/api/v1/kit-pickup-requests/${stateMachineRequestId}/accept-term`)
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
    await disconnectTestDb();
  });

  it("anônimo em /operations retorna 401", async () => {
    const res = await api(app)
      .get("/api/v1/kit-pickup-requests/operations")
      .expect(401);

    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("usuário comum em /operations retorna 403", async () => {
    const res = await participant2
      .get("/api/v1/kit-pickup-requests/operations")
      .expect(403);

    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("operador em /operations retorna 200", async () => {
    await runner.get("/api/v1/kit-pickup-requests/operations").expect(200);
  });

  it("participant2 não pode executar pickup (403)", async () => {
    const res = await participant2
      .post(`/api/v1/kit-pickup-requests/${stateMachineRequestId}/pickup`)
      .expect(403);

    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("máquina de estados: transições válidas e conflitos fora de ordem", async () => {
    await runner
      .post(`/api/v1/kit-pickup-requests/${stateMachineRequestId}/take-into-custody`)
      .expect(409);

    const pickup = await runner
      .post(`/api/v1/kit-pickup-requests/${stateMachineRequestId}/pickup`)
      .expect(200);
    expect(pickup.body.data.status).toBe("PICKED_UP");

    const pickupAgain = await runner
      .post(`/api/v1/kit-pickup-requests/${stateMachineRequestId}/pickup`)
      .expect(200);
    expect(pickupAgain.body.data.status).toBe("PICKED_UP");
    expect(pickupAgain.body.data.pickedUpAt).toBe(pickup.body.data.pickedUpAt);

    await runner
      .post(`/api/v1/kit-pickup-requests/${stateMachineRequestId}/ready`)
      .expect(409);

    const custody = await runner
      .post(`/api/v1/kit-pickup-requests/${stateMachineRequestId}/take-into-custody`)
      .expect(200);
    expect(custody.body.data.status).toBe("IN_CUSTODY");

    const custodyAgain = await runner
      .post(`/api/v1/kit-pickup-requests/${stateMachineRequestId}/take-into-custody`)
      .expect(200);
    expect(custodyAgain.body.data.custodyAt).toBe(custody.body.data.custodyAt);

    const ready = await runner
      .post(`/api/v1/kit-pickup-requests/${stateMachineRequestId}/ready`)
      .expect(200);
    expect(ready.body.data.status).toBe("READY_FOR_HANDOVER");

    const readyAgain = await runner
      .post(`/api/v1/kit-pickup-requests/${stateMachineRequestId}/ready`)
      .expect(200);
    expect(readyAgain.body.data.readyAt).toBe(ready.body.data.readyAt);

    const handover = await runner
      .post(`/api/v1/kit-pickup-requests/${stateMachineRequestId}/handover`)
      .send({ receivedByName: "E2E Recipient", notes: "e2e handover" })
      .expect(200);
    expect(handover.body.data.status).toBe("DELIVERED");

    const handoverAgain = await runner
      .post(`/api/v1/kit-pickup-requests/${stateMachineRequestId}/handover`)
      .send({ receivedByName: "E2E Recipient", notes: "e2e handover" })
      .expect(200);
    expect(handoverAgain.body.data.deliveredAt).toBe(
      handover.body.data.deliveredAt,
    );

    await runner
      .post(`/api/v1/kit-pickup-requests/${stateMachineRequestId}/pickup`)
      .expect(409);
  });
});
