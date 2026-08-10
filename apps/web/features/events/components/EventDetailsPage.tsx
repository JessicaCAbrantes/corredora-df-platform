import Link from "next/link";
import { Container } from "../../../../../packages/ui/src/components/Container";
import { SiteFooter } from "@/components/SiteFooter";
import { Layout } from "../../../../../packages/ui/src/components/Layout";
import { SiteNavbar } from "../../auth/components/SiteNavbar";
import { Section } from "../../../../../packages/ui/src/components/Section";
import type {
  EventDetailsData,
  EventDetailsFetchResult,
  EventPrimaryAction,
  EventRegistrationStatus,
} from "../types/event-details";
import { EventHero } from "./EventHero";
import { EventKit } from "./EventKit";
import { EventRegistrationSection } from "./EventRegistrationSection";
import { EventRegulation } from "./EventRegulation";
import { EventRoute } from "./EventRoute";
import { EventSchedule } from "./EventSchedule";

export interface EventDetailsPageProps {
  result: EventDetailsFetchResult;
}

/**
 * Small presentation map — domain registration status → CTA labels.
 * Kept on the page (Option A). Not a Presenter layer.
 */
function toPrimaryAction(
  status: EventRegistrationStatus,
): EventPrimaryAction {
  switch (status) {
    case "open":
      return {
        type: "REGISTER",
        label: "Inscreva-se",
        disabled: false,
      };
    case "upcoming":
      return {
        type: "UNAVAILABLE",
        label: "Inscrições em breve",
        disabled: true,
      };
    case "closed":
      return {
        type: "UNAVAILABLE",
        label: "Inscrições encerradas",
        disabled: true,
      };
  }
}

function EventDetailsSuccess({ event }: { event: EventDetailsData }) {
  const primaryAction = toPrimaryAction(event.registrationStatus);

  return (
    <>
      <EventHero
        name={event.name}
        dateLabel={event.dateLabel}
        timeLabel={event.timeLabel}
        distanceLabel={event.distanceLabel}
        locationLabel={event.locationLabel}
        imageAlt={event.imageAlt}
        imageSrc={event.imageSrc}
      />

      <main id="main-content" className="event-details__main">
        <EventRegistrationSection
          eventId={event.id}
          slug={event.slug}
          currentPriceLabel={event.pricing.currentPriceLabel}
          originalPriceLabel={event.pricing.originalPriceLabel}
          discountLabel={event.pricing.discountLabel}
          primaryAction={primaryAction}
        />

        <Section
          id="confirmacao"
          title="O que você encontra na prova"
          description="Kit e percurso para reforçar sua decisão."
        >
          <Container>
            <div className="event-details__confirm">
              <div className="event-details__block">
                <h3 className="event-details__block-title">Kit</h3>
                <EventKit
                  available={event.kit.available}
                  description={
                    event.kit.available
                      ? event.kit.description
                      : "Após se inscrever, acompanhe o kit desta prova em Meus kits."
                  }
                  imageSrc={event.kit.imageSrc}
                  imageAlt={event.kit.imageAlt}
                />
              </div>
              <div className="event-details__block">
                <h3 className="event-details__block-title">Percurso</h3>
                <EventRoute
                  available={event.route.available}
                  summary={event.route.summary}
                  distanceLabel={event.route.distanceLabel}
                  imageSrc={event.route.imageSrc}
                  imageAlt={event.route.imageAlt}
                />
              </div>
            </div>
          </Container>
        </Section>

        <Section
          id="apoio"
          title="Organize-se"
          description="Programação e regras da prova."
        >
          <Container>
            <div className="event-details__support">
              <div className="event-details__block">
                <h3 className="event-details__block-title">Programação</h3>
                <EventSchedule items={event.schedule.items} />
              </div>
              <div className="event-details__block">
                <h3 className="event-details__block-title">Regulamento</h3>
                <EventRegulation
                  summary={event.regulation.summary}
                  href={event.regulation.href}
                  linkLabel={event.regulation.linkLabel}
                />
              </div>
            </div>
          </Container>
        </Section>
      </main>
    </>
  );
}

function EventDetailsError({ message }: { message: string }) {
  return (
    <main id="main-content" className="event-details__state">
      <Container>
        <h1 className="event-details__state-title">Algo deu errado</h1>
        <p className="event-details__state-text">{message}</p>
        <Link className="event-details__state-link" href="/">
          Voltar para a Home
        </Link>
      </Container>
    </main>
  );
}

function EventDetailsNotFound() {
  return (
    <main id="main-content" className="event-details__state">
      <Container>
        <h1 className="event-details__state-title">Corrida não encontrada</h1>
        <p className="event-details__state-text">
          Não encontramos uma prova com este endereço. Confira o link ou
          explore outras corridas.
        </p>
        <Link className="event-details__state-link" href="/">
          Ir para a Home
        </Link>
      </Container>
    </main>
  );
}

/**
 * EventDetailsPage — orchestrates the decision journey.
 * Receives fetch result from the route; does not call infrastructure itself.
 */
export function EventDetailsPage({ result }: EventDetailsPageProps) {
  return (
    <Layout className="event-details">
      <SiteNavbar activeItemId="corridas" />

      {result.status === "success" ? (
        <EventDetailsSuccess event={result.event} />
      ) : null}

      {result.status === "not_found" ? <EventDetailsNotFound /> : null}

      {result.status === "error" ? (
        <EventDetailsError message={result.message} />
      ) : null}

      <SiteFooter />
    </Layout>
  );
}
