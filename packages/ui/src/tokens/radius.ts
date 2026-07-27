/**
 * Butterfly UI — Radius Tokens
 *
 * Border-radius para componentes e containers.
 */

export type RadiusToken =
  | "none"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "full";

export interface RadiusTokens {
  scale: Record<RadiusToken, string>;
  component: RadiusToken;
  container: RadiusToken;
}

export type RadiusTokensPlaceholder = RadiusTokens;
