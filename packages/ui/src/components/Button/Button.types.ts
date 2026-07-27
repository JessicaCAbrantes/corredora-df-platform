import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * Visual variants of the Butterfly Button.
 * Mapped to semantic tokens: action.primary, action.secondary, etc.
 */
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "link";

/**
 * Size scale for the Butterfly Button.
 * Mapped to spacing tokens: component.sm, component.md, component.lg.
 */
export type ButtonSize = "sm" | "md" | "lg";

/**
 * Public props for the Butterfly Button component.
 */
export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "onClick"> {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Disables interaction */
  disabled?: boolean;
  /** Shows loading state and disables interaction */
  loading?: boolean;
  /** Button label or content */
  children: ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS class names */
  className?: string;
}
