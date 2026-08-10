import { describe, expect, it, vi } from "vitest";
import { createHttpGetEventDetails } from "./http-get-event-details";

const PAID_DTO = {
  id: "evt_01_meia",
  slug: "meia-maratona-brasilia",
  name: "Meia Maratona de Brasília",
  date: "2026-08-16T10:00:00.000Z",
  city: "Brasília",
  distance: "21K",
  status: "active",
  registrationStatus: "open",
  registrationOpen: true,
  price: { amount: 149, currency: "BRL" },
  coverImage: "https://example.com/meia.jpg",
  kit: {
    available: true,
    description: "Camiseta oficial e número de peito.",
  },
  route: {
    available: true,
    summary: "Percurso plano pelo Eixo Monumental.",
    distanceLabel: "21,1 km",
  },
  schedule: {
    items: [
      { id: "sch_1", label: "Abertura da arena", timeLabel: "05:30" },
      { id: "sch_2", label: "Largada", timeLabel: "06:30" },
    ],
  },
  regulation: {
    summary: "Participação sujeita ao regulamento oficial.",
    href: "#regulamento",
    linkLabel: "Ver regulamento",
  },
};

const FREE_DTO = {
  ...PAID_DTO,
  id: "evt_03_5k_ini",
  slug: "5k-iniciantes-df",
  name: "5K Iniciantes DF",
  date: "2026-09-01T01:00:00.000Z",
  city: "Taguatinga",
  distance: "5K",
  registrationStatus: "upcoming",
  registrationOpen: false,
  price: null,
  coverImage: "/events/5k-iniciantes-df.svg",
  kit: {
    available: false,
    description: "Informações do kit em breve.",
  },
  route: {
    available: false,
    summary: "Percurso ainda não divulgado.",
    distanceLabel: "5K",
  },
  schedule: { items: [] },
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
  const getEventDetails = createHttpGetEventDetails({
    baseUrl: "http://localhost:3001",
    fetchFn: fetchFn as unknown as typeof fetch,
  });
  return { getEventDetails, fetchFn };
}

function requestedUrl(fetchFn: ReturnType<typeof vi.fn>): string {
  return fetchFn.mock.calls[0]?.[0] as string;
}

const CURRENCY_BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const EXPECTED_DATE_10UTC = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "UTC",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
}).format(new Date("2026-08-16T10:00:00.000Z"));

const EXPECTED_TIME_10UTC = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "UTC",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
}).format(new Date("2026-08-16T10:00:00.000Z"));

const EXPECTED_DATE_01UTC = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "UTC",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
}).format(new Date("2026-09-01T01:00:00.000Z"));

describe("createHttpGetEventDetails — success mapping", () => {
  it("maps a paid event to EventDetailsData", async () => {
    const { getEventDetails } = createAdapter(
      jsonResponse({ data: PAID_DTO }),
    );

    const result = await getEventDetails("meia-maratona-brasilia");

    expect(result.status).toBe("success");
    if (result.status !== "success") return;

    expect(result.event.name).toBe("Meia Maratona de Brasília");
    expect(result.event.slug).toBe("meia-maratona-brasilia");
    expect(result.event.pricing.currentPriceLabel).toBe(
      CURRENCY_BRL.format(149),
    );
    expect(result.event.pricing.originalPriceLabel).toBeUndefined();
    expect(result.event.pricing.discountLabel).toBeUndefined();
  });

  it("maps a free event (price null) to Gratuito", async () => {
    const { getEventDetails } = createAdapter(
      jsonResponse({ data: FREE_DTO }),
    );

    const result = await getEventDetails("5k-iniciantes-df");

    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(result.event.pricing.currentPriceLabel).toBe("Gratuito");
  });

  it("preserves id on the Application contract", async () => {
    const { getEventDetails } = createAdapter(
      jsonResponse({ data: PAID_DTO }),
    );

    const result = await getEventDetails("meia-maratona-brasilia");

    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(result.event.id).toBe("evt_01_meia");
  });

  it("URL-encodes the slug in the request path", async () => {
    const { getEventDetails, fetchFn } = createAdapter(
      jsonResponse({ data: PAID_DTO }),
    );

    await getEventDetails("corrida/noturna");

    expect(requestedUrl(fetchFn)).toBe(
      "http://localhost:3001/api/v1/events/by-slug/corrida%2Fnoturna",
    );
  });

  it("formats dateLabel and timeLabel in UTC (no local day rollover)", async () => {
    const { getEventDetails } = createAdapter(
      jsonResponse({ data: PAID_DTO }),
    );

    const result = await getEventDetails("meia-maratona-brasilia");

    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(result.event.dateLabel).toBe(EXPECTED_DATE_10UTC);
    expect(result.event.timeLabel).toBe(EXPECTED_TIME_10UTC);
  });

  it("keeps early-UTC morning on the same calendar day", async () => {
    const { getEventDetails } = createAdapter(
      jsonResponse({ data: FREE_DTO }),
    );

    const result = await getEventDetails("5k-iniciantes-df");

    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(result.event.dateLabel).toBe(EXPECTED_DATE_01UTC);
    expect(result.event.dateLabel).toContain("01");
  });

  it("maps city → locationLabel", async () => {
    const { getEventDetails } = createAdapter(
      jsonResponse({ data: PAID_DTO }),
    );

    const result = await getEventDetails("meia-maratona-brasilia");

    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(result.event.locationLabel).toBe("Brasília");
  });

  it("maps distance → distanceLabel", async () => {
    const { getEventDetails } = createAdapter(
      jsonResponse({ data: PAID_DTO }),
    );

    const result = await getEventDetails("meia-maratona-brasilia");

    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(result.event.distanceLabel).toBe("21K");
  });

  it("omits example.com placeholder coverImage (Faculty MVP F4)", async () => {
    const { getEventDetails } = createAdapter(
      jsonResponse({ data: PAID_DTO }),
    );

    const result = await getEventDetails("meia-maratona-brasilia");

    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(result.event.imageSrc).toBeUndefined();
    expect(result.event.imageAlt).toBe("Meia Maratona de Brasília");
  });

  it("maps non-placeholder coverImage → imageSrc and name → imageAlt", async () => {
    const { getEventDetails } = createAdapter(
      jsonResponse({
        data: { ...PAID_DTO, coverImage: "/events/meia.svg" },
      }),
    );

    const result = await getEventDetails("meia-maratona-brasilia");

    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(result.event.imageSrc).toBe("/events/meia.svg");
    expect(result.event.imageAlt).toBe("Meia Maratona de Brasília");
  });

  it("preserves registrationStatus from the backend", async () => {
    const { getEventDetails } = createAdapter(
      jsonResponse({
        data: { ...PAID_DTO, registrationStatus: "closed", registrationOpen: false },
      }),
    );

    const result = await getEventDetails("meia-maratona-brasilia");

    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(result.event.registrationStatus).toBe("closed");
  });

  it("formats paid price with Intl currency", async () => {
    const { getEventDetails } = createAdapter(
      jsonResponse({ data: PAID_DTO }),
    );

    const result = await getEventDetails("meia-maratona-brasilia");

    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(result.event.pricing.currentPriceLabel).toBe(
      CURRENCY_BRL.format(149),
    );
  });

  it('maps price null → currentPriceLabel "Gratuito"', async () => {
    const { getEventDetails } = createAdapter(
      jsonResponse({ data: { ...PAID_DTO, price: null } }),
    );

    const result = await getEventDetails("meia-maratona-brasilia");

    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(result.event.pricing.currentPriceLabel).toBe("Gratuito");
  });

  it('maps amount 0 → "R$ 0,00" (not Gratuito)', async () => {
    const { getEventDetails } = createAdapter(
      jsonResponse({
        data: { ...PAID_DTO, price: { amount: 0, currency: "BRL" } },
      }),
    );

    const result = await getEventDetails("meia-maratona-brasilia");

    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(result.event.pricing.currentPriceLabel).toBe(
      CURRENCY_BRL.format(0),
    );
    expect(result.event.pricing.currentPriceLabel).not.toBe("Gratuito");
  });

  it("maps kit directly", async () => {
    const { getEventDetails } = createAdapter(
      jsonResponse({ data: PAID_DTO }),
    );

    const result = await getEventDetails("meia-maratona-brasilia");

    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(result.event.kit).toEqual({
      available: true,
      description: "Camiseta oficial e número de peito.",
    });
  });

  it("maps route directly", async () => {
    const { getEventDetails } = createAdapter(
      jsonResponse({ data: PAID_DTO }),
    );

    const result = await getEventDetails("meia-maratona-brasilia");

    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(result.event.route).toEqual({
      available: true,
      summary: "Percurso plano pelo Eixo Monumental.",
      distanceLabel: "21,1 km",
    });
  });

  it("preserves schedule.items without reformatting", async () => {
    const { getEventDetails } = createAdapter(
      jsonResponse({ data: PAID_DTO }),
    );

    const result = await getEventDetails("meia-maratona-brasilia");

    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(result.event.schedule.items).toEqual([
      { id: "sch_1", label: "Abertura da arena", timeLabel: "05:30" },
      { id: "sch_2", label: "Largada", timeLabel: "06:30" },
    ]);
  });

  it("preserves regulation as-is", async () => {
    const { getEventDetails } = createAdapter(
      jsonResponse({ data: PAID_DTO }),
    );

    const result = await getEventDetails("meia-maratona-brasilia");

    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(result.event.regulation).toEqual({
      summary: "Participação sujeita ao regulamento oficial.",
      href: "#regulamento",
      linkLabel: "Ver regulamento",
    });
  });

  it("strips trailing slash from baseUrl", async () => {
    const fetchFn = vi.fn(async () => jsonResponse({ data: PAID_DTO }));
    const getEventDetails = createHttpGetEventDetails({
      baseUrl: "http://localhost:3001/",
      fetchFn: fetchFn as unknown as typeof fetch,
    });

    await getEventDetails("meia-maratona-brasilia");

    expect(requestedUrl(fetchFn)).toBe(
      "http://localhost:3001/api/v1/events/by-slug/meia-maratona-brasilia",
    );
  });

  it("uses cache: no-store", async () => {
    const { getEventDetails, fetchFn } = createAdapter(
      jsonResponse({ data: PAID_DTO }),
    );

    await getEventDetails("meia-maratona-brasilia");

    expect(fetchFn.mock.calls[0]?.[1]).toMatchObject({
      method: "GET",
      cache: "no-store",
    });
  });
});

describe("createHttpGetEventDetails — error mapping", () => {
  it("maps 404 → not_found", async () => {
    const { getEventDetails } = createAdapter(
      jsonResponse(
        {
          error: {
            code: "EVENT_NOT_FOUND",
            message: "Evento não encontrado.",
            status: 404,
          },
        },
        404,
      ),
    );

    await expect(getEventDetails("inexistente")).resolves.toEqual({
      status: "not_found",
    });
  });

  it("maps EVENT_NOT_FOUND code → not_found even without 404 status", async () => {
    const { getEventDetails } = createAdapter(
      jsonResponse(
        {
          error: {
            code: "EVENT_NOT_FOUND",
            message: "Evento não encontrado.",
          },
        },
        400,
      ),
    );

    await expect(getEventDetails("inexistente")).resolves.toEqual({
      status: "not_found",
    });
  });

  it("maps 400 → error with API message", async () => {
    const { getEventDetails } = createAdapter(
      jsonResponse(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Slug inválido.",
            status: 400,
          },
        },
        400,
      ),
    );

    await expect(getEventDetails("bad")).resolves.toEqual({
      status: "error",
      message: "Slug inválido.",
    });
  });

  it("maps 500 → error with fallback message", async () => {
    const { getEventDetails } = createAdapter(
      jsonResponse(
        {
          error: {
            code: "INTERNAL_ERROR",
            message: "boom",
            status: 500,
          },
        },
        500,
      ),
    );

    await expect(getEventDetails("meia-maratona-brasilia")).resolves.toEqual({
      status: "error",
      message: "Não foi possível carregar os dados desta corrida.",
    });
  });

  it("maps network error → error with fallback message", async () => {
    const { getEventDetails } = createAdapter(new Error("network down"));

    await expect(getEventDetails("meia-maratona-brasilia")).resolves.toEqual({
      status: "error",
      message: "Não foi possível carregar os dados desta corrida.",
    });
  });

  it("maps invalid JSON → error with fallback message", async () => {
    const { getEventDetails } = createAdapter(
      new Response("not-json", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(getEventDetails("meia-maratona-brasilia")).resolves.toEqual({
      status: "error",
      message: "Não foi possível carregar os dados desta corrida.",
    });
  });

  it("maps invalid body shape → error with fallback message", async () => {
    const { getEventDetails } = createAdapter(
      jsonResponse({ data: { id: "x" } }),
    );

    await expect(getEventDetails("meia-maratona-brasilia")).resolves.toEqual({
      status: "error",
      message: "Não foi possível carregar os dados desta corrida.",
    });
  });

  it("never throws to the consumer", async () => {
    const { getEventDetails } = createAdapter(new Error("boom"));

    await expect(getEventDetails("any")).resolves.toMatchObject({
      status: "error",
    });
  });
});
