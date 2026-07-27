/**
 * Butterfly UI — Theme Tokens
 *
 * Barrel de exportação de todos os tokens.
 * Agrega primitivos + semânticos no contrato ThemeTokens.
 */

export type {
  ColorScale,
  FeedbackColors,
  ColorTokens,
  ColorTokensPlaceholder,
} from "./colors";

export type {
  FontFamilyTokens,
  FontSizeToken,
  FontWeightToken,
  LineHeightToken,
  TypographyStyleToken,
  TypographyTokens,
  TypographyTokensPlaceholder,
} from "./typography";

export type {
  SpacingToken,
  SpacingTokens,
  SpacingTokensPlaceholder,
} from "./spacing";

export type {
  RadiusToken,
  RadiusTokens,
  RadiusTokensPlaceholder,
} from "./radius";

export type {
  ShadowToken,
  ShadowTokens,
  ShadowTokensPlaceholder,
} from "./shadows";

export type {
  DurationToken,
  EasingToken,
  MotionPreset,
  ReducedMotionConfig,
  MotionTokens,
  MotionTokensPlaceholder,
} from "./motion";

export type {
  BreakpointToken,
  BreakpointTokens,
  BreakpointTokensPlaceholder,
} from "./breakpoints";

export type {
  ZIndexToken,
  ZIndexTokens,
  ZIndexTokensPlaceholder,
} from "./z-index";

export type {
  SemanticColorTokens,
  SemanticTypographyTokens,
  SemanticInteractionTokens,
  SemanticTokens,
  SemanticTokensPlaceholder,
} from "./semantic";

/** Contrato completo de tokens consumido por um Theme */
export interface ThemeTokens {
  /** Tokens primitivos */
  colors: import("./colors").ColorTokens;
  typography: import("./typography").TypographyTokens;
  spacing: import("./spacing").SpacingTokens;
  radius: import("./radius").RadiusTokens;
  shadows: import("./shadows").ShadowTokens;
  motion: import("./motion").MotionTokens;
  breakpoints: import("./breakpoints").BreakpointTokens;
  zIndex: import("./z-index").ZIndexTokens;
  /** Tokens semânticos (mapeiam primitivos para uso em componentes) */
  semantic: import("./semantic").SemanticTokens;
}

/** Placeholder — instância completa será criada por tema */
export type ThemeTokensPlaceholder = ThemeTokens;
