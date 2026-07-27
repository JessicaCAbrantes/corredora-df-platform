export interface EventRouteProps {
  available: boolean;
  summary: string;
  distanceLabel: string;
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
}

/**
 * Domain EventRoute — "Como será a prova?"
 */
export function EventRoute({
  available,
  summary,
  distanceLabel,
  imageSrc,
  imageAlt = "Percurso da corrida",
  className,
}: EventRouteProps) {
  const rootClass = ["event-route", className].filter(Boolean).join(" ");

  if (!available) {
    return (
      <div className={rootClass}>
        <p className="event-route__empty">Percurso ainda não divulgado.</p>
      </div>
    );
  }

  return (
    <div className={rootClass}>
      {imageSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageSrc} alt={imageAlt} className="event-route__image" />
      ) : (
        <div
          className="event-route__placeholder"
          role="img"
          aria-label={imageAlt}
        />
      )}
      <p className="event-route__distance">{distanceLabel}</p>
      <p className="event-route__summary">{summary}</p>
    </div>
  );
}
