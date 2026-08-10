"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FACULDADE_MVP_NAV_ITEMS } from "@/constants/faculdade-mvp-nav";
import { Button } from "../../../../../packages/ui/src/components/Button";
import { Navbar } from "../../../../../packages/ui/src/components/Navbar";
import { getSession, type Session } from "../services/http-get-session";
import { LogoutButton } from "./LogoutButton";

export type SiteNavbarProps = {
  activeItemId?: string;
  className?: string;
};

/**
 * Navbar with auth-aware actions — no AuthProvider.
 * Session via getSession() → GET /auth/me (fail closed while loading).
 */
export function SiteNavbar({ activeItemId, className }: SiteNavbarProps) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    void getSession().then((value) => {
      if (!cancelled) setSession(value);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const actions =
    session === undefined ? (
      <span className="auth-nav-actions auth-nav-actions--pending" aria-hidden="true" />
    ) : session ? (
      <div className="auth-nav-actions">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            router.push("/kits");
          }}
        >
          Meus kits
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            router.push("/perfil");
          }}
        >
          Perfil
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            router.push("/minhas-inscricoes");
          }}
        >
          Minhas inscrições
        </Button>
        <LogoutButton />
      </div>
    ) : (
      <div className="auth-nav-actions">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            router.push("/auth/login");
          }}
        >
          Entrar
        </Button>
      </div>
    );

  return (
    <Navbar
      items={FACULDADE_MVP_NAV_ITEMS}
      activeItemId={activeItemId}
      className={className}
      actions={actions}
    />
  );
}
