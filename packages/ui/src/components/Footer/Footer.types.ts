export interface FooterLink {
  id: string;
  label: string;
  href: string;
}

export interface FooterProps {
  brandLabel?: string;
  tagline?: string;
  links?: FooterLink[];
  legalLinks?: FooterLink[];
  className?: string;
}

export const DEFAULT_FOOTER_LINKS: FooterLink[] = [
  { id: "corridas", label: "Corridas", href: "/corridas" },
  { id: "parceiros", label: "Parceiros", href: "/parceiros" },
  { id: "blog", label: "Blog", href: "/blog" },
  { id: "concierge", label: "Concierge", href: "/concierge" },
];

export const DEFAULT_FOOTER_LEGAL_LINKS: FooterLink[] = [
  { id: "terms", label: "Termos de uso", href: "/termos" },
  { id: "privacy", label: "Privacidade", href: "/privacidade" },
];

export const FOOTER_CLASS = "butterfly-footer";
export const FOOTER_INNER_CLASS = "butterfly-footer__inner";
export const FOOTER_BRAND_CLASS = "butterfly-footer__brand";
export const FOOTER_TAGLINE_CLASS = "butterfly-footer__tagline";
export const FOOTER_NAV_CLASS = "butterfly-footer__nav";
export const FOOTER_LEGAL_CLASS = "butterfly-footer__legal";
export const FOOTER_COPY_CLASS = "butterfly-footer__copy";
