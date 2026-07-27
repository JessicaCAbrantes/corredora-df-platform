/**
 * Navigation Types
 *
 * Interfaces para estrutura de navegação da Plataforma Corredora DF.
 * Consumidas por constants/navigation.ts e features/navigation/.
 */

/** Item individual de navegação */
export interface NavigationItem {
  /** Identificador único */
  id: string;
  /** Texto exibido ao usuário */
  label: string;
  /** URL de destino */
  href: string;
  /** Nome do ícone (referência ao design system) */
  icon?: string;
  /** Se abre em nova aba */
  external?: boolean;
  /** Se o item está desabilitado */
  disabled?: boolean;
  /** Itens filhos (submenu) */
  children?: NavigationItem[];
  /** Se requer autenticação para exibir */
  requiresAuth?: boolean;
  /** Papéis necessários para exibir (futuro: admin) */
  roles?: string[];
}

/** Grupo de itens de navegação relacionados */
export interface NavigationGroup {
  /** Identificador único do grupo */
  id: string;
  /** Título do grupo (opcional, ex: "Conta") */
  label?: string;
  /** Itens do grupo */
  items: NavigationItem[];
}

/** Seção de navegação (agrupa grupos) */
export interface NavigationSection {
  /** Identificador único da seção */
  id: string;
  /** Título da seção (opcional) */
  label?: string;
  /** Grupos dentro da seção */
  groups: NavigationGroup[];
}

/** Contexto de navegação ativo */
export type NavigationContext = "public" | "authenticated" | "admin";

/** Mapa completo de navegação por contexto */
export interface NavigationMap {
  public: NavigationSection[];
  authenticated: NavigationSection[];
  admin: NavigationSection[];
}

/** Placeholder — estrutura será preenchida quando rotas forem implementadas */
export type NavigationMapPlaceholder = NavigationMap;
