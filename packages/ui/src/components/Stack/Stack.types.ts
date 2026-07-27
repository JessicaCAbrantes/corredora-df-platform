import type { ReactNode } from "react";

export type StackDirection = "row" | "column";

/** Gap presets — future: mapped to spacing.scale */
export type StackGap = "sm" | "md" | "lg";

export type StackAlign = "start" | "center" | "end" | "stretch";

export type StackJustify = "start" | "center" | "end" | "between";

export interface StackProps {
  children: ReactNode;
  direction?: StackDirection;
  gap?: StackGap;
  align?: StackAlign;
  justify?: StackJustify;
  className?: string;
}

export const STACK_BASE_CLASS = "butterfly-stack";

export const STACK_DIRECTION_CLASSES: Record<StackDirection, string> = {
  row: "butterfly-stack--row",
  column: "butterfly-stack--column",
};

export const STACK_GAP_CLASSES: Record<StackGap, string> = {
  sm: "butterfly-stack--gap-sm",
  md: "butterfly-stack--gap-md",
  lg: "butterfly-stack--gap-lg",
};

export const STACK_ALIGN_CLASSES: Record<StackAlign, string> = {
  start: "butterfly-stack--align-start",
  center: "butterfly-stack--align-center",
  end: "butterfly-stack--align-end",
  stretch: "butterfly-stack--align-stretch",
};

export const STACK_JUSTIFY_CLASSES: Record<StackJustify, string> = {
  start: "butterfly-stack--justify-start",
  center: "butterfly-stack--justify-center",
  end: "butterfly-stack--justify-end",
  between: "butterfly-stack--justify-between",
};
