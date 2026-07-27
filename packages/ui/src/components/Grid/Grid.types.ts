import type { ReactNode } from "react";

/** Desktop/target column count — future: token breakpoints.grid.* */
export type GridColumns = 1 | 2 | 3 | 4;

/** Gap scale — future: spacing.scale.sm|md|lg */
export type GridGap = "sm" | "md" | "lg";

/**
 * Reserved for a later `align` prop → `place-items` / `align-items`.
 * Not wired in S03-005; exported so consumers and DS maps stay aligned.
 */
export type GridAlign = "start" | "center" | "end" | "stretch";

/**
 * Reserved for a later `justify` prop → `justify-items` / `justify-content`.
 */
export type GridJustify = "start" | "center" | "end" | "between";

/**
 * Reserved for a later `autoFit` mode → `repeat(auto-fit, minmax(...))`.
 * Would coexist with or supersede fixed `columns`.
 */
export type GridAutoFit = boolean | { min: string };

export interface GridProps {
  children: ReactNode;
  /** Target column count @default 1 */
  columns?: GridColumns;
  /** Gutter between items @default "md" */
  gap?: GridGap;
  /**
   * When true, collapses toward 1 column on small viewports and
   * progressively reaches `columns` on larger breakpoints.
   */
  responsive?: boolean;
  /** Additional BEM/extension class names */
  className?: string;
}
