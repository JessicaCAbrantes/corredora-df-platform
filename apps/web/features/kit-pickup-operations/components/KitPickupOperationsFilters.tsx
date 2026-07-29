import type { OperationalQueueTab } from "../types/kit-pickup-operations";
import { QUEUE_TABS } from "../utils/kit-pickup-operations-presentation";

type Props = {
  activeTab: OperationalQueueTab;
  onTabChange: (tab: OperationalQueueTab) => void;
  registrationMode: "" | "internal" | "external";
  onRegistrationModeChange: (mode: "" | "internal" | "external") => void;
};

export function KitPickupOperationsFilters({
  activeTab,
  onTabChange,
  registrationMode,
  onRegistrationModeChange,
}: Props) {
  return (
    <div className="kit-ops-filters">
      <div className="kit-ops-filters__tabs" role="tablist" aria-label="Fila operacional">
        {QUEUE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={
              activeTab === tab.id
                ? "kit-ops-filters__tab kit-ops-filters__tab--active"
                : "kit-ops-filters__tab"
            }
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <label className="kit-ops-filters__mode">
        <span>Modo do evento</span>
        <select
          value={registrationMode}
          onChange={(e) =>
            onRegistrationModeChange(
              e.target.value as "" | "internal" | "external",
            )
          }
        >
          <option value="">Todos</option>
          <option value="internal">Corredora DF</option>
          <option value="external">Terceiros</option>
        </select>
      </label>
    </div>
  );
}
