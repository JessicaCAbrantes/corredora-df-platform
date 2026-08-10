/**
 * Faculty Demo MVP — primary nav items that resolve to real routes.
 * Dead destinations (/cupons, /parceiros, /comunidade, /blog) stay out of the chrome.
 */
import type { NavItem } from "../../../packages/ui/src/components/Navbar";

export const FACULDADE_MVP_NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", href: "/" },
  { id: "corridas", label: "Corridas", href: "/corridas" },
  { id: "kits", label: "Meus kits", href: "/kits" },
];
