import type { Metadata } from "next";
import { EventDetailsPage, getEventDetails } from "@/features/events";

type EventDetailsRouteProps = {
  params: Promise<{ slug: string }>;
};

/**
 * Thin App Router entry for /corridas/[slug].
 * Data access stays in the feature service; composition in EventDetailsPage.
 */
export async function generateMetadata({
  params,
}: EventDetailsRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getEventDetails(slug);

  if (result.status === "success") {
    return {
      title: result.event.name,
      description: `${result.event.name} — ${result.event.dateLabel}, ${result.event.distanceLabel} em ${result.event.locationLabel}.`,
    };
  }

  if (result.status === "not_found") {
    return {
      title: "Corrida não encontrada",
    };
  }

  return {
    title: "Corrida",
  };
}

export default async function CorridaDetailsRoute({
  params,
}: EventDetailsRouteProps) {
  const { slug } = await params;
  const result = await getEventDetails(slug);

  return <EventDetailsPage result={result} />;
}
