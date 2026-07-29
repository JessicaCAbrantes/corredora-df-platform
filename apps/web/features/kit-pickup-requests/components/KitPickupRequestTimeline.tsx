import type { KitPickupRequestItem } from "../types/kit-pickup-request";
import {
  buildKitPickupTimeline,
  formatKitPickupDateTime,
  type TimelineStep,
} from "../utils/kit-pickup-request-presentation";

type Props = {
  item: KitPickupRequestItem;
};

function stepSymbol(state: TimelineStep["state"]): string {
  if (state === "completed") return "✓";
  if (state === "current") return "●";
  if (state === "skipped") return "—";
  return "○";
}

export function KitPickupRequestTimeline({ item }: Props) {
  const steps = buildKitPickupTimeline(item);

  return (
    <ol className="kit-pickup-timeline" aria-label="Acompanhamento da solicitação">
      {steps.map((step) => (
        <li
          key={step.id}
          className={`kit-pickup-timeline__step kit-pickup-timeline__step--${step.state}`}
        >
          <span className="kit-pickup-timeline__symbol" aria-hidden="true">
            {stepSymbol(step.state)}
          </span>
          <div className="kit-pickup-timeline__content">
            <span className="kit-pickup-timeline__label">{step.label}</span>
            {step.timestamp ? (
              <time
                className="kit-pickup-timeline__time"
                dateTime={step.timestamp}
              >
                {formatKitPickupDateTime(step.timestamp)}
              </time>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
