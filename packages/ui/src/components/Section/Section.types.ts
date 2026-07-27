import type { ReactNode } from "react";

/**
 * Public props for ButterflySection.
 * All copy props accept plain strings for future i18n from the app layer.
 */
export interface SectionProps {
  children?: ReactNode;
  /** Additional class names appended to the BEM root */
  className?: string;
  /** Visible heading — rendered as semantic <h2> */
  title?: string;
  /** Supporting text under the title */
  description?: string;
  /** Optional actions/controls in the header (CTA, filters, Button…) */
  headerActions?: ReactNode;
  /** Center-align header content */
  centered?: boolean;
  /** Optional DOM id for the <section> */
  id?: string;
  /** Accessible name when no visible title is provided */
  "aria-label"?: string;
  /** Explicit labelled-by reference when the consumer owns heading ids */
  "aria-labelledby"?: string;
}
