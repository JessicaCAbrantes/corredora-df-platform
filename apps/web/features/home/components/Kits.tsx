import { Container } from "../../../../../packages/ui/src/components/Container";
import { Grid } from "../../../../../packages/ui/src/components/Grid";
import { KitCard } from "../../../../../packages/ui/src/components/KitCard";
import { Section } from "../../../../../packages/ui/src/components/Section";
import { MOCK_KITS } from "../utils/mock-home-data";

/**
 * Kit pickup teaser section — informative mock only.
 */
export function Kits() {
  return (
    <Section
      title="Retirada de kits"
      description="Exemplos de kits vinculados a eventos (placeholders)."
      headerActions={
        <a className="butterfly-section__cta" href="/kits">
          Ver retirada de kits
        </a>
      }
    >
      <Container>
        <Grid columns={2} gap="md" responsive>
          {MOCK_KITS.map((kit) => (
            <KitCard
              key={kit.id}
              title={kit.title}
              eventName={kit.eventName}
              statusLabel={kit.statusLabel}
              pickupLabel={kit.pickupLabel}
              href={kit.href}
            />
          ))}
        </Grid>
      </Container>
    </Section>
  );
}
