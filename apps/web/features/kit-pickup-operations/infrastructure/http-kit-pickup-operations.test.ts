import { describe, expect, it, vi } from "vitest";
import {
  createHttpGetKitPickupOperations,
  createHttpHandoverKitPickupRequest,
  createHttpMarkKitPickupReady,
  createHttpPickupKitPickupRequest,
  createHttpTakeKitPickupIntoCustody,
  mapOperationalRequestItem,
} from "./http-kit-pickup-operations";

const sample = {
  id: "kpr_01",
  status: "PICKUP_PENDING",
  statusLabel: "Aguardando retirada",
  registrationMode: "external",
  registrationId: null,
  feeAmountSnapshot: "10.00",
  feeCurrencySnapshot: "BRL",
  paymentStatus: "PAID",
  termAcceptedAt: "2026-07-27T13:00:00.000Z",
  event: {
    id: "evt_01",
    name: "Corrida Asa Norte",
    slug: "corrida-asa-norte",
    date: "2026-08-16T10:00:00.000Z",
    city: "Brasília",
  },
  service: {
    id: "kps_01",
    title: "Retirada de kit",
    pickupLabel: "Asa Norte · 10–12 ago",
  },
  participant: {
    fullName: "Ana",
    email: "ana@example.com",
    phone: "61999999999",
    externalRegistrationCode: "EXT-1",
  },
  pickedUpAt: null,
  pickedUpBy: null,
  custodyAt: null,
  custodyBy: null,
  readyAt: null,
  readyBy: null,
  deliveredAt: null,
  deliveredBy: null,
  receivedByName: null,
  handoverNotes: null,
  createdAt: "2026-07-27T12:00:00.000Z",
  updatedAt: "2026-07-27T12:00:00.000Z",
};

describe("mapOperationalRequestItem", () => {
  it("maps a valid operational payload", () => {
    const mapped = mapOperationalRequestItem(sample);
    expect(mapped?.service.title).toBe("Retirada de kit");
    expect(mapped?.service.pickupLabel).toBe("Asa Norte · 10–12 ago");
    expect(mapped?.registrationId).toBeNull();
  });

  it("maps internal registrationId", () => {
    const mapped = mapOperationalRequestItem({
      ...sample,
      registrationMode: "internal",
      registrationId: "reg_01",
      participant: null,
    });
    expect(mapped?.registrationId).toBe("reg_01");
    expect(mapped?.participant).toBeNull();
  });

  it("rejects invalid status", () => {
    expect(
      mapOperationalRequestItem({ ...sample, status: "NOT_A_STATUS" }),
    ).toBeNull();
  });
});

describe("createHttpGetKitPickupOperations", () => {
  it("lists operations with filters and pagination", async () => {
    const fetchFn = vi.fn(async () =>
      Response.json(
        {
          data: [sample],
          meta: {
            page: 2,
            perPage: 10,
            total: 15,
            totalPages: 2,
            hasNextPage: false,
            hasPreviousPage: true,
          },
        },
        { status: 200 },
      ),
    );
    const getOperations = createHttpGetKitPickupOperations({
      baseUrl: "http://api.test",
      fetchFn: fetchFn as unknown as typeof fetch,
    });
    const result = await getOperations({
      status: "PICKUP_PENDING",
      registrationMode: "external",
      page: 2,
      perPage: 10,
      sort: "createdAt",
      order: "asc",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toHaveLength(1);
      expect(result.meta.page).toBe(2);
    }
    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toContain("/api/v1/kit-pickup-requests/operations?");
    expect(url).toContain("status=PICKUP_PENDING");
    expect(url).toContain("registrationMode=external");
    expect(url).toContain("page=2");
    expect(init.credentials).toBe("include");
  });

  it("maps 401 to UNAUTHORIZED", async () => {
    const getOperations = createHttpGetKitPickupOperations({
      baseUrl: "http://api.test",
      fetchFn: (async () =>
        Response.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 })) as typeof fetch,
    });
    const result = await getOperations();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("UNAUTHORIZED");
  });

  it("maps 403 to FORBIDDEN", async () => {
    const getOperations = createHttpGetKitPickupOperations({
      baseUrl: "http://api.test",
      fetchFn: (async () =>
        Response.json({ error: { code: "FORBIDDEN" } }, { status: 403 })) as typeof fetch,
    });
    const result = await getOperations();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("FORBIDDEN");
  });
});

describe("operational transitions", () => {
  it("posts pickup without client-controlled fields", async () => {
    const fetchFn = vi.fn(async () =>
      Response.json(
        { data: { ...sample, status: "PICKED_UP", statusLabel: "Retirado" } },
        { status: 200 },
      ),
    );
    const pickup = createHttpPickupKitPickupRequest({
      baseUrl: "http://api.test",
      fetchFn: fetchFn as unknown as typeof fetch,
    });
    const result = await pickup("kpr_01");
    expect(result.ok).toBe(true);
    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("http://api.test/api/v1/kit-pickup-requests/kpr_01/pickup");
    expect(init.method).toBe("POST");
    expect(init.credentials).toBe("include");
    expect(init.body).toBeUndefined();
  });

  it("maps 409 to CONFLICT on take-into-custody", async () => {
    const takeIntoCustody = createHttpTakeKitPickupIntoCustody({
      baseUrl: "http://api.test",
      fetchFn: (async () =>
        Response.json(
          { error: { code: "INVALID_STATUS", message: "conflict" } },
          { status: 409 },
        )) as typeof fetch,
    });
    const result = await takeIntoCustody("kpr_01");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("CONFLICT");
  });

  it("maps 404 to NOT_FOUND on ready", async () => {
    const ready = createHttpMarkKitPickupReady({
      baseUrl: "http://api.test",
      fetchFn: (async () =>
        Response.json({ error: { code: "NOT_FOUND" } }, { status: 404 })) as typeof fetch,
    });
    const result = await ready("kpr_missing");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("NOT_FOUND");
  });
});

describe("createHttpHandoverKitPickupRequest", () => {
  it("sends required receivedByName and optional notes", async () => {
    const fetchFn = vi.fn(async () =>
      Response.json(
        {
          data: {
            ...sample,
            status: "DELIVERED",
            statusLabel: "Entregue",
            receivedByName: "Maria",
            handoverNotes: "Entregue no balcão",
          },
        },
        { status: 200 },
      ),
    );
    const handover = createHttpHandoverKitPickupRequest({
      baseUrl: "http://api.test",
      fetchFn: fetchFn as unknown as typeof fetch,
    });
    const result = await handover("kpr_01", {
      receivedByName: "Maria",
      notes: "Entregue no balcão",
    });
    expect(result.ok).toBe(true);
    const init = fetchFn.mock.calls[0]?.[1] as unknown as RequestInit;
    const body = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(body.receivedByName).toBe("Maria");
    expect(body.notes).toBe("Entregue no balcão");
    expect(body.userId).toBeUndefined();
    expect(body.status).toBeUndefined();
    expect(body.paymentStatus).toBeUndefined();
    expect(body.deliveredBy).toBeUndefined();
  });

  it("omits notes when not provided", async () => {
    const fetchFn = vi.fn(async () =>
      Response.json({ data: sample }, { status: 200 }),
    );
    const handover = createHttpHandoverKitPickupRequest({
      baseUrl: "http://api.test",
      fetchFn: fetchFn as unknown as typeof fetch,
    });
    await handover("kpr_01", { receivedByName: "Maria" });
    const init = fetchFn.mock.calls[0]?.[1] as unknown as RequestInit;
    const body = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(body.receivedByName).toBe("Maria");
    expect(body.notes).toBeUndefined();
  });
});
