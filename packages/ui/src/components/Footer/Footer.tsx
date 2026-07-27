import {
  DEFAULT_FOOTER_LEGAL_LINKS,
  DEFAULT_FOOTER_LINKS,
  FOOTER_BRAND_CLASS,
  FOOTER_CLASS,
  FOOTER_COPY_CLASS,
  FOOTER_INNER_CLASS,
  FOOTER_LEGAL_CLASS,
  FOOTER_NAV_CLASS,
  FOOTER_TAGLINE_CLASS,
  type FooterProps,
} from "./Footer.types";

/**
 * Butterfly Footer — institutional placeholder footer.
 */
export function Footer({
  brandLabel = "Corredora DF",
  tagline = "A plataforma de corrida do Distrito Federal.",
  links = DEFAULT_FOOTER_LINKS,
  legalLinks = DEFAULT_FOOTER_LEGAL_LINKS,
  className,
}: FooterProps) {
  const year = new Date().getFullYear();
  const classNames = [FOOTER_CLASS, className].filter(Boolean).join(" ");

  return (
    <footer className={classNames}>
      <div className={FOOTER_INNER_CLASS}>
        <div>
          <p className={FOOTER_BRAND_CLASS}>🦋 {brandLabel}</p>
          <p className={FOOTER_TAGLINE_CLASS}>{tagline}</p>
        </div>

        <nav className={FOOTER_NAV_CLASS} aria-label="Links do rodapé">
          <ul>
            {links.map((link) => (
              <li key={link.id}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={FOOTER_LEGAL_CLASS}>
          <ul>
            {legalLinks.map((link) => (
              <li key={link.id}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
          <p className={FOOTER_COPY_CLASS}>
            © {year} {brandLabel}
          </p>
        </div>
      </div>
    </footer>
  );
}
