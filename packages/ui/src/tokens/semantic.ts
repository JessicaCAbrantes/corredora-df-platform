/**
 * Butterfly UI — Semantic Tokens
 *
 * Mapeia nomes semânticos para tokens primitivos.
 * Componentes consomem semantic tokens, nunca primitivos diretamente.
 *
 * Exemplo: semantic.color.action.primary → colors.primary.500
 */

/** Tokens semânticos de cor */
export interface SemanticColorTokens {
  /** Cor de fundo principal */
  background: string;
  /** Cor de texto principal */
  foreground: string;
  /** Cor de fundo secundária (cards, sections) */
  surface: string;
  /** Cor de borda padrão */
  border: string;
  /** Cor de texto secundário (muted) */
  muted: string;
  /** Ações primárias (buttons, links) */
  action: {
    primary: string;
    primaryHover: string;
    secondary: string;
    secondaryHover: string;
    destructive: string;
    destructiveHover: string;
  };
  /** Estados de feedback */
  feedback: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  /** Foco visível (acessibilidade) */
  focus: string;
  /** Overlay (modais, drawers) */
  overlay: string;
}

/** Tokens semânticos de tipografia */
export interface SemanticTypographyTokens {
  heading: string;
  body: string;
  caption: string;
  label: string;
  link: string;
}

/** Tokens semânticos de interação */
export interface SemanticInteractionTokens {
  /** Raio de borda para botões e inputs */
  controlRadius: string;
  /** Sombra para cards */
  cardShadow: string;
  /** Sombra para overlays */
  overlayShadow: string;
  /** Duração de transição padrão */
  transitionDuration: string;
}

/** Tokens semânticos completos */
export interface SemanticTokens {
  color: SemanticColorTokens;
  typography: SemanticTypographyTokens;
  interaction: SemanticInteractionTokens;
}

export type SemanticTokensPlaceholder = SemanticTokens;
