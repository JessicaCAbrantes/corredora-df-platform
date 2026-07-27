import type { LayoutProps } from "./Layout.types";
import { LAYOUT_BASE_CLASS } from "./Layout.types";

/**
 * ButterflyLayout — root structural wrapper for page composition.
 */
export function Layout({ children, className }: LayoutProps) {
  const classNames = [LAYOUT_BASE_CLASS, className].filter(Boolean).join(" ");

  return <div className={classNames}>{children}</div>;
}
