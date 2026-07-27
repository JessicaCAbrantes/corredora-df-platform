/**
 * Navigation Constants
 *
 * Estrutura tipada dos itens de navegação da plataforma.
 * Valores serão preenchidos conforme rotas forem implementadas.
 */

import type { NavigationMap, NavigationSection } from "@/types/navigation";

/** Navegação pública — usuários não autenticados */
export const PUBLIC_NAVIGATION: NavigationSection[] = [
  // Futuro:
  // { id: "main", groups: [{ id: "primary", items: [
  //   { id: "home", label: "Home", href: "/" },
  //   { id: "events", label: "Eventos", href: "/events" },
  //   { id: "partners", label: "Parceiros", href: "/partners" },
  //   { id: "blog", label: "Blog", href: "/blog" },
  // ]}]},
];

/** Navegação autenticada — usuários logados */
export const AUTHENTICATED_NAVIGATION: NavigationSection[] = [
  // Futuro: itens públicos + área do usuário
  // { id: "account", label: "Conta", groups: [{ id: "user", items: [
  //   { id: "profile", label: "Perfil", href: "/profile", requiresAuth: true },
  //   { id: "coupons", label: "Cupons", href: "/coupons", requiresAuth: true },
  // ]}]},
];

/** Navegação administrativa — painel admin (futuro) */
export const ADMIN_NAVIGATION: NavigationSection[] = [
  // Futuro: Sprint 12 — Painel Administrativo
  // { id: "admin", label: "Administração", groups: [{ id: "management", items: [
  //   { id: "dashboard", label: "Dashboard", href: "/admin", roles: ["admin"] },
  //   { id: "events-mgmt", label: "Eventos", href: "/admin/events", roles: ["admin"] },
  // ]}]},
];

/** Mapa completo de navegação por contexto */
export const NAVIGATION_MAP: NavigationMap = {
  public: PUBLIC_NAVIGATION,
  authenticated: AUTHENTICATED_NAVIGATION,
  admin: ADMIN_NAVIGATION,
};
