import Link from "next/link";
import { Container } from "../../../../../packages/ui/src/components/Container";
import { EventCard } from "../../../../../packages/ui/src/components/EventCard";
import { SiteFooter } from "@/components/SiteFooter";
import { Grid } from "../../../../../packages/ui/src/components/Grid";
import { Layout } from "../../../../../packages/ui/src/components/Layout";
import { SiteNavbar } from "../../auth/components/SiteNavbar";
import { Section } from "../../../../../packages/ui/src/components/Section";
import type {
  EventListItem,
  EventsListPagination,
  GetEventsListParams,
  GetEventsListResult,
} from "../types/events-list";

export interface EventsListingPageProps {
  result: GetEventsListResult;
  params: GetEventsListParams;
}

function buildListingHref(
  params: GetEventsListParams,
  page: number,
): string {
  const query = new URLSearchParams();

  if (params.search) {
    query.set("search", params.search);
  }
  if (params.status) {
    query.set("status", params.status);
  }
  if (params.category) {
    query.set("category", params.category);
  }
  if (params.city) {
    query.set("city", params.city);
  }
  if (params.dateFrom) {
    query.set("dateFrom", params.dateFrom);
  }
  if (params.dateTo) {
    query.set("dateTo", params.dateTo);
  }
  if (params.registrationOpen !== undefined) {
    query.set("registrationOpen", String(params.registrationOpen));
  }
  if (params.sort !== "date") {
    query.set("sort", params.sort);
  }
  if (params.order !== "asc") {
    query.set("order", params.order);
  }
  if (params.perPage !== 20) {
    query.set("perPage", String(params.perPage));
  }
  if (page !== 1) {
    query.set("page", String(page));
  }

  const qs = query.toString();
  return qs ? `/corridas?${qs}` : "/corridas";
}

function EventsListingPagination({
  params,
  pagination,
}: {
  params: GetEventsListParams;
  pagination: EventsListPagination;
}) {
  if (pagination.totalPages <= 1) {
    return null;
  }

  const hasPreviousPage = pagination.page > 1;
  const hasNextPage = pagination.page < pagination.totalPages;

  return (
    <nav
      className="events-listing__pagination"
      aria-label="Paginação de corridas"
    >
      {hasPreviousPage ? (
        <Link
          className="events-listing__pagination-link"
          href={buildListingHref(params, pagination.page - 1)}
        >
          Anterior
        </Link>
      ) : (
        <span className="events-listing__pagination-muted">Anterior</span>
      )}

      <span className="events-listing__pagination-status">
        Página {pagination.page} de {pagination.totalPages}
      </span>

      {hasNextPage ? (
        <Link
          className="events-listing__pagination-link"
          href={buildListingHref(params, pagination.page + 1)}
        >
          Próxima
        </Link>
      ) : (
        <span className="events-listing__pagination-muted">Próxima</span>
      )}
    </nav>
  );
}

function EventsListingSuccess({
  events,
  params,
  pagination,
}: {
  events: EventListItem[];
  params: GetEventsListParams;
  pagination: EventsListPagination;
}) {
  if (events.length === 0) {
    return <EventsListingEmpty />;
  }

  return (
    <main id="main-content" className="events-listing__main">
      <Container>
        <header className="events-listing__intro">
          <h1 id="events-listing-heading" className="events-listing__title">
            Corridas
          </h1>
          <p className="events-listing__description">
            Explore as próximas provas no Distrito Federal e abra os detalhes da
            que fizer sentido para você.
          </p>
        </header>
      </Container>

      <Section aria-labelledby="events-listing-heading">
        <Container>
          <Grid columns={3} gap="md" responsive>
            {events.map((event) => (
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
                href={`/corridas/${event.slug}`}
              />
            ))}
          </Grid>

          <EventsListingPagination params={params} pagination={pagination} />
        </Container>
      </Section>
    </main>
  );
}

function EventsListingEmpty() {
  return (
    <main id="main-content" className="events-listing__state">
      <Container>
        <h1 className="events-listing__state-title">
          Nenhuma corrida disponível
        </h1>
        <p className="events-listing__state-text">
          Não encontramos corridas disponíveis no momento. Volte em breve ou
          explore a Home.
        </p>
        <Link className="events-listing__state-link" href="/">
          Voltar para a Home
        </Link>
      </Container>
    </main>
  );
}

function EventsListingError({ message }: { message: string }) {
  return (
    <main id="main-content" className="events-listing__state">
      <Container>
        <h1 className="events-listing__state-title">Algo deu errado</h1>
        <p className="events-listing__state-text">
          Não foi possível carregar as corridas agora.
          {message ? ` (${message})` : ""} Tente novamente em instantes ou
          volte para a Home.
        </p>
        <Link className="events-listing__state-link" href="/">
          Voltar para a Home
        </Link>
        <Link className="events-listing__state-link" href="/corridas">
          Tentar novamente
        </Link>
      </Container>
    </main>
  );
}

/**
 * EventsListingPage — orchestrates discovery listing.
 * Receives fetch result from the route; does not call infrastructure itself.
 */
export function EventsListingPage({
  result,
  params,
}: EventsListingPageProps) {
  return (
    <Layout className="events-listing">
      <SiteNavbar activeItemId="corridas" />

      {result.status === "success" ? (
        <EventsListingSuccess
          events={result.events}
          params={params}
          pagination={result.pagination}
        />
      ) : null}

      {result.status === "error" ? (
        <EventsListingError
          message={
            result.message || "Não foi possível carregar as corridas."
          }
        />
      ) : null}

      <SiteFooter />
    </Layout>
  );
}
