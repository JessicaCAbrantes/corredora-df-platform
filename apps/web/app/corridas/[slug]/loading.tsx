import { EventDetailsLoading } from "@/features/events";
import { SiteNavbar } from "@/features/auth/components/SiteNavbar";
import { SiteFooter } from "@/components/SiteFooter";
import { Layout } from "../../../../../packages/ui/src/components/Layout";

export default function CorridaDetailsLoading() {
  return (
    <Layout className="event-details">
      <SiteNavbar activeItemId="corridas" />
      <EventDetailsLoading />
      <SiteFooter />
    </Layout>
  );
}
