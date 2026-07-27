import type { ReactNode } from "react";

/**
 * Root layout wrapper for page composition.
 * Maps to the outermost structural shell of a view.
 */
export interface LayoutProps {
  /** Page or section content */
  children: ReactNode;
  /** Additional CSS class names */
  className?: string;
}

/** Base CSS class — future: bound to layout spacing tokens */
export const LAYOUT_BASE_CLASS = "butterfly-layout";
