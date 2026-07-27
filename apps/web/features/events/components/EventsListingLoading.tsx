/**
 * Loading UI for /corridas — App Router streaming fallback.
 * Local skeleton (grid of card placeholders). Not a DS component.
 */
export function EventsListingLoading() {
  return (
    <div
      className="events-listing-loading"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="events-listing-loading__header">
        <div className="events-listing-loading__title" />
        <div className="events-listing-loading__subtitle" />
      </div>
      <div className="events-listing-loading__grid">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="events-listing-loading__card"
            aria-hidden="true"
          />
        ))}
      </div>
      <span className="events-listing-loading__sr">
        Carregando corridas…
      </span>
    </div>
  );
}
