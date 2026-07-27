import { EventsListingLoading } from "@/features/events";
import { SiteNavbar } from "@/features/auth/components/SiteNavbar";
import { Footer } from "../../../../packages/ui/src/components/Footer";
import { Layout } from "../../../../packages/ui/src/components/Layout";

export default function CorridasListingLoading() {
  return (
    <Layout className="events-listing">
      <SiteNavbar activeItemId="corridas" />
      <EventsListingLoading />
      <Footer />
    </Layout>
  );
}
