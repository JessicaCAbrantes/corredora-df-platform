import type { ButtonSize, ButtonVariant } from "./Button.types";

/**
 * Base class for all Butterfly Buttons.
 * Future: bound to semantic.interaction.controlRadius and motion presets.
 */
export const BUTTON_BASE_CLASS = "butterfly-button";

/**
 * Variant class map.
 * Future: each class maps to CSS variables from semantic.color.action.*
 */
export const BUTTON_VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "butterfly-button--primary",
  secondary: "butterfly-button--secondary",
  outline: "butterfly-button--outline",
  ghost: "butterfly-button--ghost",
  link: "butterfly-button--link",
};

/**
 * Size class map.
 * Future: each class maps to spacing.component.* tokens.
 */
export const BUTTON_SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "butterfly-button--sm",
  md: "butterfly-button--md",
  lg: "butterfly-button--lg",
};

/** Class applied when the button is in loading state */
export const BUTTON_LOADING_CLASS = "butterfly-button--loading";

/** Class applied when the button is disabled */
export const BUTTON_DISABLED_CLASS = "butterfly-button--disabled";

export interface ButtonStyleOptions {
  variant: ButtonVariant;
  size: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

/**
 * Composes the final className string for a Butterfly Button.
 * Uses plain CSS class names — no Tailwind — ready for token-driven stylesheets.
 */
export function getButtonClassName({
  variant,
  size,
  disabled = false,
  loading = false,
  className = "",
}: ButtonStyleOptions): string {
  const classes = [
    BUTTON_BASE_CLASS,
    BUTTON_VARIANT_CLASSES[variant],
    BUTTON_SIZE_CLASSES[size],
    loading ? BUTTON_LOADING_CLASS : "",
    disabled || loading ? BUTTON_DISABLED_CLASS : "",
    className,
  ];

  return classes.filter(Boolean).join(" ");
}
