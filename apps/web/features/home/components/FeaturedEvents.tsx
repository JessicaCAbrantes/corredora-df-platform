import Link from "next/link";
import { Container } from "../../../../../packages/ui/src/components/Container";
import { EventCard } from "../../../../../packages/ui/src/components/EventCard";
import { Grid } from "../../../../../packages/ui/src/components/Grid";
import { Section } from "../../../../../packages/ui/src/components/Section";
import type { GetEventsListResult } from "../../events/types/events-list";
import {
  HOME_FEATURED_EVENTS_LIST_HREF,
  toFeaturedEventsPresentation,
} from "../utils/home-featured-events";

export type FeaturedEventsProps = {
  result: GetEventsListResult;
};

/**
 * Featured / upcoming events — data from GET /api/v1/events via getEventsList.
 */
export function FeaturedEvents({ result }: FeaturedEventsProps) {
  const presentation = toFeaturedEventsPresentation(result);

  return (
    <Section
      title="Eventos em destaque"
      description="Próximas corridas no Distrito Federal."
      headerActions={
        <Link
          className="butterfly-section__cta"
          href={HOME_FEATURED_EVENTS_LIST_HREF}
        >
          Ver todas as corridas
        </Link>
      }
    >
      <Container>
        {presentation.status === "ready" ? (
          <Grid columns={3} gap="md" responsive>
            {presentation.events.map((event) => (
              <EventCard
                key={event.slug}
                title={event.title}
                date={event.date}
                dateTime={event.dateTime}
                city={event.city}
                distance={event.distance}
                price={event.price}
                status={event.status}
                image={event.image}
                href={event.href}
              />
            ))}
          </Grid>
        ) : null}

        {presentation.status === "empty" ? (
          <div className="home-featured-events__state">
            <p className="home-featured-events__empty">{presentation.message}</p>
            <Link
              className="butterfly-section__cta"
              href={presentation.listHref}
            >
              Ver todas
            </Link>
          </div>
        ) : null}

        {presentation.status === "error" ? (
          <div className="home-featured-events__state" role="alert">
            <p className="home-featured-events__error">{presentation.message}</p>
            <Link
              className="butterfly-section__cta"
              href={presentation.listHref}
            >
              Ver todas
            </Link>
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
