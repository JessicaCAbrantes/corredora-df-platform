/**
 * Butterfly UI — Color Tokens
 *
 * Paleta de cores primitivas do design system.
 * Valores concretos serão definidos por tema (light, dark, seasonal, event).
 */

/** Escala de cor com variações de tonalidade */
export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

/** Cores de feedback e estados */
export interface FeedbackColors {
  success: ColorScale;
  warning: ColorScale;
  error: ColorScale;
  info: ColorScale;
}

/** Tokens de cor primitivos */
export interface ColorTokens {
  primary: ColorScale;
  secondary: ColorScale;
  neutral: ColorScale;
  feedback: FeedbackColors;
}

export type ColorTokensPlaceholder = ColorTokens;
