import type { NavItem } from "./Navbar.types";

export const NAVBAR_BASE_CLASS = "butterfly-navbar";

export const NAVBAR_INNER_CLASS = "butterfly-navbar__inner";
export const NAVBAR_LOGO_CLASS = "butterfly-navbar__logo";
export const NAVBAR_NAV_CLASS = "butterfly-navbar__nav";
export const NAVBAR_LIST_CLASS = "butterfly-navbar__list";
export const NAVBAR_ITEM_CLASS = "butterfly-navbar__item";
export const NAVBAR_LINK_CLASS = "butterfly-navbar__link";
export const NAVBAR_LINK_ACTIVE_CLASS = "butterfly-navbar__link--active";
export const NAVBAR_ACTIONS_CLASS = "butterfly-navbar__actions";
export const NAVBAR_MENU_TRIGGER_CLASS = "butterfly-navbar__menu-trigger";
export const NAVBAR_MOBILE_MENU_CLASS = "butterfly-navbar__mobile-menu";

export interface NavbarStyleOptions {
  className?: string;
}

export interface NavLinkStyleOptions {
  isActive?: boolean;
}

/**
 * Composes class names for the root <header> element.
 */
export function getNavbarClassName({ className = "" }: NavbarStyleOptions = {}): string {
  return [NAVBAR_BASE_CLASS, className].filter(Boolean).join(" ");
}

/**
 * Composes class names for a navigation link.
 */
export function getNavLinkClassName({ isActive = false }: NavLinkStyleOptions = {}): string {
  return [NAVBAR_LINK_CLASS, isActive ? NAVBAR_LINK_ACTIVE_CLASS : ""]
    .filter(Boolean)
    .join(" ");
}

/**
 * Resolves whether a nav item is the active route.
 */
export function isNavItemActive(item: NavItem, activeItemId?: string): boolean {
  return activeItemId !== undefined && item.id === activeItemId;
}
