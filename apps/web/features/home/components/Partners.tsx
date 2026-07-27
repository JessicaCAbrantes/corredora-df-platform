import Link from "next/link";
import { Container } from "../../../../../packages/ui/src/components/Container";
import { Grid } from "../../../../../packages/ui/src/components/Grid";
import { PartnerCard } from "../../../../../packages/ui/src/components/PartnerCard";
import { Section } from "../../../../../packages/ui/src/components/Section";
import type { GetPartnersListResult } from "../../partners/types/partners-list";
import {
  HOME_PARTNERS_LIST_HREF,
  toHomePartnersPresentation,
} from "../utils/home-partners";

export type PartnersProps = {
  result: GetPartnersListResult;
};

/**
 * Partners section — data from GET /api/v1/partners via getPartnersList.
 */
export function Partners({ result }: PartnersProps) {
  const presentation = toHomePartnersPresentation(result);

  return (
    <Section
      title="Parceiros"
      description="Marcas do ecossistema de corrida no DF."
      headerActions={
        <Link className="butterfly-section__cta" href={HOME_PARTNERS_LIST_HREF}>
          Conhecer parceiros
        </Link>
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
                href={partner.href}
              />
            ))}
          </Grid>
        ) : null}

        {presentation.status === "empty" ? (
          <div className="home-partners__state">
            <p className="home-partners__empty">{presentation.message}</p>
            <Link className="butterfly-section__cta" href={presentation.listHref}>
              Conhecer parceiros
            </Link>
          </div>
        ) : null}

        {presentation.status === "error" ? (
          <div className="home-partners__state" role="alert">
            <p className="home-partners__error">{presentation.message}</p>
            <Link className="butterfly-section__cta" href={presentation.listHref}>
              Conhecer parceiros
            </Link>
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
