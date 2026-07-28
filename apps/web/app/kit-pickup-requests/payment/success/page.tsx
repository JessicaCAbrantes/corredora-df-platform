import { Suspense } from "react";
import { KitPickupPaymentReturnPage } from "../../../../features/kit-pickup-requests";

export default function KitPickupPaymentSuccessPage() {
  return (
    <Suspense fallback={<p role="status">Carregando…</p>}>
      <KitPickupPaymentReturnPage mode="success" />
    </Suspense>
  );
}
