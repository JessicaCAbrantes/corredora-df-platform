/**
 * Butterfly UI — Breakpoint Tokens
 *
 * Pontos de quebra responsivos (mobile-first).
 */

export type BreakpointToken = "sm" | "md" | "lg" | "xl" | "2xl";

export interface BreakpointTokens {
  /** Largura mínima em px */
  scale: Record<BreakpointToken, number>;
  /** Largura máxima do container de conteúdo */
  container: Record<BreakpointToken, string>;
}

export type BreakpointTokensPlaceholder = BreakpointTokens;
