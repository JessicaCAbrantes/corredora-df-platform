import { getContainerClassName } from "./Container.styles";
import type { ContainerProps } from "./Container.types";

/**
 * ButterflyContainer — constrains content width, centers horizontally,
 * and applies responsive inline padding.
 *
 * Presentational only. Framework-agnostic (no Next.js / Tailwind in JSX).
 */
export function Container({
  children,
  size = "lg",
  fluid = false,
  className,
  id,
}: ContainerProps) {
  return (
    <div
      id={id}
      className={getContainerClassName({ size, fluid, className })}
    >
      {children}
    </div>
  );
}
