"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Hero } from "../../../../../packages/ui/src/components/Hero";
import {
  getCurrentUser,
  type CurrentUser,
} from "../../profile/services/http-get-current-user";

export type HomeNextEventTeaser = {
  title: string;
  href: string;
  date: string;
  distance: string;
  city: string;
};

export type HomeHeroProps = {
  nextEvent: HomeNextEventTeaser | null;
};

function dayGreeting(now = new Date()): string {
  const hour = now.getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function displayNameFromEmail(email: string): string {
  const local = email.split("@")[0]?.trim();
  if (!local) return "corredora";
  return local;
}

/**
 * Faculty MVP F3 — Home hero with visitor vs authenticated states.
 * Session via existing /auth/me adapter; no new auth rules.
 */
export function HomeHero({ nextEvent }: HomeHeroProps) {
  const [user, setUser] = useState<CurrentUser | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    void getCurrentUser().then((result) => {
      if (cancelled) return;
      setUser(result.ok ? result.user : null);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const isAuthenticated = Boolean(user);
  const isPending = user === undefined;
  const greeting = dayGreeting();
  const name = user ? displayNameFromEmail(user.email) : null;

  return (
    <>
      {isPending ? (
        <Hero
          secondaryCta={{ id: "hero-pending", label: "", href: undefined }}
          ariaLabel="Carregando área inicial"
        />
      ) : isAuthenticated ? (
        <Hero
          title={`${greeting}, ${name}!`}
          subtitle="Qual será o seu próximo desafio? Continue pelas corridas ou acompanhe seus kits."
          primaryCta={{
            id: "home-corridas",
            label: "Ver corridas",
            href: "/corridas",
            variant: "primary",
          }}
          secondaryCta={{
            id: "home-kits",
            label: "Meus kits",
            href: "/kits",
            variant: "outline",
          }}
          ariaLabel="Boas-vindas à área autenticada"
        />
      ) : (
        <Hero
          secondaryCta={{
            id: "hero-login",
            label: "Entrar",
            href: "/auth/login",
            variant: "outline",
          }}
        />
      )}

      {!isPending && isAuthenticated && nextEvent ? (
        <section className="home-auth-panel" aria-label="Próxima corrida">
          <div className="home-auth-panel__inner">
            <p className="home-auth-panel__eyebrow">Próxima corrida</p>
            <h2 className="home-auth-panel__title">{nextEvent.title}</h2>
            <p className="home-auth-panel__meta">
              {nextEvent.distance} · {nextEvent.date} · {nextEvent.city}
            </p>
            <Link className="home-auth-panel__cta" href={nextEvent.href}>
              Ver corrida
            </Link>
          </div>
        </section>
      ) : null}

      {!isPending && isAuthenticated ? (
        <nav className="home-auth-shortcuts" aria-label="Atalhos da conta">
          <Link className="home-auth-shortcuts__item" href="/corridas">
            Corridas
          </Link>
          <Link className="home-auth-shortcuts__item" href="/kits">
            Meus kits
          </Link>
          <Link className="home-auth-shortcuts__item" href="/minhas-inscricoes">
            Inscrições
          </Link>
          <Link className="home-auth-shortcuts__item" href="/perfil">
            Perfil
          </Link>
        </nav>
      ) : null}
    </>
  );
}
