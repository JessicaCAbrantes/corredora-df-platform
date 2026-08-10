import Link from "next/link";
import { Container } from "../../../../../packages/ui/src/components/Container";
import { Grid } from "../../../../../packages/ui/src/components/Grid";
import { KitCard } from "../../../../../packages/ui/src/components/KitCard";
import { Section } from "../../../../../packages/ui/src/components/Section";
import type { GetKitPickupServicesListResult } from "../../kit-pickup-services/types/kit-pickup-services-list";
import { toHomeKitPickupPresentation } from "../utils/home-kit-pickup";

export type KitsProps = {
  result: GetKitPickupServicesListResult;
};

/**
 * Kit services teaser on Home — CTA points to Meus kits (demo path F4/F5).
 * Cards are non-clickable teasers to avoid drifting into /kit-pickup mid-demo.
 */
export function Kits({ result }: KitsProps) {
  const presentation = toHomeKitPickupPresentation(result);

  return (
    <Section
      title="Kits"
      description="Acompanhe os kits das corridas em que você participa."
      headerActions={
        <Link className="butterfly-section__cta" href="/kits">
          Meus kits
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
                className="home-teaser-card"
              />
            ))}
          </Grid>
        ) : null}

        {presentation.status === "empty" ? (
          <div className="home-kit-pickup__state">
            <p className="home-kit-pickup__empty">
              Nenhum serviço de kit em destaque no momento. Após se inscrever em
              uma corrida, veja seus kits na área da conta.
            </p>
            <Link className="butterfly-section__cta" href="/kits">
              Meus kits
            </Link>
          </div>
        ) : null}

        {presentation.status === "error" ? (
          <div className="home-kit-pickup__state" role="alert">
            <p className="home-kit-pickup__error">
              Não foi possível carregar o teaser de kits. Você ainda pode abrir
              Meus kits na navegação.
            </p>
            <Link className="butterfly-section__cta" href="/kits">
              Meus kits
            </Link>
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
