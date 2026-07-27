/**
 * Butterfly UI — Motion Tokens
 *
 * Durações, easing e presets de animação.
 * Respeita prefers-reduced-motion do usuário.
 */

export type DurationToken = "instant" | "fast" | "normal" | "slow";

export type EasingToken =
  | "linear"
  | "ease-in"
  | "ease-out"
  | "ease-in-out";

export interface MotionPreset {
  duration: DurationToken;
  easing: EasingToken;
}

/** Configuração de reduced motion */
export interface ReducedMotionConfig {
  /** Duração substituta quando prefers-reduced-motion: reduce */
  duration: DurationToken;
  /** Se animações devem ser desabilitadas completamente */
  disableAnimations: boolean;
}

export interface MotionTokens {
  duration: Record<DurationToken, string>;
  easing: Record<EasingToken, string>;
  presets: {
    fade: MotionPreset;
    slide: MotionPreset;
    scale: MotionPreset;
  };
  /** Fallback para prefers-reduced-motion */
  reducedMotion: ReducedMotionConfig;
}

export type MotionTokensPlaceholder = MotionTokens;
