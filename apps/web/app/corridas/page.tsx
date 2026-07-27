import type { Metadata } from "next";
import {
  EventsListingPage,
  getEventsList,
  parseEventsListParams,
} from "@/features/events";

export const metadata: Metadata = {
  title: "Corridas",
  description:
    "Explore as próximas corridas e provas no Distrito Federal na Corredora DF.",
};

type CorridasListingRouteProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Thin App Router entry for /corridas.
 * Boundary normalizes searchParams; Application stays free of URL types.
 */
export default async function CorridasListingRoute({
  searchParams,
}: CorridasListingRouteProps) {
  const rawParams = await searchParams;
  const params = parseEventsListParams(rawParams);
  const result = await getEventsList(params);

  return <EventsListingPage result={result} params={params} />;
}
