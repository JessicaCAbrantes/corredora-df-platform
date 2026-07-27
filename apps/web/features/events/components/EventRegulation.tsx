export interface EventRegulationProps {
  summary: string;
  href: string;
  linkLabel: string;
  className?: string;
}

/**
 * Domain EventRegulation — "Quais são as regras?"
 */
export function EventRegulation({
  summary,
  href,
  linkLabel,
  className,
}: EventRegulationProps) {
  const rootClass = ["event-regulation", className].filter(Boolean).join(" ");

  return (
    <div className={rootClass}>
      <p className="event-regulation__summary">{summary}</p>
      <a className="event-regulation__link" href={href}>
        {linkLabel}
      </a>
    </div>
  );
}
