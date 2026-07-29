import type { OperationalRequestItem } from "../types/kit-pickup-operations";
import {
  formatOperationalDate,
  getActionLabel,
  getAvailableAction,
  getPaymentStatusLabel,
  getQueueExternalCode,
  getQueueParticipantLabel,
  getRegistrationModeLabel,
} from "../utils/kit-pickup-operations-presentation";

type Props = {
  items: OperationalRequestItem[];
  selectedId: string | null;
  onSelect: (item: OperationalRequestItem) => void;
  onAction: (item: OperationalRequestItem) => void;
};

export function KitPickupOperationsQueue({
  items,
  selectedId,
  onSelect,
  onAction,
}: Props) {
  return (
    <div className="kit-ops-queue">
      {items.map((item) => {
        const action = getAvailableAction(item.status);
        const externalCode = getQueueExternalCode(item);
        return (
          <article
            key={item.id}
            className={
              selectedId === item.id
                ? "kit-ops-queue__row kit-ops-queue__row--selected"
                : "kit-ops-queue__row"
            }
          >
            <button
              type="button"
              className="kit-ops-queue__main"
              onClick={() => onSelect(item)}
            >
              <div className="kit-ops-queue__header">
                <strong>{item.event.name}</strong>
                <span className="kit-ops-queue__status">{item.statusLabel}</span>
              </div>
              <p className="kit-ops-queue__meta">
                {item.event.city} · {formatOperationalDate(item.event.date)}
              </p>
              <p className="kit-ops-queue__meta">{item.service.title}</p>
              {item.service.pickupLabel ? (
                <p className="kit-ops-queue__meta">{item.service.pickupLabel}</p>
              ) : null}
              <p className="kit-ops-queue__meta">
                {getRegistrationModeLabel(item.registrationMode)} ·{" "}
                {getQueueParticipantLabel(item)}
                {externalCode ? ` · ${externalCode}` : null}
              </p>
              <p className="kit-ops-queue__meta">
                {getPaymentStatusLabel(item.paymentStatus)} · Solicitada em{" "}
                {formatOperationalDate(item.createdAt)}
              </p>
            </button>
            {action ? (
              <button
                type="button"
                className="kit-ops-queue__action"
                onClick={() => onAction(item)}
              >
                {getActionLabel(action)}
              </button>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
