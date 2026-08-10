import { Container } from "../../../../../packages/ui/src/components/Container";
import { CouponCard } from "../../../../../packages/ui/src/components/CouponCard";
import { Grid } from "../../../../../packages/ui/src/components/Grid";
import { Section } from "../../../../../packages/ui/src/components/Section";
import type { GetCouponsListResult } from "../../coupons/types/coupons-list";
import { toHomeCouponsPresentation } from "../utils/home-coupons";

export type CouponsProps = {
  result: GetCouponsListResult;
};

/**
 * Coupons teaser — display only (no /cupons list page yet; F1 hides dead links).
 */
export function Coupons({ result }: CouponsProps) {
  const presentation = toHomeCouponsPresentation(result);

  return (
    <Section
      title="Cupons"
      description="Benefícios do ecossistema de corrida no DF."
    >
      <Container>
        {presentation.status === "ready" ? (
          <Grid columns={3} gap="md" responsive>
            {presentation.coupons.map((coupon) => (
              <CouponCard
                key={coupon.id}
                title={coupon.title}
                discountLabel={coupon.discountLabel}
                partnerName={coupon.partnerName}
                expiresAt={coupon.expiresAtLabel}
                href="#"
              />
            ))}
          </Grid>
        ) : null}

        {presentation.status === "empty" ? (
          <div className="home-coupons__state">
            <p className="home-coupons__empty">{presentation.message}</p>
          </div>
        ) : null}

        {presentation.status === "error" ? (
          <div className="home-coupons__state" role="alert">
            <p className="home-coupons__error">{presentation.message}</p>
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
