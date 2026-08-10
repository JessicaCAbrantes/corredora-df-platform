import { Container } from "../../../../../packages/ui/src/components/Container";
import { Grid } from "../../../../../packages/ui/src/components/Grid";
import { PartnerCard } from "../../../../../packages/ui/src/components/PartnerCard";
import { Section } from "../../../../../packages/ui/src/components/Section";
import type { GetPartnersListResult } from "../../partners/types/partners-list";
import { toHomePartnersPresentation } from "../utils/home-partners";

export type PartnersProps = {
  result: GetPartnersListResult;
};

/**
 * Partners teaser — explicitly non-clickable (Faculty MVP F5).
 */
export function Partners({ result }: PartnersProps) {
  const presentation = toHomePartnersPresentation(result);

  return (
    <Section
      title="Parceiros"
      description="Marcas do ecossistema de corrida no DF."
      headerActions={
        <span className="home-teaser-badge" aria-hidden="true">
          Em breve
        </span>
      }
    >
      <Container>
        {presentation.status === "ready" ? (
          <Grid columns={4} gap="md" responsive>
            {presentation.partners.map((partner) => (
              <PartnerCard
                key={partner.id}
                name={partner.name}
                category={partner.category}
                className="home-teaser-card"
              />
            ))}
          </Grid>
        ) : null}

        {presentation.status === "empty" ? (
          <div className="home-partners__state">
            <p className="home-partners__empty">{presentation.message}</p>
          </div>
        ) : null}

        {presentation.status === "error" ? (
          <div className="home-partners__state" role="alert">
            <p className="home-partners__error">
              Não foi possível carregar os parceiros agora. Você ainda pode
              explorar corridas e sua conta.
            </p>
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
