/**
 * Butterfly UI — Spacing Tokens
 *
 * Escala de espaçamento para margin, padding e gap.
 * Baseado em múltiplos de uma unidade base (4px).
 */

export type SpacingToken =
  | "0"
  | "px"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "8"
  | "10"
  | "12"
  | "16"
  | "20"
  | "24"
  | "32"
  | "40"
  | "48"
  | "64";

export interface SpacingTokens {
  /** Escala principal */
  scale: Record<SpacingToken, string>;
  /** Padding interno de componentes */
  component: {
    sm: SpacingToken;
    md: SpacingToken;
    lg: SpacingToken;
  };
  /** Espaçamento entre seções */
  section: {
    sm: SpacingToken;
    md: SpacingToken;
    lg: SpacingToken;
  };
}

export type SpacingTokensPlaceholder = SpacingTokens;
