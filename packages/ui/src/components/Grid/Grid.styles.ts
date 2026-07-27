import type { GridColumns, GridGap } from "./Grid.types";

export const GRID_BASE_CLASS = "butterfly-grid";
export const GRID_RESPONSIVE_CLASS = "butterfly-grid--responsive";

/**
 * Column modifiers.
 * Token plan: --butterfly-grid-cols-{n} or repeat(n, minmax(0, 1fr))
 */
export const GRID_COLUMNS_CLASSES: Record<GridColumns, string> = {
  1: "butterfly-grid--cols-1",
  2: "butterfly-grid--cols-2",
  3: "butterfly-grid--cols-3",
  4: "butterfly-grid--cols-4",
};

/**
 * Gap modifiers → spacing tokens.
 */
export const GRID_GAP_CLASSES: Record<GridGap, string> = {
  sm: "butterfly-grid--gap-sm",
  md: "butterfly-grid--gap-md",
  lg: "butterfly-grid--gap-lg",
};

export interface GridStyleOptions {
  columns?: GridColumns;
  gap?: GridGap;
  responsive?: boolean;
  className?: string;
}

/**
 * Composes BEM class names for ButterflyGrid.
 * No Tailwind — plain strings for token-driven stylesheets.
 */
export function getGridClassName({
  columns = 1,
  gap = "md",
  responsive = false,
  className = "",
}: GridStyleOptions = {}): string {
  return [
    GRID_BASE_CLASS,
    GRID_COLUMNS_CLASSES[columns],
    GRID_GAP_CLASSES[gap],
    responsive ? GRID_RESPONSIVE_CLASS : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}
