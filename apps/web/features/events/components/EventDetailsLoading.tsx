/**
 * Loading UI for /corridas/[slug] — App Router streaming fallback.
 */
export function EventDetailsLoading() {
  return (
    <div className="event-details-loading" aria-busy="true" aria-live="polite">
      <div className="event-details-loading__hero" />
      <div className="event-details-loading__body">
        <div className="event-details-loading__line" />
        <div className="event-details-loading__line event-details-loading__line--short" />
        <div className="event-details-loading__line" />
      </div>
      <span className="event-details-loading__sr">Carregando corrida…</span>
    </div>
  );
}
