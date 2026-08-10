export interface EventKitProps {
  available: boolean;
  description: string;
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
}

/**
 * Domain EventKit — "O kit vale a pena?"
 */
export function EventKit({
  available,
  description,
  imageSrc,
  imageAlt = "Kit do evento",
  className,
}: EventKitProps) {
  const rootClass = ["event-kit", className].filter(Boolean).join(" ");

  return (
    <div className={rootClass}>
      {available && imageSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageSrc} alt={imageAlt} className="event-kit__image" />
      ) : available ? (
        <div
          className="event-kit__placeholder"
          role="img"
          aria-label={imageAlt}
        />
      ) : null}
      <p className="event-kit__description">{description}</p>
      {!available ? (
        <p className="event-kit__status">Disponível após a inscrição</p>
      ) : null}
    </div>
  );
}
