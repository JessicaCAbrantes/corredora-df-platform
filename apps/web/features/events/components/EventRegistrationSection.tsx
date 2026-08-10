"use client";

import Link from "next/link";
import { useState } from "react";
import { Container } from "../../../../../packages/ui/src/components/Container";
import { Section } from "../../../../../packages/ui/src/components/Section";
import { useRegisterForEventAction } from "../hooks/useRegisterForEventAction";
import { createDefaultRegisterForEvent } from "../infrastructure/create-default-register-for-event";
import type { EventPrimaryAction } from "../types/event-details";
import { EventCTA } from "./EventCTA";
import { PricingSection } from "./PricingSection";

export type EventRegistrationSectionProps = {
  eventId: string;
  slug: string;
  currentPriceLabel: string;
  originalPriceLabel?: string;
  discountLabel?: string;
  primaryAction: EventPrimaryAction;
};

/**
 * Client island for Seção 01 — wires Pricing + CTA to the registration handler.
 * Composition root: injects RegisterForEvent (HTTP by default, mock via query).
 */
export function EventRegistrationSection({
  eventId,
  slug,
  currentPriceLabel,
  originalPriceLabel,
  discountLabel,
  primaryAction,
}: EventRegistrationSectionProps) {
  const [registerForEvent] = useState(() => createDefaultRegisterForEvent());

  const { state, onRegisterAction } = useRegisterForEventAction({
    eventId,
    slug,
    registerForEvent,
  });

  const isBusy = state.status === "loading";
  const isTerminalRegistered =
    state.status === "success" || state.status === "registered";

  const ctaLabel = isTerminalRegistered
    ? state.message ?? "Você já está inscrito"
    : primaryAction.label;

  const ctaDisabled =
    primaryAction.disabled || isBusy || isTerminalRegistered;

  return (
    <Section
      id="decisao"
      title="Participação"
      description="Valor e inscrição nesta prova."
    >
      <Container>
        <div className="event-details__decision">
          <PricingSection
            currentPriceLabel={currentPriceLabel}
            originalPriceLabel={originalPriceLabel}
            discountLabel={discountLabel}
          />
          <div className="event-details__registration">
            <EventCTA
              label={ctaLabel}
              disabled={ctaDisabled}
              loading={isBusy}
              onAction={
                primaryAction.disabled || isTerminalRegistered
                  ? undefined
                  : () => {
                      void onRegisterAction();
                    }
              }
            />
            {state.message && state.status !== "loading" ? (
              <p
                className={[
                  "event-details__registration-feedback",
                  state.status === "error"
                    ? "event-details__registration-feedback--error"
                    : "event-details__registration-feedback--ok",
                ].join(" ")}
                role="status"
                aria-live="polite"
              >
                {state.message}
              </p>
            ) : null}
            {isTerminalRegistered ? (
              <div className="event-details__registration-next">
                <p className="event-details__registration-next-lead">
                  Próximos passos do seu percurso:
                </p>
                <div className="event-details__registration-next-links">
                  <Link href="/kits" className="event-details__registration-next-link">
                    Ver meus kits
                  </Link>
                  <Link
                    href="/minhas-inscricoes"
                    className="event-details__registration-next-link"
                  >
                    Minhas inscrições
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </Container>
    </Section>
  );
}
