import {
  getSectionClassName,
  SECTION_BODY_CLASS,
  SECTION_DESCRIPTION_CLASS,
  SECTION_HEADER_ACTIONS_CLASS,
  SECTION_HEADER_CLASS,
  SECTION_TITLE_CLASS,
} from "./Section.styles";
import type { SectionProps } from "./Section.types";

/**
 * ButterflySection — semantic <section> with optional standardized header.
 *
 * Presentational only: no business logic, no internal state/hooks,
 * no Next.js or Tailwind dependencies.
 */
export function Section({
  children,
  className,
  title,
  description,
  headerActions,
  centered = false,
  id,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
}: SectionProps) {
  const hasHeader = Boolean(title || description || headerActions);

  return (
    <section
      id={id}
      className={getSectionClassName({ centered, className })}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
    >
      {hasHeader ? (
        <header className={SECTION_HEADER_CLASS}>
          {title ? <h2 className={SECTION_TITLE_CLASS}>{title}</h2> : null}

          {description ? (
            <p className={SECTION_DESCRIPTION_CLASS}>{description}</p>
          ) : null}

          {headerActions ? (
            <div className={SECTION_HEADER_ACTIONS_CLASS}>{headerActions}</div>
          ) : null}
        </header>
      ) : null}

      {children != null && children !== false ? (
        <div className={SECTION_BODY_CLASS}>{children}</div>
      ) : null}
    </section>
  );
}
