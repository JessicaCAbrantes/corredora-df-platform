import {
  STACK_ALIGN_CLASSES,
  STACK_BASE_CLASS,
  STACK_DIRECTION_CLASSES,
  STACK_GAP_CLASSES,
  STACK_JUSTIFY_CLASSES,
  type StackProps,
} from "./Stack.types";

/**
 * ButterflyStack — flex-based layout for vertical or horizontal stacking.
 */
export function Stack({
  children,
  direction = "column",
  gap = "md",
  align = "stretch",
  justify = "start",
  className,
}: StackProps) {
  const classNames = [
    STACK_BASE_CLASS,
    STACK_DIRECTION_CLASSES[direction],
    STACK_GAP_CLASSES[gap],
    STACK_ALIGN_CLASSES[align],
    STACK_JUSTIFY_CLASSES[justify],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classNames}>{children}</div>;
}
