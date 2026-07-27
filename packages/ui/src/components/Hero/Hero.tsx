import { getButtonClassName } from "../Button/Button.styles";
import {
  getHeroClassName,
  HERO_ACTIONS_CLASS,
  HERO_BACKGROUND_CLASS,
  HERO_CONTENT_CLASS,
  HERO_FIGURE_CLASS,
  HERO_IMAGE_CLASS,
  HERO_IMAGE_PLACEHOLDER_CLASS,
  HERO_INDICATOR_CLASS,
  HERO_INDICATOR_LABEL_CLASS,
  HERO_INDICATOR_VALUE_CLASS,
  HERO_INDICATORS_CLASS,
  HERO_INNER_CLASS,
  HERO_MEDIA_CLASS,
  HERO_OVERLAY_CLASS,
  HERO_SCROLL_INDICATOR_CLASS,
  HERO_SUBTITLE_CLASS,
  HERO_TITLE_CLASS,
} from "./Hero.styles";
import {
  DEFAULT_HERO_ARIA_LABEL,
  DEFAULT_HERO_IMAGE,
  DEFAULT_HERO_INDICATORS,
  DEFAULT_HERO_INDICATORS_LABEL,
  DEFAULT_HERO_PRIMARY_CTA,
  DEFAULT_HERO_SCROLL_LABEL,
  DEFAULT_HERO_SCROLL_TARGET,
  DEFAULT_HERO_SECONDARY_CTA,
  DEFAULT_HERO_SUBTITLE,
  DEFAULT_HERO_TITLE,
  type HeroCta,
  type HeroProps,
} from "./Hero.types";

function renderCta(cta: HeroCta) {
  const { label, href, variant = "primary", id } = cta;
  const buttonClassName = getButtonClassName({ variant, size: "lg" });

  if (!href) {
    return null;
  }

  return (
    <a key={id} href={href} className={buttonClassName}>
      {label}
    </a>
  );
}

/**
 * ButterflyHero — first-fold hero for Corredora DF.
 * Presentational only: no data fetching, auth, or business rules.
 */
export function Hero({
  title = DEFAULT_HERO_TITLE,
  subtitle = DEFAULT_HERO_SUBTITLE,
  primaryCta = DEFAULT_HERO_PRIMARY_CTA,
  secondaryCta = DEFAULT_HERO_SECONDARY_CTA,
  indicators = DEFAULT_HERO_INDICATORS,
  image = DEFAULT_HERO_IMAGE,
  scrollTargetId = DEFAULT_HERO_SCROLL_TARGET,
  ariaLabel = DEFAULT_HERO_ARIA_LABEL,
  scrollLabel = DEFAULT_HERO_SCROLL_LABEL,
  indicatorsLabel = DEFAULT_HERO_INDICATORS_LABEL,
  className,
}: HeroProps) {
  const ctas = [primaryCta, secondaryCta].filter(
    (cta): cta is HeroCta => Boolean(cta?.href && cta.label),
  );
  const imageAlt = image.alt;
  const placeholderLabel =
    image.placeholderLabel ?? DEFAULT_HERO_IMAGE.placeholderLabel;

  return (
    <section className={getHeroClassName({ className })} aria-label={ariaLabel}>
      <div className={HERO_BACKGROUND_CLASS} aria-hidden="true" />
      <div className={HERO_OVERLAY_CLASS} aria-hidden="true" />

      <div className={HERO_INNER_CLASS}>
        <div className={HERO_CONTENT_CLASS}>
          <h1 className={HERO_TITLE_CLASS}>{title}</h1>

          {subtitle ? (
            <p className={HERO_SUBTITLE_CLASS}>{subtitle}</p>
          ) : null}

          {ctas.length > 0 ? (
            <div className={HERO_ACTIONS_CLASS}>
              {ctas.map((cta) => renderCta(cta))}
            </div>
          ) : null}

          {indicators.length > 0 ? (
            <ul
              className={HERO_INDICATORS_CLASS}
              aria-label={indicatorsLabel}
            >
              {indicators.map((item) => (
                <li key={item.id} className={HERO_INDICATOR_CLASS}>
                  <span className={HERO_INDICATOR_VALUE_CLASS}>{item.value}</span>
                  {item.label ? (
                    <span className={HERO_INDICATOR_LABEL_CLASS}>{item.label}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className={HERO_MEDIA_CLASS}>
          <figure className={HERO_FIGURE_CLASS}>
            {image.src ? (
              // Consumer apps may wrap with next/image; plain img keeps the package framework-agnostic.
              <img
                src={image.src}
                alt={imageAlt}
                className={HERO_IMAGE_CLASS}
              />
            ) : (
              <div
                className={HERO_IMAGE_PLACEHOLDER_CLASS}
                role="img"
                aria-label={imageAlt}
              >
                <span aria-hidden="true">{placeholderLabel}</span>
              </div>
            )}
          </figure>
        </div>
      </div>

      <a
        href={`#${scrollTargetId}`}
        className={HERO_SCROLL_INDICATOR_CLASS}
        aria-label={scrollLabel}
      >
        <span aria-hidden="true">↓</span>
      </a>
    </section>
  );
}
