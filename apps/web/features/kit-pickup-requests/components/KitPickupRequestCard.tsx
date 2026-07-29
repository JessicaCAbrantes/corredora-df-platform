import Link from "next/link";
import type { KitPickupRequestItem } from "../types/kit-pickup-request";
import {
  formatKitPickupDate,
  getRegistrationModeLabel,
  shouldShowPaymentStatusOnCard,
} from "../utils/kit-pickup-request-presentation";

type Props = {
  item: KitPickupRequestItem;
};

export function KitPickupRequestCard({ item }: Props) {
  return (
    <article className="kit-pickup-card">
      <header className="kit-pickup-card__header">
        <h2 className="kit-pickup-card__event">{item.event.name}</h2>
        <p className="kit-pickup-card__service">{item.service.title}</p>
      </header>

      <p className="kit-pickup-card__status" role="status">
        <span className="kit-pickup-card__status-dot" aria-hidden="true" />
        {item.statusLabel}
      </p>

      {shouldShowPaymentStatusOnCard(item) ? (
        <p className="kit-pickup-card__payment">{item.paymentStatusLabel}</p>
      ) : null}

      <p className="kit-pickup-card__mode">
        {getRegistrationModeLabel(item.registrationMode)}
      </p>

      {item.service.pickupLabel ? (
        <p className="kit-pickup-card__pickup">{item.service.pickupLabel}</p>
      ) : null}

      <p className="kit-pickup-card__date">
        Solicitada em {formatKitPickupDate(item.createdAt)}
      </p>

      <Link
        className="kit-pickup-card__cta"
        href={`/kit-pickup-requests/${item.id}`}
      >
        Ver detalhes
      </Link>
    </article>
  );
}
