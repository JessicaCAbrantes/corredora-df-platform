import type { ReactNode } from "react";

/**
 * Single navigation link item.
 */
export interface NavItem {
  id: string;
  label: string;
  href: string;
}

/**
 * Static main navigation items for the Corredora DF platform.
 * Placeholder links — routes will be wired in Sprint 03+.
 */
export const DEFAULT_NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", href: "/" },
  { id: "corridas", label: "Corridas", href: "/corridas" },
  { id: "kits", label: "Retirada de Kits", href: "/kits" },
  { id: "cupons", label: "Cupons", href: "/cupons" },
  { id: "parceiros", label: "Parceiros", href: "/parceiros" },
  { id: "comunidade", label: "Comunidade", href: "/comunidade" },
  { id: "blog", label: "Blog", href: "/blog" },
];

export interface NavbarProps {
  /** Navigation items — defaults to platform menu */
  items?: NavItem[];
  /** Logo link destination */
  logoHref?: string;
  /** Accessible label for the logo */
  logoLabel?: string;
  /** Handler for "Entrar" action (placeholder) */
  onLoginClick?: () => void;
  /** Handler for "Cadastrar-se" action (placeholder) */
  onRegisterClick?: () => void;
  /**
   * Optional override for the actions area.
   * When provided, replaces the default Entrar / Cadastrar-se buttons.
   */
  actions?: ReactNode;
  /** ID of the currently active nav item */
  activeItemId?: string;
  /** Additional CSS class names */
  className?: string;
}

/** ID reserved for the mobile menu panel (future implementation) */
export const NAVBAR_MOBILE_MENU_ID = "butterfly-navbar-mobile-menu";
