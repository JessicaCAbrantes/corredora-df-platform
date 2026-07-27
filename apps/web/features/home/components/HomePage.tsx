import { Footer } from "../../../../../packages/ui/src/components/Footer";
import { Hero } from "../../../../../packages/ui/src/components/Hero";
import { Layout } from "../../../../../packages/ui/src/components/Layout";
import { SiteNavbar } from "../../auth/components/SiteNavbar";
import { getCouponsList } from "../../coupons/services/get-coupons-list";
import { getEventsList } from "../../events/services/get-events-list";
import { getPartnersList } from "../../partners/services/get-partners-list";
import { buildHomeCouponsParams } from "../utils/home-coupons";
import { buildHomeFeaturedEventsParams } from "../utils/home-featured-events";
import { buildHomePartnersParams } from "../utils/home-partners";
import { Blog } from "./Blog";
import { Coupons } from "./Coupons";
import { FeaturedEvents } from "./FeaturedEvents";
import { Kits } from "./Kits";
import { Partners } from "./Partners";

/**
 * Home page composition — Featured Events, Coupons and Partners from API;
 * Kits Home and Blog stay mocked for this MVP.
 */
export async function HomePage() {
  const [featuredEventsResult, couponsResult, partnersResult] =
    await Promise.all([
      getEventsList(buildHomeFeaturedEventsParams()),
      getCouponsList(buildHomeCouponsParams()),
      getPartnersList(buildHomePartnersParams()),
    ]);

  return (
    <Layout className="butterfly-home">
      <SiteNavbar activeItemId="home" />
      <Hero />
      <main id="main-content" className="butterfly-home__main">
        <FeaturedEvents result={featuredEventsResult} />
        <Coupons result={couponsResult} />
        <Partners result={partnersResult} />
        <Kits />
        <Blog />
      </main>
      <Footer />
    </Layout>
  );
}
