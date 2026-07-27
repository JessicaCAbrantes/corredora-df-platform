import { getGridClassName } from "./Grid.styles";
import type { GridProps } from "./Grid.types";

/**
 * ButterflyGrid — CSS Grid layout primitive.
 * Presentational only: no state, business rules, or framework coupling.
 */
export function Grid({
  children,
  columns = 1,
  gap = "md",
  responsive = false,
  className,
}: GridProps) {
  return (
    <div
      className={getGridClassName({ columns, gap, responsive, className })}
    >
      {children}
    </div>
  );
}
