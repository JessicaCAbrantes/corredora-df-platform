import type { ReactNode } from "react";

/**
 * Max-width presets for ButterflyContainer.
 * Future: bound to design tokens `breakpoints.container.*`.
 */
export type ContainerSize = "sm" | "md" | "lg" | "xl" | "fluid";

export interface ContainerProps {
  children: ReactNode;
  /**
   * Horizontal width constraint.
   * Ignored when `fluid` is `true`.
   * @default "lg"
   */
  size?: ContainerSize;
  /**
   * Shorthand for `size="fluid"` — full-bleed width with responsive padding.
   * Takes precedence over `size`.
   */
  fluid?: boolean;
  /** Additional BEM/extension class names */
  className?: string;
  /** Optional native id for landmark targets */
  id?: string;
}
