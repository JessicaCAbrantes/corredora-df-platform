/**
 * Butterfly UI — Z-Index Tokens
 *
 * Camadas de empilhamento ordenadas.
 * Evita conflitos de z-index arbitrários.
 */

export type ZIndexToken =
  | "base"
  | "dropdown"
  | "sticky"
  | "fixed"
  | "modal"
  | "popover"
  | "tooltip"
  | "toast"
  | "max";

export interface ZIndexTokens {
  scale: Record<ZIndexToken, number>;
}

export type ZIndexTokensPlaceholder = ZIndexTokens;
