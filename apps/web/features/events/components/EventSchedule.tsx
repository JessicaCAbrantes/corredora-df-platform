export interface EventScheduleItem {
  id: string;
  label: string;
  timeLabel: string;
}

export interface EventScheduleProps {
  items: EventScheduleItem[];
  className?: string;
}

/**
 * Domain EventSchedule — "Como me organizar?"
 */
export function EventSchedule({ items, className }: EventScheduleProps) {
  const rootClass = ["event-schedule", className].filter(Boolean).join(" ");

  if (items.length === 0) {
    return (
      <div className={rootClass}>
        <p className="event-schedule__empty">Programação em breve.</p>
      </div>
    );
  }

  return (
    <ol className={rootClass}>
      {items.map((item) => (
        <li key={item.id} className="event-schedule__item">
          <span className="event-schedule__label">{item.label}</span>
          <span className="event-schedule__time">{item.timeLabel}</span>
        </li>
      ))}
    </ol>
  );
}
