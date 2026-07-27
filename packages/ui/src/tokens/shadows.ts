/**
 * Butterfly UI — Shadow Tokens
 *
 * Elevações e sombras para profundidade visual.
 */

export type ShadowToken =
  | "none"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "inner";

export interface ShadowTokens {
  scale: Record<ShadowToken, string>;
  card: ShadowToken;
  overlay: ShadowToken;
}

export type ShadowTokensPlaceholder = ShadowTokens;
