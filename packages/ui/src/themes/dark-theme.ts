/**
 * Butterfly UI — Dark Theme
 *
 * Tema escuro para ambientes com pouca luz
 * e preferência do usuário (prefers-color-scheme: dark).
 */

import type { Theme, ThemePlaceholder } from "./theme";

/** Identificador do dark theme padrão */
export type DarkThemeId = "dark-default";

/** Contrato do dark theme */
export interface DarkTheme extends Theme {
  metadata: Theme["metadata"] & {
    id: DarkThemeId;
    mode: "dark";
    variant: "default";
  };
}

/** Placeholder — valores serão definidos na fase de branding */
export type DarkThemePlaceholder = DarkTheme;
