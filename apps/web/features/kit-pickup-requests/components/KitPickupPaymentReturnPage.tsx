"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Footer } from "../../../../../packages/ui/src/components/Footer";
import { Layout } from "../../../../../packages/ui/src/components/Layout";
import { SiteNavbar } from "../../auth/components/SiteNavbar";
import { buildLoginUrl } from "../../events/auth/build-login-url";
import { getKitPickupRequest } from "../services";
import type { KitPickupRequestItem } from "../types";

type Props = { mode: "success" | "cancel" };

type PollState =
  | { status: "loading" }
  | { status: "pending"; item: KitPickupRequestItem }
  | { status: "ready"; item: KitPickupRequestItem }
  | { status: "error"; reason: "missing_id" | "unauthorized" | "network" };

function isPaymentSettled(item: KitPickupRequestItem): boolean {
  return (
    item.status === "PICKUP_PENDING" ||
    item.paymentStatus === "PAID" ||
    item.paymentStatus === "WAIVED" ||
    item.paymentStatus === "FAILED"
  );
}

/**
 * After gateway redirect — never trusts the return alone; polls backend status.
 */
export function KitPickupPaymentReturnPage({ mode }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const requestId = params.get("requestId");
  const [pollState, setPollState] = useState<PollState>(
    requestId ? { status: "loading" } : { status: "error", reason: "missing_id" },
  );

  useEffect(() => {
    if (!requestId) return;

    let cancelled = false;
    let attempts = 0;

    async function poll() {
      const result = await getKitPickupRequest(requestId!);
      if (cancelled) return;

      if (!result.ok) {
        if (result.reason === "UNAUTHORIZED") {
          router.replace(
            buildLoginUrl(
              `/kit-pickup-requests/payment/${mode}?requestId=${encodeURIComponent(requestId!)}`,
            ),
          );
          return;
        }
        setPollState({ status: "error", reason: "network" });
        return;
      }

      if (isPaymentSettled(result.data)) {
        setPollState({ status: "ready", item: result.data });
        return;
      }

      if (attempts >= 8) {
        setPollState({ status: "pending", item: result.data });
        return;
      }

      attempts += 1;
      setPollState({ status: "loading" });
      window.setTimeout(() => {
        void poll();
      }, 1500);
    }

    void poll();
    return () => {
      cancelled = true;
    };
  }, [mode, requestId, router]);

  useEffect(() => {
    if (pollState.status !== "ready" || !requestId) return;
    const timeout = window.setTimeout(() => {
      router.replace(`/kit-pickup-requests/${requestId}`);
    }, 2000);
    return () => window.clearTimeout(timeout);
  }, [pollState, requestId, router]);

  return (
    <Layout className="kit-pickup-page">
      <SiteNavbar />
      <main id="main-content" className="kit-pickup-page__main">
        <div className="kit-pickup-page__panel">
          <h1 className="kit-pickup-page__title">
            {mode === "success" ? "Retorno do pagamento" : "Pagamento cancelado"}
          </h1>

          {pollState.status === "loading" ? (
            <p role="status">
              Confirmando status no servidor… A confirmação pode levar alguns
              instantes.
            </p>
          ) : null}

          {pollState.status === "error" ? (
            <div role="alert">
              <p>
                {pollState.reason === "missing_id"
                  ? "Não foi possível identificar a solicitação."
                  : "Não foi possível confirmar o status do pagamento."}
              </p>
              <p>
                <Link href="/kit-pickup-requests">Minhas solicitações</Link>
              </p>
            </div>
          ) : null}

          {pollState.status === "pending" ? (
            <div role="status">
              <p>
                Ainda estamos aguardando a confirmação do pagamento. Isso pode
                levar alguns instantes.
              </p>
              <p>
                Status atual: <strong>{pollState.item.statusLabel}</strong>
              </p>
              {requestId ? (
                <p>
                  <Link href={`/kit-pickup-requests/${requestId}`}>
                    Ver detalhes da solicitação
                  </Link>
                </p>
              ) : null}
            </div>
          ) : null}

          {pollState.status === "ready" ? (
            <div role="status">
              <p>
                Status atual: <strong>{pollState.item.statusLabel}</strong>
              </p>
              <p>Redirecionando para os detalhes da solicitação…</p>
              {requestId ? (
                <p>
                  <Link href={`/kit-pickup-requests/${requestId}`}>
                    Ver solicitação agora
                  </Link>
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </Layout>
  );
}
