import { describe, expect, it, vi } from "vitest";
import {
  createHttpCreateKitPickupRequest,
  createHttpGetMyKitPickupRequests,
  mapKitPickupRequestItem,
} from "./http-kit-pickup-requests";

const sample = {
  id: "kpr_01",
  status: "DELIVERED",
  statusLabel: "Entregue",
  paymentStatus: "PAID",
  paymentStatusLabel: "Pagamento confirmado",
  registrationMode: "external",
  feeAmount: "10.00",
  feeCurrency: "BRL",
  event: { id: "evt_03", name: "5K", slug: "5k" },
  service: {
    id: "kps_02",
    title: "Retirada",
    pickupLabel: "Asa Norte · 10–12 ago",
  },
  registrationId: null,
  participant: {
    fullName: "Ana",
    email: "ana@example.com",
    phone: "61999999999",
    externalRegistrationCode: "INS-1",
  },
  term: { version: "v1", accepted: true, acceptedAt: "2026-07-27T13:00:00.000Z" },
  timeline: {
    pickedUpAt: "2026-07-28T10:30:00.000Z",
    custodyAt: "2026-07-28T11:00:00.000Z",
    readyAt: "2026-07-28T12:00:00.000Z",
    deliveredAt: "2026-07-28T15:30:00.000Z",
  },
  handover: {
    receivedByName: "Ana",
    notes: "Entregue no ponto combinado.",
    deliveredAt: "2026-07-28T15:30:00.000Z",
  },
  createdAt: "2026-07-27T12:00:00.000Z",
  updatedAt: "2026-07-28T15:30:00.000Z",
};

describe("mapKitPickupRequestItem", () => {
  it("maps a valid enriched payload", () => {
    const mapped = mapKitPickupRequestItem(sample);
    expect(mapped?.service.pickupLabel).toBe("Asa Norte · 10–12 ago");
    expect(mapped?.paymentStatusLabel).toBe("Pagamento confirmado");
    expect(mapped?.timeline.deliveredAt).toBe("2026-07-28T15:30:00.000Z");
    expect(mapped?.handover?.receivedByName).toBe("Ana");
  });

  it("rejects invalid status", () => {
    expect(mapKitPickupRequestItem({ ...sample, status: "NOT_A_STATUS" })).toBeNull();
  });

  it("rejects missing timeline", () => {
    expect(
      mapKitPickupRequestItem({ ...sample, timeline: undefined }),
    ).toBeNull();
  });
});

describe("createHttpCreateKitPickupRequest", () => {
  it("posts without client-controlled userId/paymentStatus", async () => {
    const fetchFn = vi.fn(async () =>
      Response.json({ data: sample }, { status: 201 }),
    );
    const create = createHttpCreateKitPickupRequest({
      baseUrl: "http://api.test",
      fetchFn: fetchFn as unknown as typeof fetch,
    });
    const result = await create({
      kitPickupServiceId: "kps_02",
      participant: {
        fullName: "Ana",
        email: "ana@example.com",
        phone: "61999999999",
        externalRegistrationCode: "INS-1",
      },
    });
    expect(result.ok).toBe(true);
    const init = fetchFn.mock.calls[0]?.[1] as RequestInit;
    expect(init.credentials).toBe("include");
    const body = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(body.userId).toBeUndefined();
    expect(body.paymentStatus).toBeUndefined();
    expect(body.status).toBeUndefined();
  });

  it("maps 401 to UNAUTHORIZED", async () => {
    const create = createHttpCreateKitPickupRequest({
      baseUrl: "http://api.test",
      fetchFn: (async () =>
        Response.json(
          { error: { code: "UNAUTHORIZED" } },
          { status: 401 },
        )) as typeof fetch,
    });
    const result = await create({
      kitPickupServiceId: "kps_01",
      registrationId: "reg_1",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("UNAUTHORIZED");
  });
});

describe("createHttpGetMyKitPickupRequests", () => {
  it("returns only mapped own requests", async () => {
    const getMine = createHttpGetMyKitPickupRequests({
      baseUrl: "http://api.test",
      fetchFn: (async () =>
        Response.json({ data: [sample] }, { status: 200 })) as typeof fetch,
    });
    const result = await getMine();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.paymentStatusLabel).toBe("Pagamento confirmado");
    }
  });
});
