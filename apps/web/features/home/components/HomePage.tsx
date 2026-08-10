import { Footer } from "../../../../../packages/ui/src/components/Footer";
import { Layout } from "../../../../../packages/ui/src/components/Layout";
import { SiteNavbar } from "../../auth/components/SiteNavbar";
import { getBlogPostsList } from "../../blog/services/get-blog-posts-list";
import { getCouponsList } from "../../coupons/services/get-coupons-list";
import { getEventsList } from "../../events/services/get-events-list";
import { getKitPickupServicesList } from "../../kit-pickup-services/services/get-kit-pickup-services-list";
import { getPartnersList } from "../../partners/services/get-partners-list";
import { buildHomeBlogParams } from "../utils/home-blog";
import { buildHomeCouponsParams } from "../utils/home-coupons";
import {
  buildHomeFeaturedEventsParams,
  toFeaturedEventsPresentation,
} from "../utils/home-featured-events";
import { buildHomeKitPickupParams } from "../utils/home-kit-pickup";
import { buildHomePartnersParams } from "../utils/home-partners";
import { Blog } from "./Blog";
import { Coupons } from "./Coupons";
import { FeaturedEvents } from "./FeaturedEvents";
import { HomeHero } from "./HomeHero";
import { Kits } from "./Kits";
import { Partners } from "./Partners";

/**
 * Home — visitor vs authenticated hero (F3); catalog sections unchanged.
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

  const featured = toFeaturedEventsPresentation(featuredEventsResult);
  const first = featured.status === "ready" ? featured.events[0] : null;
  const nextEvent = first
    ? {
        title: first.title,
        href: first.href,
        date: first.date,
        distance: first.distance,
        city: first.city,
      }
    : null;

  return (
    <Layout className="butterfly-home">
      <SiteNavbar activeItemId="home" />
      <HomeHero nextEvent={nextEvent} />
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
