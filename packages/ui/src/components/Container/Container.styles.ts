import type { ContainerSize } from "./Container.types";

/** Root BEM block — maps to CSS custom properties / tokens later */
export const CONTAINER_BASE_CLASS = "butterfly-container";

/**
 * Size modifier map.
 * Token mapping (planned):
 * - sm → --butterfly-container-sm / breakpoints.container.sm
 * - md → --butterfly-container-md
 * - lg → --butterfly-container-lg
 * - xl → --butterfly-container-xl
 * - fluid → max-width: none (padding retained)
 */
export const CONTAINER_SIZE_CLASSES: Record<ContainerSize, string> = {
  sm: "butterfly-container--sm",
  md: "butterfly-container--md",
  lg: "butterfly-container--lg",
  xl: "butterfly-container--xl",
  fluid: "butterfly-container--fluid",
};

export interface ContainerStyleOptions {
  size?: ContainerSize;
  fluid?: boolean;
  className?: string;
}

/**
 * Resolves the effective size when `fluid` boolean is used.
 */
export function resolveContainerSize(
  size: ContainerSize = "lg",
  fluid?: boolean,
): ContainerSize {
  return fluid ? "fluid" : size;
}

/**
 * Composes final className for ButterflyContainer.
 * No Tailwind — plain BEM strings for token-driven stylesheets.
 */
export function getContainerClassName({
  size = "lg",
  fluid = false,
  className = "",
}: ContainerStyleOptions = {}): string {
  const resolved = resolveContainerSize(size, fluid);

  return [
    CONTAINER_BASE_CLASS,
    CONTAINER_SIZE_CLASSES[resolved],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}
