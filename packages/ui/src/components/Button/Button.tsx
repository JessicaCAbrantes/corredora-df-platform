import { getButtonClassName } from "./Button.styles";
import type { ButtonProps } from "./Button.types";

/**
 * ButterflyButton — first official component of the Butterfly UI design system.
 *
 * Uses semantic CSS classes prepared for future Design Token integration.
 */
export function Button({
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  children,
  onClick,
  className,
  type = "button",
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={getButtonClassName({ variant, size, disabled, loading, className })}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      aria-disabled={isDisabled || undefined}
      onClick={isDisabled ? undefined : onClick}
      {...rest}
    >
      {children}
    </button>
  );
}
