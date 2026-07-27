import { describe, expect, it, vi } from "vitest";
import type { GetEventsListParams } from "../types/events-list";
import { buildEventsListQuery, createHttpGetEvents } from "./http-get-events";

const BASE_PARAMS: GetEventsListParams = {
  page: 1,
  perPage: 20,
  sort: "date",
  order: "asc",
};

const META = {
  page: 1,
  perPage: 20,
  total: 1,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

const PAID_DTO = {
  id: "evt_01",
  name: "Meia Maratona de Brasília",
  slug: "meia-maratona-brasilia",
  date: "2026-08-16T10:00:00.000Z",
  city: "Brasília",
  category: "half-marathon",
  distance: "21K",
  status: "active",
  registrationStatus: "open",
  registrationOpen: true,
  price: { amount: 149, currency: "BRL" },
  coverImage: "https://example.com/meia.jpg",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function createAdapter(response: Response | Error) {
  const fetchFn = vi.fn(async () => {
    if (response instanceof Error) {
      throw response;
    }
    return response;
  });
  const getEvents = createHttpGetEvents({
    baseUrl: "http://localhost:3001",
    fetchFn: fetchFn as unknown as typeof fetch,
  });
  return { getEvents, fetchFn };
}

function requestedUrl(fetchFn: ReturnType<typeof vi.fn>): URL {
  const firstArg = fetchFn.mock.calls[0]?.[0] as string;
  return new URL(firstArg);
}

const CURRENCY_BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

describe("buildEventsListQuery", () => {
  it("always sends page, perPage, sort and order", () => {
    const query = new URLSearchParams(buildEventsListQuery(BASE_PARAMS));
    expect(query.get("page")).toBe("1");
    expect(query.get("perPage")).toBe("20");
    expect(query.get("sort")).toBe("date");
    expect(query.get("order")).toBe("asc");
  });

  it("sends defined filters", () => {
    const query = new URLSearchParams(
      buildEventsListQuery({
        ...BASE_PARAMS,
        search: "maratona",
        status: "active",
        category: "half-marathon",
        city: "Brasília",
        dateFrom: "2026-01-01",
        dateTo: "2026-12-31",
      }),
    );
    expect(query.get("search")).toBe("maratona");
    expect(query.get("status")).toBe("active");
    expect(query.get("category")).toBe("half-marathon");
    expect(query.get("city")).toBe("Brasília");
    expect(query.get("dateFrom")).toBe("2026-01-01");
    expect(query.get("dateTo")).toBe("2026-12-31");
  });

  it("omits undefined optionals", () => {
    const query = new URLSearchParams(buildEventsListQuery(BASE_PARAMS));
    for (const key of [
      "search",
      "status",
      "category",
      "city",
      "dateFrom",
      "dateTo",
      "registrationOpen",
    ]) {
      expect(query.has(key)).toBe(false);
    }
  });

  it("serializes registrationOpen=true", () => {
    const query = new URLSearchParams(
      buildEventsListQuery({ ...BASE_PARAMS, registrationOpen: true }),
    );
    expect(query.get("registrationOpen")).toBe("true");
  });

  it("serializes registrationOpen=false (no truthiness loss)", () => {
    const query = new URLSearchParams(
      buildEventsListQuery({ ...BASE_PARAMS, registrationOpen: false }),
    );
    expect(query.get("registrationOpen")).toBe("false");
  });

  it("URL-encodes city and search", () => {
    const raw = buildEventsListQuery({
      ...BASE_PARAMS,
      search: "corrida noturna",
      city: "São Sebastião",
    });
    expect(raw).toContain("search=corrida+noturna");
    expect(raw).toContain(`city=S${encodeURIComponent("ã")}o+Sebasti`);
    const query = new URLSearchParams(raw);
    expect(query.get("city")).toBe("São Sebastião");
  });

  it("does not send empty strings", () => {
    const query = new URLSearchParams(
      buildEventsListQuery({ ...BASE_PARAMS, search: "", city: "" }),
    );
    expect(query.has("search")).toBe(false);
    expect(query.has("city")).toBe(false);
  });
});

describe("createHttpGetEvents — success mapping", () => {
  it("maps a paid open event to EventListItem", async () => {
    const { getEvents, fetchFn } = createAdapter(
      jsonResponse({ data: [PAID_DTO], meta: META }),
    );

    const result = await getEvents(BASE_PARAMS);

    expect(requestedUrl(fetchFn).pathname).toBe("/api/v1/events");
    expect(result).toEqual({
      status: "success",
      events: [
        {
          slug: "meia-maratona-brasilia",
          title: "Meia Maratona de Brasília",
          date: "16/08/2026",
          dateTime: "2026-08-16",
          city: "Brasília",
          distance: "21K",
          price: CURRENCY_BRL.format(149),
          status: "open",
          image: {
            src: "https://example.com/meia.jpg",
            alt: "Meia Maratona de Brasília",
          },
        },
      ],
      pagination: { page: 1, perPage: 20, total: 1, totalPages: 1 },
    });
  });

  it("returns success with empty events for an empty list", async () => {
    const { getEvents } = createAdapter(
      jsonResponse({
        data: [],
        meta: { ...META, total: 0, totalPages: 0 },
      }),
    );

    const result = await getEvents(BASE_PARAMS);

    expect(result).toEqual({
      status: "success",
      events: [],
      pagination: { page: 1, perPage: 20, total: 0, totalPages: 0 },
    });
  });

  it("preserves requested page when page > totalPages", async () => {
    const { getEvents } = createAdapter(
      jsonResponse({
        data: [],
        meta: {
          page: 99,
          perPage: 20,
          total: 8,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      }),
    );

    const result = await getEvents({ ...BASE_PARAMS, page: 99 });

    expect(result).toEqual({
      status: "success",
      events: [],
      pagination: { page: 99, perPage: 20, total: 8, totalPages: 1 },
    });
  });

  it("reduces 6-field HTTP meta to 4-field Application pagination", async () => {
    const { getEvents } = createAdapter(
      jsonResponse({ data: [PAID_DTO], meta: META }),
    );

    const result = await getEvents(BASE_PARAMS);

    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.pagination).not.toHaveProperty("hasNextPage");
      expect(result.pagination).not.toHaveProperty("hasPreviousPage");
    }
  });
});

describe("createHttpGetEvents — status mapping", () => {
  async function statusOf(
    lifecycle: string,
    registrationStatus: string,
  ): Promise<string> {
    const { getEvents } = createAdapter(
      jsonResponse({
        data: [{ ...PAID_DTO, status: lifecycle, registrationStatus }],
        meta: META,
      }),
    );
    const result = await getEvents(BASE_PARAMS);
    if (result.status !== "success") {
      throw new Error("expected success");
    }
    return result.events[0]!.status;
  }

  it("active + open → open", async () => {
    expect(await statusOf("active", "open")).toBe("open");
  });

  it("active + upcoming → upcoming", async () => {
    expect(await statusOf("active", "upcoming")).toBe("upcoming");
  });

  it("active + closed → closed", async () => {
    expect(await statusOf("active", "closed")).toBe("closed");
  });

  it("cancelled + any → closed", async () => {
    expect(await statusOf("cancelled", "open")).toBe("closed");
  });

  it("completed + any → closed", async () => {
    expect(await statusOf("completed", "upcoming")).toBe("closed");
  });
});

describe("createHttpGetEvents — price", () => {
  async function priceOf(price: unknown): Promise<string | undefined> {
    const { getEvents } = createAdapter(
      jsonResponse({ data: [{ ...PAID_DTO, price }], meta: META }),
    );
    const result = await getEvents(BASE_PARAMS);
    if (result.status !== "success") {
      throw new Error("expected success");
    }
    return result.events[0]!.price;
  }

  it("formats paid price as pt-BR currency label", async () => {
    expect(await priceOf({ amount: 149, currency: "BRL" })).toBe(
      CURRENCY_BRL.format(149),
    );
  });

  it("omits price for explicitly free events (null)", async () => {
    const { getEvents } = createAdapter(
      jsonResponse({ data: [{ ...PAID_DTO, price: null }], meta: META }),
    );
    const result = await getEvents(BASE_PARAMS);
    if (result.status !== "success") {
      throw new Error("expected success");
    }
    expect(result.events[0]).not.toHaveProperty("price");
  });

  it("amount 0 is paid-zero, not free", async () => {
    expect(await priceOf({ amount: 0, currency: "BRL" })).toBe(
      CURRENCY_BRL.format(0),
    );
  });
});

describe("createHttpGetEvents — dates (UTC)", () => {
  it("keeps the UTC day for early-hour instants", async () => {
    const { getEvents } = createAdapter(
      jsonResponse({
        data: [{ ...PAID_DTO, date: "2026-08-01T01:00:00.000Z" }],
        meta: META,
      }),
    );
    const result = await getEvents(BASE_PARAMS);
    if (result.status !== "success") {
      throw new Error("expected success");
    }
    expect(result.events[0]!.dateTime).toBe("2026-08-01");
    expect(result.events[0]!.date).toBe("01/08/2026");
  });
});

describe("createHttpGetEvents — image", () => {
  it("maps coverImage to image.src with name as alt", async () => {
    const { getEvents } = createAdapter(
      jsonResponse({ data: [PAID_DTO], meta: META }),
    );
    const result = await getEvents(BASE_PARAMS);
    if (result.status !== "success") {
      throw new Error("expected success");
    }
    expect(result.events[0]!.image).toEqual({
      src: "https://example.com/meia.jpg",
      alt: "Meia Maratona de Brasília",
    });
  });

  it("omits src when coverImage is defensively empty", async () => {
    const { getEvents } = createAdapter(
      jsonResponse({ data: [{ ...PAID_DTO, coverImage: "" }], meta: META }),
    );
    const result = await getEvents(BASE_PARAMS);
    if (result.status !== "success") {
      throw new Error("expected success");
    }
    expect(result.events[0]!.image).toEqual({
      alt: "Meia Maratona de Brasília",
    });
  });
});

describe("createHttpGetEvents — errors", () => {
  it("maps HTTP 400 to error with API message", async () => {
    const { getEvents } = createAdapter(
      jsonResponse(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Dados inválidos.",
            status: 400,
            details: [],
          },
        },
        400,
      ),
    );

    expect(await getEvents(BASE_PARAMS)).toEqual({
      status: "error",
      message: "Dados inválidos.",
    });
  });

  it("maps HTTP 500 to generic error message", async () => {
    const { getEvents } = createAdapter(
      jsonResponse({ statusCode: 500, message: "Internal server error" }, 500),
    );

    expect(await getEvents(BASE_PARAMS)).toEqual({
      status: "error",
      message: "Não foi possível carregar as corridas.",
    });
  });

  it("maps network failure to generic error", async () => {
    const { getEvents } = createAdapter(new Error("network down"));

    expect(await getEvents(BASE_PARAMS)).toEqual({
      status: "error",
      message: "Não foi possível carregar as corridas.",
    });
  });

  it("maps invalid JSON to generic error", async () => {
    const { getEvents } = createAdapter(
      new Response("<html>not json</html>", { status: 200 }),
    );

    expect(await getEvents(BASE_PARAMS)).toEqual({
      status: "error",
      message: "Não foi possível carregar as corridas.",
    });
  });

  it("maps unexpected body shape to generic error", async () => {
    const { getEvents } = createAdapter(
      jsonResponse({ data: "not-an-array" }),
    );

    expect(await getEvents(BASE_PARAMS)).toEqual({
      status: "error",
      message: "Não foi possível carregar as corridas.",
    });
  });
});
