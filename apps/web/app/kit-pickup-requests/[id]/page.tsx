import { KitPickupRequestDetailPage } from "../../../features/kit-pickup-requests";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function KitPickupRequestDetailRoutePage({ params }: Props) {
  const { id } = await params;
  return <KitPickupRequestDetailPage requestId={id} />;
}
