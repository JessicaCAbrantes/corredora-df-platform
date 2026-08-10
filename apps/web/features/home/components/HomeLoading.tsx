import { Hero } from "../../../../../packages/ui/src/components/Hero";
import { Layout } from "../../../../../packages/ui/src/components/Layout";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNavbar } from "../../auth/components/SiteNavbar";
import { HOME_FEATURED_EVENTS_LOADING_MESSAGE } from "../utils/home-featured-events";

/**
 * Route-level loading UI while HomePage awaits data.
 */
export function HomeLoading() {
  return (
    <Layout className="butterfly-home">
      <SiteNavbar activeItemId="home" />
      <Hero
        secondaryCta={{ id: "hero-pending", label: "", href: undefined }}
        ariaLabel="Carregando a Home"
      />
      <main id="main-content" className="butterfly-home__main">
        <p className="home-featured-events__loading" role="status">
          {HOME_FEATURED_EVENTS_LOADING_MESSAGE}
        </p>
      </main>
      <SiteFooter />
    </Layout>
  );
}
