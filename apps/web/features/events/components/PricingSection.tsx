export interface PricingSectionProps {
  currentPriceLabel: string;
  originalPriceLabel?: string;
  discountLabel?: string;
  className?: string;
}

/**
 * Domain PricingSection — "Quanto custa?"
 * Displays labels already decided by domain/application (mock).
 */
export function PricingSection({
  currentPriceLabel,
  originalPriceLabel,
  discountLabel,
  className,
}: PricingSectionProps) {
  const rootClass = ["event-pricing", className].filter(Boolean).join(" ");

  return (
    <div className={rootClass}>
      {discountLabel ? (
        <p className="event-pricing__discount">{discountLabel}</p>
      ) : null}

      <div className="event-pricing__amounts">
        {originalPriceLabel ? (
          <span className="event-pricing__original">{originalPriceLabel}</span>
        ) : null}
        <span className="event-pricing__current">{currentPriceLabel}</span>
      </div>
    </div>
  );
}
