import Link from "next/link";
import { Container } from "../../../../../packages/ui/src/components/Container";
import { Grid } from "../../../../../packages/ui/src/components/Grid";
import { KitCard } from "../../../../../packages/ui/src/components/KitCard";
import { Section } from "../../../../../packages/ui/src/components/Section";
import type { GetKitPickupServicesListResult } from "../../kit-pickup-services/types/kit-pickup-services-list";
import {
  HOME_KIT_PICKUP_LIST_HREF,
  toHomeKitPickupPresentation,
} from "../utils/home-kit-pickup";

export type KitsProps = {
  result: GetKitPickupServicesListResult;
};

/**
 * Kit pickup services teaser — GET /api/v1/kit-pickup-services (Phase 1).
 * CTA points to /kit-pickup (Known Debt), not /kits (My Kits).
 */
export function Kits({ result }: KitsProps) {
  const presentation = toHomeKitPickupPresentation(result);

  return (
    <Section
      title="Retirada de kits"
      description="Serviços de retirada de kit disponíveis no ecossistema Corredora DF."
      headerActions={
        <Link className="butterfly-section__cta" href={HOME_KIT_PICKUP_LIST_HREF}>
          Ver serviços de retirada
        </Link>
      }
    >
      <Container>
        {presentation.status === "ready" ? (
          <Grid columns={2} gap="md" responsive>
            {presentation.services.map((service) => (
              <KitCard
                key={service.id}
                title={service.title}
                eventName={service.eventName}
                statusLabel={service.statusLabel}
                pickupLabel={service.pickupLabel}
                href={service.href}
              />
            ))}
          </Grid>
        ) : null}

        {presentation.status === "empty" ? (
          <div className="home-kit-pickup__state">
            <p className="home-kit-pickup__empty">{presentation.message}</p>
            <Link
              className="butterfly-section__cta"
              href={presentation.listHref}
            >
              Ver serviços de retirada
            </Link>
          </div>
        ) : null}

        {presentation.status === "error" ? (
          <div className="home-kit-pickup__state" role="alert">
            <p className="home-kit-pickup__error">{presentation.message}</p>
            <Link
              className="butterfly-section__cta"
              href={presentation.listHref}
            >
              Ver serviços de retirada
            </Link>
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
