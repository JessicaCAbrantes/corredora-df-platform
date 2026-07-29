import type { OperationalRequestItem } from "../types/kit-pickup-operations";
import {
  getActionLabel,
  getAvailableAction,
} from "../utils/kit-pickup-operations-presentation";

type Props = {
  item: OperationalRequestItem | null;
  busy: boolean;
  onAction: (item: OperationalRequestItem) => void;
};

export function KitPickupOperationActionBar({ item, busy, onAction }: Props) {
  if (!item) return null;
  const action = getAvailableAction(item.status);
  if (!action) return null;

  return (
    <div className="kit-ops-action-bar">
      <button
        type="button"
        disabled={busy}
        onClick={() => onAction(item)}
      >
        {busy ? "Processando…" : getActionLabel(action)}
      </button>
    </div>
  );
}
