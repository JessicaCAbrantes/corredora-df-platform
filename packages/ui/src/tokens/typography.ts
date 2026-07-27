/**
 * Butterfly UI — Typography Tokens
 *
 * Fontes, tamanhos, pesos e estilos tipográficos.
 */

export interface FontFamilyTokens {
  sans: string;
  mono: string;
  display: string;
}

export type FontSizeToken =
  | "xs"
  | "sm"
  | "base"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "6xl";

export type FontWeightToken =
  | "light"
  | "normal"
  | "medium"
  | "semibold"
  | "bold";

export type LineHeightToken = "tight" | "snug" | "normal" | "relaxed" | "loose";

export interface TypographyStyleToken {
  fontSize: FontSizeToken;
  fontWeight: FontWeightToken;
  lineHeight: LineHeightToken;
}

export interface TypographyTokens {
  fontFamily: FontFamilyTokens;
  styles: {
    h1: TypographyStyleToken;
    h2: TypographyStyleToken;
    h3: TypographyStyleToken;
    h4: TypographyStyleToken;
    body: TypographyStyleToken;
    caption: TypographyStyleToken;
    label: TypographyStyleToken;
  };
}

export type TypographyTokensPlaceholder = TypographyTokens;
