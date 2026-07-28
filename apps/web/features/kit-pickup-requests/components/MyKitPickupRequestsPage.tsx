"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Footer } from "../../../../../packages/ui/src/components/Footer";
import { Layout } from "../../../../../packages/ui/src/components/Layout";
import { SiteNavbar } from "../../auth/components/SiteNavbar";
import { buildLoginUrl } from "../../events/auth/build-login-url";
import { getMyKitPickupRequests } from "../services";
import type { KitPickupRequestItem } from "../types";

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; items: KitPickupRequestItem[] };

const RETURN_URL = "/kit-pickup-requests";

export function MyKitPickupRequestsPage() {
  const router = useRouter();
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await getMyKitPickupRequests();
      if (cancelled) return;
      if (!result.ok) {
        if (result.reason === "UNAUTHORIZED") {
          router.replace(buildLoginUrl(RETURN_URL));
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
  }, [router]);

  return (
    <Layout className="kit-pickup-page">
      <SiteNavbar />
      <main id="main-content" className="kit-pickup-page__main">
        <div className="kit-pickup-page__panel">
          <h1 className="kit-pickup-page__title">Minhas solicitações</h1>
          <p className="kit-pickup-page__lead">
            <Link href="/kit-pickup">Nova solicitação</Link>
          </p>

          {state.status === "loading" ? (
            <p role="status">Carregando…</p>
          ) : null}
          {state.status === "error" ? (
            <p role="alert">Não foi possível carregar suas solicitações.</p>
          ) : null}
          {state.status === "ready" && state.items.length === 0 ? (
            <p>Nenhuma solicitação encontrada.</p>
          ) : null}
          {state.status === "ready" && state.items.length > 0 ? (
            <ul className="kit-pickup-page__list">
              {state.items.map((item) => (
                <li key={item.id}>
                  <Link href={`/kit-pickup-requests/${item.id}`}>
                    {item.event.name} — {item.statusLabel}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </main>
      <Footer />
    </Layout>
  );
}
