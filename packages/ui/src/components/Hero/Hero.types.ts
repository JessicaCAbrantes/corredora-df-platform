import type { ButtonVariant } from "../Button";

/**
 * Call-to-action configuration.
 * Prefer `href` for navigation — avoids nesting interactive elements.
 */
export interface HeroCta {
  id: string;
  /** Visible label — pass locale strings from the app for i18n */
  label: string;
  href?: string;
  variant?: ButtonVariant;
}

/**
 * Quick indicator (stat / highlight) shown under the CTAs.
 * Structure supports i18n by keeping value and label as plain strings.
 */
export interface HeroIndicator {
  id: string;
  /** Primary text (+500, Brasília/DF, 5K • 10K…) */
  value: string;
  /** Optional supporting label (Eventos, Distâncias…) */
  label?: string;
}

/**
 * Optional athlete / brand image.
 * Omit `src` to render the structural placeholder.
 */
export interface HeroImage {
  src?: string;
  /** Descriptive alt — required for meaningful images; used as aria-label on placeholder */
  alt: string;
  /** Visible placeholder caption when `src` is absent (i18n-ready) */
  placeholderLabel?: string;
}

/**
 * Public props for ButterflyHero.
 * All user-facing strings are injectable for future i18n (next-intl, etc.).
 */
export interface HeroProps {
  /** Main page heading — single h1 per page */
  title?: string;
  /** Supporting line under the title */
  subtitle?: string;
  /** Primary CTA — default: Encontrar Corridas */
  primaryCta?: HeroCta;
  /** Secondary CTA — default: Ver Cupons */
  secondaryCta?: HeroCta;
  /** Quick indicators row */
  indicators?: HeroIndicator[];
  /** Athlete / brand media */
  image?: HeroImage;
  /** Scroll target id (href `#id`) */
  scrollTargetId?: string;
  /** Accessible name for the section landmark */
  ariaLabel?: string;
  /** Accessible label for the scroll control */
  scrollLabel?: string;
  /** Accessible label for the indicators list */
  indicatorsLabel?: string;
  className?: string;
}

/** —— Default copy (pt-BR). Swap via props when i18n lands. —— */

export const DEFAULT_HERO_TITLE = "Sua jornada começa aqui";

export const DEFAULT_HERO_SUBTITLE =
  "A plataforma de corrida do Distrito Federal — encontre provas, cupons e comunidade.";

export const DEFAULT_HERO_PRIMARY_CTA: HeroCta = {
  id: "find-races",
  label: "Encontrar Corridas",
  href: "/corridas",
  variant: "primary",
};

export const DEFAULT_HERO_SECONDARY_CTA: HeroCta = {
  id: "view-coupons",
  label: "Ver Cupons",
  href: "/cupons",
  variant: "outline",
};

export const DEFAULT_HERO_INDICATORS: HeroIndicator[] = [
  { id: "events", value: "+500", label: "eventos" },
  { id: "location", value: "Brasília/DF" },
  {
    id: "distances",
    value: "5K • 10K • 21K • 42K",
    label: "Distâncias",
  },
];

export const DEFAULT_HERO_IMAGE: HeroImage = {
  alt: "Atleta representando a marca Corredora DF — imagem em breve",
  placeholderLabel: "Imagem da atleta (em breve)",
};

export const DEFAULT_HERO_SCROLL_TARGET = "main-content";

export const DEFAULT_HERO_ARIA_LABEL = "Destaque principal";

export const DEFAULT_HERO_SCROLL_LABEL = "Rolar para o conteúdo principal";

export const DEFAULT_HERO_INDICATORS_LABEL = "Indicadores rápidos";

/** @deprecated Use DEFAULT_HERO_INDICATORS — kept for temporary call-site compatibility */
export type HeroStat = HeroIndicator;

/** @deprecated Use DEFAULT_HERO_INDICATORS */
export const DEFAULT_HERO_STATS = DEFAULT_HERO_INDICATORS;
