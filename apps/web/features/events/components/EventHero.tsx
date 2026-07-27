export interface EventHeroProps {
  name: string;
  dateLabel: string;
  timeLabel: string;
  distanceLabel: string;
  locationLabel: string;
  imageAlt: string;
  imageSrc?: string;
  className?: string;
}

/**
 * Domain EventHero — "Que corrida é esta?"
 * Presentational only: props in, markup out.
 */
export function EventHero({
  name,
  dateLabel,
  timeLabel,
  distanceLabel,
  locationLabel,
  imageAlt,
  imageSrc,
  className,
}: EventHeroProps) {
  const rootClass = ["event-hero", className].filter(Boolean).join(" ");

  return (
    <header className={rootClass}>
      <div className="event-hero__media">
        {imageSrc ? (
          // Framework-agnostic img; app may later wrap with next/image.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageSrc} alt={imageAlt} className="event-hero__image" />
        ) : (
          <div
            className="event-hero__placeholder"
            role="img"
            aria-label={imageAlt}
          >
            <span aria-hidden="true">Imagem da corrida</span>
          </div>
        )}
      </div>

      <div className="event-hero__content">
        <h1 className="event-hero__title">{name}</h1>
        <ul className="event-hero__meta">
          <li className="event-hero__meta-item">
            <span className="event-hero__meta-label">Data</span>
            <span className="event-hero__meta-value">{dateLabel}</span>
          </li>
          <li className="event-hero__meta-item">
            <span className="event-hero__meta-label">Horário</span>
            <span className="event-hero__meta-value">{timeLabel}</span>
          </li>
          <li className="event-hero__meta-item">
            <span className="event-hero__meta-label">Distância</span>
            <span className="event-hero__meta-value">{distanceLabel}</span>
          </li>
          <li className="event-hero__meta-item">
            <span className="event-hero__meta-label">Local</span>
            <span className="event-hero__meta-value">{locationLabel}</span>
          </li>
        </ul>
      </div>
    </header>
  );
}
