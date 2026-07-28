import { Footer } from "../../../../../packages/ui/src/components/Footer";
import { Hero } from "../../../../../packages/ui/src/components/Hero";
import { Layout } from "../../../../../packages/ui/src/components/Layout";
import { SiteNavbar } from "../../auth/components/SiteNavbar";
import { getBlogPostsList } from "../../blog/services/get-blog-posts-list";
import { getCouponsList } from "../../coupons/services/get-coupons-list";
import { getEventsList } from "../../events/services/get-events-list";
import { getKitPickupServicesList } from "../../kit-pickup-services/services/get-kit-pickup-services-list";
import { getPartnersList } from "../../partners/services/get-partners-list";
import { buildHomeBlogParams } from "../utils/home-blog";
import { buildHomeCouponsParams } from "../utils/home-coupons";
import { buildHomeFeaturedEventsParams } from "../utils/home-featured-events";
import { buildHomeKitPickupParams } from "../utils/home-kit-pickup";
import { buildHomePartnersParams } from "../utils/home-partners";
import { Blog } from "./Blog";
import { Coupons } from "./Coupons";
import { FeaturedEvents } from "./FeaturedEvents";
import { Kits } from "./Kits";
import { Partners } from "./Partners";

/**
 * Home page composition — Featured Events, Coupons, Partners, Kit Pickup Services
 * and Blog from API. No remaining Home mocks in these sections.
 */
export async function HomePage() {
  const [
    featuredEventsResult,
    couponsResult,
    partnersResult,
    kitPickupResult,
    blogResult,
  ] = await Promise.all([
    getEventsList(buildHomeFeaturedEventsParams()),
    getCouponsList(buildHomeCouponsParams()),
    getPartnersList(buildHomePartnersParams()),
    getKitPickupServicesList(buildHomeKitPickupParams()),
    getBlogPostsList(buildHomeBlogParams()),
  ]);

  return (
    <Layout className="butterfly-home">
      <SiteNavbar activeItemId="home" />
      <Hero />
      <main id="main-content" className="butterfly-home__main">
        <FeaturedEvents result={featuredEventsResult} />
        <Coupons result={couponsResult} />
        <Partners result={partnersResult} />
        <Kits result={kitPickupResult} />
        <Blog result={blogResult} />
      </main>
      <Footer />
    </Layout>
  );
}
