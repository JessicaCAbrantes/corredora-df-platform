import { describe, expect, it } from "vitest";
import type { GetEventsListResult } from "../../events/types/events-list";
import {
  HOME_FEATURED_EVENTS_EMPTY_MESSAGE,
  HOME_FEATURED_EVENTS_ERROR_MESSAGE,
  HOME_FEATURED_EVENTS_LIST_HREF,
  HOME_FEATURED_EVENTS_LOADING_MESSAGE,
  HOME_FEATURED_EVENTS_PER_PAGE,
  buildHomeFeaturedEventsParams,
  toFeaturedEventsPresentation,
} from "./home-featured-events";

describe("buildHomeFeaturedEventsParams", () => {
  it("uses recommended GET /events query for Home Featured Events", () => {
    const params = buildHomeFeaturedEventsParams(
      new Date("2026-07-27T15:30:00.000Z"),
    );

    expect(params).toEqual({
      page: 1,
      perPage: HOME_FEATURED_EVENTS_PER_PAGE,
      status: "active",
      dateFrom: "2026-07-27",
      sort: "date",
      order: "asc",
    });
    expect(params.perPage).toBe(6);
  });
});

describe("toFeaturedEventsPresentation", () => {
  it("maps empty success to empty state + Ver todas href", () => {
    const result: GetEventsListResult = {
      status: "success",
      events: [],
      pagination: { page: 1, perPage: 6, total: 0, totalPages: 0 },
    };

    const view = toFeaturedEventsPresentation(result);

    expect(view).toEqual({
      status: "empty",
      message: HOME_FEATURED_EVENTS_EMPTY_MESSAGE,
      listHref: HOME_FEATURED_EVENTS_LIST_HREF,
    });
    expect(view.status === "empty" && view.message).toBe(
      "Nenhuma corrida disponível.",
    );
  });

  it("maps error to simple error + Ver todas href", () => {
    const result: GetEventsListResult = {
      status: "error",
      message: "",
    };

    const view = toFeaturedEventsPresentation(result);

    expect(view.status).toBe("error");
    if (view.status !== "error") return;
    expect(view.message).toBe(HOME_FEATURED_EVENTS_ERROR_MESSAGE);
    expect(view.listHref).toBe("/corridas");
  });

  it("maps ready events with EventCard fields and detail links", () => {
    const result: GetEventsListResult = {
      status: "success",
      events: [
        {
          slug: "meia-maratona-brasilia",
          title: "Meia Maratona de Brasília",
          date: "16 de agosto de 2026",
          dateTime: "2026-08-16",
          city: "Brasília",
          distance: "21K",
          price: "R$ 149,00",
          status: "open",
          image: {
            src: "https://example.com/meia.jpg",
            alt: "Meia Maratona de Brasília",
          },
        },
      ],
      pagination: { page: 1, perPage: 6, total: 1, totalPages: 1 },
    };

    const view = toFeaturedEventsPresentation(result);

    expect(view.status).toBe("ready");
    if (view.status !== "ready") return;

    expect(view.listHref).toBe("/corridas");
    expect(view.events).toHaveLength(1);
    expect(view.events[0]).toMatchObject({
      title: "Meia Maratona de Brasília",
      city: "Brasília",
      distance: "21K",
      date: "16 de agosto de 2026",
      status: "open",
      price: "R$ 149,00",
      href: "/corridas/meia-maratona-brasilia",
      image: {
        src: "https://example.com/meia.jpg",
        alt: "Meia Maratona de Brasília",
      },
    });
  });
});

describe("Home Featured Events loading copy", () => {
  it("exposes loading message for route loading.tsx", () => {
    expect(HOME_FEATURED_EVENTS_LOADING_MESSAGE).toBe("Carregando corridas…");
  });
});
