"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Footer } from "../../../../../packages/ui/src/components/Footer";
import { Layout } from "../../../../../packages/ui/src/components/Layout";
import { SiteNavbar } from "../../auth/components/SiteNavbar";
import { buildLoginUrl } from "../auth/build-login-url";
import {
  createHttpGetMyKits,
  type MyKitItem,
} from "../infrastructure/http-get-my-kits";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; items: MyKitItem[] }
  | { status: "error" };

const KITS_RETURN_URL = "/kits";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/**
 * Kits / Retirada de Kits MVP — read-only list from GET /events/me/kits.
 * Anonymous / 401 → login with returnUrl=/kits.
 * Distinct from EventKit stub on the race detail page.
 */
export function MyKitsPage() {
  const router = useRouter();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [getMyKits] = useState(() => createHttpGetMyKits());

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const result = await getMyKits();
      if (cancelled) return;

      if (!result.ok) {
        if (result.reason === "UNAUTHORIZED") {
          router.replace(buildLoginUrl(KITS_RETURN_URL));
          return;
        }
        setState({ status: "error" });
        return;
      }

      setState({ status: "ready", items: result.data });
    })();

    return () => {
      cancelled = true;
    };
  }, [getMyKits, router]);

  return (
    <Layout className="my-kits-page">
      <SiteNavbar activeItemId="kits" />
      <main id="main-content" className="my-kits-page__main">
        {state.status === "loading" ? (
          <p className="my-kits-page__status" role="status">
            Carregando seus kits…
          </p>
        ) : null}

        {state.status === "error" ? (
          <div className="my-kits-page__panel" role="alert">
            <h1 className="my-kits-page__title">Retirada de Kits</h1>
            <p className="my-kits-page__error">
              Não foi possível carregar seus kits.
            </p>
            <p className="my-kits-page__error-hint">Tente novamente.</p>
          </div>
        ) : null}

        {state.status === "ready" && state.items.length === 0 ? (
          <div className="my-kits-page__panel">
            <h1 className="my-kits-page__title">Retirada de Kits</h1>
            <p className="my-kits-page__empty-lead">
              Você ainda não possui kits disponíveis para retirada.
            </p>
            <p className="my-kits-page__empty-copy">
              Participe de uma corrida para acompanhar as informações do seu kit.
            </p>
            <Link href="/corridas" className="my-kits-page__cta">
              Ver corridas
            </Link>
          </div>
        ) : null}

        {state.status === "ready" && state.items.length > 0 ? (
          <div className="my-kits-page__panel">
            <h1 className="my-kits-page__title">Retirada de Kits</h1>
            <p className="my-kits-page__subtitle">
              Informações somente leitura dos kits das suas inscrições.
            </p>

            <ul className="my-kits-page__list">
              {state.items.map((item) => (
                <li key={item.kitId} className="my-kits-page__item">
                  <div className="my-kits-page__card">
                    <p className="my-kits-page__kit-label">
                      Kit — {item.event.name}
                    </p>
                    <dl className="my-kits-page__fields">
                      <div className="my-kits-page__field">
                        <dt>Corrida</dt>
                        <dd>{item.event.name}</dd>
                      </div>
                      <div className="my-kits-page__field">
                        <dt>Data</dt>
                        <dd>{formatDate(item.event.date)}</dd>
                      </div>
                      <div className="my-kits-page__field">
                        <dt>Cidade</dt>
                        <dd>{item.event.city}</dd>
                      </div>
                      <div className="my-kits-page__field">
                        <dt>Distância</dt>
                        <dd>{item.event.distance}</dd>
                      </div>
                      <div className="my-kits-page__field">
                        <dt>Status</dt>
                        <dd>Disponível</dd>
                      </div>
                    </dl>
                    <Link
                      href={`/corridas/${item.event.slug}`}
                      className="my-kits-page__event-link"
                    >
                      Ver detalhes da corrida
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </main>
      <Footer />
    </Layout>
  );
}
