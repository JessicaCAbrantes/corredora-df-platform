import { Footer } from "../../../packages/ui/src/components/Footer";
import type { FooterLink } from "../../../packages/ui/src/components/Footer";

/** Footer links that exist in the Faculty MVP demo surface. */
export const FACULDADE_MVP_FOOTER_LINKS: FooterLink[] = [
  { id: "home", label: "Home", href: "/" },
  { id: "corridas", label: "Corridas", href: "/corridas" },
  { id: "kits", label: "Meus kits", href: "/kits" },
];

export type SiteFooterProps = {
  className?: string;
};

/**
 * Demo-safe footer — no dead /parceiros /blog /termos links.
 */
export function SiteFooter({ className }: SiteFooterProps) {
  return (
    <Footer
      className={className}
      links={FACULDADE_MVP_FOOTER_LINKS}
      legalLinks={[]}
      tagline="A plataforma de corrida do Distrito Federal."
    />
  );
}
