"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Footer } from "../../../../../packages/ui/src/components/Footer";
import { Layout } from "../../../../../packages/ui/src/components/Layout";
import { SiteNavbar } from "../../auth/components/SiteNavbar";
import { buildLoginUrl } from "../../events/auth/build-login-url";
import { getMyKitPickupRequests } from "../services";
import type { KitPickupRequestItem } from "../types";
import { KitPickupRequestCard } from "./KitPickupRequestCard";

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; items: KitPickupRequestItem[] };

const RETURN_URL = "/kit-pickup-requests";

export function MyKitPickupRequestsPage() {
  const router = useRouter();
  const [state, setState] = useState<LoadState>({ status: "loading" });

  const load = useCallback(async () => {
    const result = await getMyKitPickupRequests();
    if (!result.ok) {
      if (result.reason === "UNAUTHORIZED") {
        router.replace(buildLoginUrl(RETURN_URL));
        return;
      }
      setState({ status: "error" });
      return;
    }
    setState({ status: "ready", items: result.data });
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await load();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  return (
    <Layout className="kit-pickup-page">
      <SiteNavbar />
      <main id="main-content" className="kit-pickup-page__main">
        <div className="kit-pickup-page__panel">
          <h1 className="kit-pickup-page__title">Minhas solicitações</h1>
          <p className="kit-pickup-page__lead">
            Acompanhe o status das suas solicitações de retirada de kit.
          </p>
          <p>
            <Link href="/kit-pickup">Nova solicitação</Link>
            {" · "}
            <Link href="/kit-pickup">Ver serviços disponíveis</Link>
          </p>

          {state.status === "loading" ? (
            <p role="status">Carregando suas solicitações…</p>
          ) : null}

          {state.status === "error" ? (
            <div role="alert">
              <p>Não foi possível carregar suas solicitações.</p>
              <button type="button" onClick={() => void load()}>
                Tentar novamente
              </button>
            </div>
          ) : null}

          {state.status === "ready" && state.items.length === 0 ? (
            <div className="kit-pickup-empty">
              <p>Você ainda não possui solicitações de retirada.</p>
              <Link href="/kit-pickup">Ver serviços disponíveis</Link>
            </div>
          ) : null}

          {state.status === "ready" && state.items.length > 0 ? (
            <div className="kit-pickup-card-grid">
              {state.items.map((item) => (
                <KitPickupRequestCard key={item.id} item={item} />
              ))}
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </Layout>
  );
}
