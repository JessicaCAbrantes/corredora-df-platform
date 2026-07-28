"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Footer } from "../../../../../packages/ui/src/components/Footer";
import { Layout } from "../../../../../packages/ui/src/components/Layout";
import { SiteNavbar } from "../../auth/components/SiteNavbar";
import { getKitPickupRequest } from "../services";
import type { KitPickupRequestItem } from "../types";

type Props = { mode: "success" | "cancel" };

/**
 * After gateway redirect — never trusts the return alone; polls backend status.
 */
export function KitPickupPaymentReturnPage({ mode }: Props) {
  const params = useSearchParams();
  const requestId = params.get("requestId");
  const [item, setItem] = useState<KitPickupRequestItem | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    requestId ? "loading" : "error",
  );

  useEffect(() => {
    if (!requestId) {
      return;
    }

    let cancelled = false;
    let attempts = 0;

    async function poll() {
      const result = await getKitPickupRequest(requestId!);
      if (cancelled) return;
      if (!result.ok) {
        setStatus("error");
        return;
      }
      setItem(result.data);
      if (
        result.data.status === "PAID" ||
        result.data.status === "WAIVED" ||
        result.data.paymentStatus === "FAILED" ||
        attempts >= 8
      ) {
        setStatus("ready");
        return;
      }
      attempts += 1;
      window.setTimeout(() => {
        void poll();
      }, 1500);
    }

    void poll();
    return () => {
      cancelled = true;
    };
  }, [requestId]);

  return (
    <Layout className="kit-pickup-page">
      <SiteNavbar />
      <main id="main-content" className="kit-pickup-page__main">
        <div className="kit-pickup-page__panel">
          <h1 className="kit-pickup-page__title">
            {mode === "success" ? "Retorno do pagamento" : "Pagamento cancelado"}
          </h1>
          {status === "loading" ? (
            <p role="status">Confirmando status no servidor…</p>
          ) : null}
          {status === "error" ? (
            <p role="alert">Não foi possível confirmar o status.</p>
          ) : null}
          {status === "ready" && item ? (
            <p>
              Status atual: <strong>{item.statusLabel}</strong> (
              {item.paymentStatus})
            </p>
          ) : null}
          {requestId ? (
            <p>
              <Link href={`/kit-pickup-requests/${requestId}`}>
                Ver solicitação
              </Link>
            </p>
          ) : (
            <p>
              <Link href="/kit-pickup-requests">Minhas solicitações</Link>
            </p>
          )}
        </div>
      </main>
      <Footer />
    </Layout>
  );
}
