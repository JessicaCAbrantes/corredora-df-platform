/**
 * Butterfly UI — Theme Contract
 *
 * Define o contrato base para todos os temas do design system.
 * Suporta light, dark, seasonal e event themes.
 */

import type { ThemeTokens } from "../tokens";

/** Modo de cor do tema */
export type ThemeMode = "light" | "dark";

/** Variante do tema */
export type ThemeVariant = "default" | "seasonal" | "event";

/** Identificador único do tema */
export type ThemeId = string;

/** Metadados descritivos do tema */
export interface ThemeMetadata {
  /** Identificador único (ex: "light-default", "dark-default", "seasonal-summer") */
  id: ThemeId;
  /** Nome legível (ex: "Light", "Dark", "Verão 2026") */
  name: string;
  /** Modo de cor */
  mode: ThemeMode;
  /** Variante do tema */
  variant: ThemeVariant;
  /** Descrição opcional */
  description?: string;
  /** Se o tema está ativo e disponível para uso */
  active?: boolean;
}

/** Configurações de acessibilidade do tema */
export interface ThemeAccessibility {
  /** Atende WCAG 2.1 nível AA */
  wcagLevel: "AA" | "AAA";
  /** Suporta prefers-reduced-motion */
  supportsReducedMotion: boolean;
  /** Suporta modo de alto contraste */
  supportsHighContrast: boolean;
  /** Foco visível em elementos interativos */
  visibleFocus: boolean;
  /** Navegação completa por teclado */
  keyboardNavigation: boolean;
}

/** Contrato completo de um tema Butterfly UI */
export interface Theme {
  /** Metadados do tema */
  metadata: ThemeMetadata;
  /** Tokens visuais associados */
  tokens: ThemeTokens;
  /** Configurações de acessibilidade */
  accessibility: ThemeAccessibility;
}

/** Placeholder — implementação será definida na fase de branding */
export type ThemePlaceholder = Theme;

/** Mapa de temas disponíveis (id → tema) */
export type ThemeRegistry = Record<ThemeId, ThemePlaceholder>;
