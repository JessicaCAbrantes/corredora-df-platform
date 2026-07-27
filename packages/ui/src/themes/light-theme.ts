/**
 * Butterfly UI — Light Theme
 *
 * Tema claro padrão da plataforma.
 * Será o tema default da aplicação.
 */

import type { Theme, ThemePlaceholder } from "./theme";

/** Identificador do light theme padrão */
export type LightThemeId = "light-default";

/** Contrato do light theme */
export interface LightTheme extends Theme {
  metadata: Theme["metadata"] & {
    id: LightThemeId;
    mode: "light";
    variant: "default";
  };
}

/** Placeholder — valores serão definidos na fase de branding */
export type LightThemePlaceholder = LightTheme;
