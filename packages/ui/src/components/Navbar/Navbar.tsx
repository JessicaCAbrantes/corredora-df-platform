import { Button } from "../Button";
import {
  getNavLinkClassName,
  getNavbarClassName,
  NAVBAR_ACTIONS_CLASS,
  NAVBAR_INNER_CLASS,
  NAVBAR_ITEM_CLASS,
  NAVBAR_LIST_CLASS,
  NAVBAR_LOGO_CLASS,
  NAVBAR_MENU_TRIGGER_CLASS,
  NAVBAR_MOBILE_MENU_CLASS,
  NAVBAR_NAV_CLASS,
  isNavItemActive,
} from "./Navbar.styles";
import {
  DEFAULT_NAV_ITEMS,
  NAVBAR_MOBILE_MENU_ID,
  type NavbarProps,
} from "./Navbar.types";

/**
 * ButterflyNavbar — primary navigation header for the Corredora DF platform.
 */
export function Navbar({
  items = DEFAULT_NAV_ITEMS,
  logoHref = "/",
  logoLabel = "Corredora DF — Página inicial",
  onLoginClick,
  onRegisterClick,
  actions,
  activeItemId,
  className,
}: NavbarProps) {
  return (
    <header className={getNavbarClassName({ className })}>
      <div className={NAVBAR_INNER_CLASS}>
        <a href={logoHref} className={NAVBAR_LOGO_CLASS} aria-label={logoLabel}>
          <span aria-hidden="true">🦋</span>
          <span>Corredora DF</span>
        </a>

        <nav className={NAVBAR_NAV_CLASS} aria-label="Navegação principal">
          <ul className={NAVBAR_LIST_CLASS}>
            {items.map((item) => {
              const isActive = isNavItemActive(item, activeItemId);

              return (
                <li key={item.id} className={NAVBAR_ITEM_CLASS}>
                  <a
                    href={item.href}
                    className={getNavLinkClassName({ isActive })}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={NAVBAR_ACTIONS_CLASS}>
          {actions ?? (
            <>
              <Button variant="ghost" size="sm" onClick={onLoginClick}>
                Entrar
              </Button>
              <Button variant="primary" size="sm" onClick={onRegisterClick}>
                Cadastrar-se
              </Button>
            </>
          )}
        </div>

        {/*
          Mobile menu trigger — structure only.
          Toggle logic and drawer will be implemented in Sprint 03 (Layout).
        */}
        <button
          type="button"
          className={NAVBAR_MENU_TRIGGER_CLASS}
          aria-label="Abrir menu de navegação"
          aria-expanded={false}
          aria-controls={NAVBAR_MOBILE_MENU_ID}
        >
          Menu
        </button>

        <div
          id={NAVBAR_MOBILE_MENU_ID}
          className={NAVBAR_MOBILE_MENU_CLASS}
          hidden
          aria-hidden="true"
        />
      </div>
    </header>
  );
}
