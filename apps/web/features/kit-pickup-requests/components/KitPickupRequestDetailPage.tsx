"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Footer } from "../../../../../packages/ui/src/components/Footer";
import { Layout } from "../../../../../packages/ui/src/components/Layout";
import { SiteNavbar } from "../../auth/components/SiteNavbar";
import { buildLoginUrl } from "../../events/auth/build-login-url";
import {
  acceptKitPickupTerm,
  cancelKitPickupRequest,
  getCurrentKitPickupTerm,
  getKitPickupRequest,
  startKitPickupPayment,
} from "../services";
import type { KitPickupRequestItem } from "../types";

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; item: KitPickupRequestItem; termContent: string | null };

type Props = { requestId: string };

export function KitPickupRequestDetailPage({ requestId }: Props) {
  const router = useRouter();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"term" | "pay" | "cancel" | null>(null);

  const returnUrl = `/kit-pickup-requests/${requestId}`;

  const reload = useCallback(async () => {
    const [requestResult, termResult] = await Promise.all([
      getKitPickupRequest(requestId),
      getCurrentKitPickupTerm(),
    ]);

    if (!requestResult.ok) {
      if (requestResult.reason === "UNAUTHORIZED") {
        router.replace(buildLoginUrl(returnUrl));
        return;
      }
      setState({ status: "error" });
      return;
    }

    setState({
      status: "ready",
      item: requestResult.data,
      termContent: termResult.ok ? termResult.content : null,
    });
  }, [requestId, returnUrl, router]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await reload();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [reload]);

  async function onAcceptTerm() {
    setActionError(null);
    setBusy("term");
    try {
      const result = await acceptKitPickupTerm(requestId);
      if (!result.ok) {
        setActionError(result.message ?? "Falha ao aceitar o termo.");
        return;
      }
      setState((prev) =>
        prev.status === "ready"
          ? { ...prev, item: result.data }
          : prev,
      );
    } finally {
      setBusy(null);
    }
  }

  async function onPay() {
    setActionError(null);
    setBusy("pay");
    try {
      const result = await startKitPickupPayment(requestId);
      if (!result.ok) {
        setActionError(result.message ?? "Falha ao iniciar pagamento.");
        return;
      }
      window.location.href = result.checkoutUrl;
    } finally {
      setBusy(null);
    }
  }

  async function onCancel() {
    setActionError(null);
    setBusy("cancel");
    try {
      const result = await cancelKitPickupRequest(requestId);
      if (!result.ok) {
        setActionError(result.message ?? "Falha ao cancelar.");
        return;
      }
      setState((prev) =>
        prev.status === "ready"
          ? { ...prev, item: result.data }
          : prev,
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <Layout className="kit-pickup-page">
      <SiteNavbar />
      <main id="main-content" className="kit-pickup-page__main">
        <div className="kit-pickup-page__panel">
          {state.status === "loading" ? (
            <p role="status">Carregando solicitação…</p>
          ) : null}
          {state.status === "error" ? (
            <p role="alert">Solicitação não encontrada.</p>
          ) : null}

          {state.status === "ready" ? (
            <>
              <h1 className="kit-pickup-page__title">{state.item.event.name}</h1>
              <p className="kit-pickup-page__lead">
                {state.item.service.title} · {state.item.statusLabel}
              </p>

              <dl className="kit-pickup-page__meta">
                <div>
                  <dt>Status</dt>
                  <dd>{state.item.statusLabel}</dd>
                </div>
                <div>
                  <dt>Pagamento</dt>
                  <dd>{state.item.paymentStatus}</dd>
                </div>
                <div>
                  <dt>Taxa</dt>
                  <dd>
                    {state.item.feeAmount
                      ? `${state.item.feeAmount} ${state.item.feeCurrency}`
                      : "Sem taxa"}
                  </dd>
                </div>
                <div>
                  <dt>Modo</dt>
                  <dd>{state.item.registrationMode}</dd>
                </div>
              </dl>

              {state.item.participant ? (
                <section>
                  <h2>Participante</h2>
                  <p>
                    {state.item.participant.fullName} ·{" "}
                    {state.item.participant.email} ·{" "}
                    {state.item.participant.phone}
                  </p>
                  <p>
                    Código externo:{" "}
                    {state.item.participant.externalRegistrationCode}
                  </p>
                </section>
              ) : null}

              {!state.item.term.accepted && state.item.status === "TERM_PENDING" ? (
                <section className="kit-pickup-page__term">
                  <h2>Termo de retirada (v{state.item.term.version})</h2>
                  {state.termContent ? (
                    <pre className="kit-pickup-page__term-body">
                      {state.termContent}
                    </pre>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => void onAcceptTerm()}
                    disabled={busy !== null}
                  >
                    {busy === "term" ? "Registrando…" : "Aceitar termo"}
                  </button>
                </section>
              ) : null}

              {state.item.status === "PAYMENT_PENDING" ? (
                <section>
                  <h2>Pagamento</h2>
                  <p>
                    Confirmação somente via gateway — o status PAID não é definido
                    pelo navegador.
                  </p>
                  <button
                    type="button"
                    onClick={() => void onPay()}
                    disabled={busy !== null}
                  >
                    {busy === "pay" ? "Redirecionando…" : "Pagar taxa"}
                  </button>
                </section>
              ) : null}

              {state.item.status === "PAID" || state.item.status === "WAIVED" ? (
                <p role="status">
                  Solicitação pronta. A retirada operacional será tratada na Fase
                  2.1.
                </p>
              ) : null}

              {state.item.status !== "CANCELLED" ? (
                <button
                  type="button"
                  className="kit-pickup-page__cancel"
                  onClick={() => void onCancel()}
                  disabled={busy !== null}
                >
                  {busy === "cancel" ? "Cancelando…" : "Cancelar solicitação"}
                </button>
              ) : null}

              {actionError ? (
                <p className="kit-pickup-page__error" role="alert">
                  {actionError}
                </p>
              ) : null}

              <p>
                <Link href="/kit-pickup-requests">Voltar</Link>
              </p>
            </>
          ) : null}
        </div>
      </main>
      <Footer />
    </Layout>
  );
}
