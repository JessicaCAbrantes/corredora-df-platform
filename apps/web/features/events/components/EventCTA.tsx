import { Button } from "../../../../../packages/ui/src/components/Button";

export interface EventCTAProps {
  label: string;
  disabled?: boolean;
  loading?: boolean;
  onAction?: () => void;
  className?: string;
}

/**
 * Domain EventCTA — presentational primary action.
 * Emits onAction only; no auth, use case, or domain rules.
 */
export function EventCTA({
  label,
  disabled = false,
  loading = false,
  onAction,
  className,
}: EventCTAProps) {
  return (
    <div className={["event-cta", className].filter(Boolean).join(" ")}>
      <Button
        type="button"
        variant="primary"
        size="lg"
        disabled={disabled}
        loading={loading}
        className="event-cta__button"
        onClick={onAction}
      >
        {loading ? "Processando…" : label}
      </Button>
    </div>
  );
}
