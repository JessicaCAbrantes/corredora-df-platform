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
import {
  EXTERNAL_EVENT_DISCLAIMER,
  formatFeeDisplay,
  formatKitPickupDateTime,
  getRegistrationModeLabel,
  hasConfirmedPayment,
  isKitPickupRequestCancellable,
  shouldShowSnapshotFrozenHint,
  SNAPSHOT_FROZEN_HINT,
} from "../utils/kit-pickup-request-presentation";
import { KitPickupCancelDialog } from "./KitPickupCancelDialog";
import { KitPickupRequestTimeline } from "./KitPickupRequestTimeline";

type LoadState =
  | { status: "loading" }
  | { status: "error"; reason: "not_found" | "network" }
  | { status: "ready"; item: KitPickupRequestItem; termContent: string | null };

type Props = { requestId: string };

export function KitPickupRequestDetailPage({ requestId }: Props) {
  const router = useRouter();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"term" | "pay" | "cancel" | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showTermContent, setShowTermContent] = useState(false);

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
      setState({
        status: "error",
        reason: requestResult.reason === "NOT_FOUND" ? "not_found" : "network",
      });
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
        setActionError(
          result.message ?? "Não foi possível registrar o aceite do termo.",
        );
        return;
      }
      setState((prev) =>
        prev.status === "ready" ? { ...prev, item: result.data } : prev,
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
        setActionError(
          result.message ?? "Não foi possível iniciar o pagamento.",
        );
        return;
      }
      window.location.href = result.checkoutUrl;
    } finally {
      setBusy(null);
    }
  }

  async function onConfirmCancel() {
    setActionError(null);
    setBusy("cancel");
    try {
      const result = await cancelKitPickupRequest(requestId);
      if (!result.ok) {
        setActionError(
          result.message ?? "Não foi possível cancelar a solicitação.",
        );
        return;
      }
      setShowCancelDialog(false);
      setState((prev) =>
        prev.status === "ready" ? { ...prev, item: result.data } : prev,
      );
    } finally {
      setBusy(null);
    }
  }

  const item = state.status === "ready" ? state.item : null;
  const cancellable = item ? isKitPickupRequestCancellable(item.status) : false;
  const paidCancellation = item ? hasConfirmedPayment(item) : false;

  return (
    <Layout className="kit-pickup-page">
      <SiteNavbar />
      <main id="main-content" className="kit-pickup-page__main">
        <div className="kit-pickup-page__panel">
          {state.status === "loading" ? (
            <p role="status">Carregando solicitação…</p>
          ) : null}

          {state.status === "error" ? (
            <div role="alert">
              <p>
                {state.reason === "not_found"
                  ? "Solicitação não encontrada."
                  : "Não foi possível carregar a solicitação."}
              </p>
              <p>
                <button type="button" onClick={() => void reload()}>
                  Tentar novamente
                </button>
              </p>
            </div>
          ) : null}

          {item ? (
            <>
              <header className="kit-pickup-detail__header">
                <p className="kit-pickup-detail__eyebrow">{item.event.name}</p>
                <h1 className="kit-pickup-page__title">{item.service.title}</h1>
                <p
                  className="kit-pickup-detail__status-badge"
                  role="status"
                  aria-live="polite"
                >
                  {item.statusLabel}
                </p>
              </header>

              <section className="kit-pickup-detail__section">
                <h2 className="kit-pickup-detail__section-title">Evento</h2>
                <p>{getRegistrationModeLabel(item.registrationMode)}</p>
                {item.registrationMode === "external" ? (
                  <p className="kit-pickup-detail__disclaimer">
                    {EXTERNAL_EVENT_DISCLAIMER}
                  </p>
                ) : null}
                {item.registrationMode === "internal" && item.registrationId ? (
                  <p>Inscrição vinculada à sua conta</p>
                ) : null}
              </section>

              {item.service.pickupLabel ? (
                <section className="kit-pickup-detail__section">
                  <h2 className="kit-pickup-detail__section-title">
                    Retirada do kit
                  </h2>
                  <p>{item.service.pickupLabel}</p>
                </section>
              ) : null}

              {item.participant ? (
                <section className="kit-pickup-detail__section">
                  <h2 className="kit-pickup-detail__section-title">
                    Dados da retirada
                  </h2>
                  <dl className="kit-pickup-page__meta">
                    <div>
                      <dt>Nome</dt>
                      <dd>{item.participant.fullName}</dd>
                    </div>
                    <div>
                      <dt>E-mail</dt>
                      <dd>{item.participant.email}</dd>
                    </div>
                    <div>
                      <dt>Telefone</dt>
                      <dd>{item.participant.phone}</dd>
                    </div>
                    <div>
                      <dt>Número da inscrição</dt>
                      <dd>{item.participant.externalRegistrationCode}</dd>
                    </div>
                  </dl>
                  {shouldShowSnapshotFrozenHint(item) ? (
                    <p className="kit-pickup-detail__hint">{SNAPSHOT_FROZEN_HINT}</p>
                  ) : null}
                </section>
              ) : null}

              <section className="kit-pickup-detail__section">
                <h2 className="kit-pickup-detail__section-title">Pagamento</h2>
                <dl className="kit-pickup-page__meta">
                  <div>
                    <dt>Taxa de retirada</dt>
                    <dd>{formatFeeDisplay(item.feeAmount, item.feeCurrency)}</dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>{item.paymentStatusLabel}</dd>
                  </div>
                </dl>

                {item.status === "PAYMENT_PENDING" ? (
                  <>
                    <p className="kit-pickup-detail__hint">
                      A confirmação do pagamento é feita automaticamente pelo
                      gateway — pode levar alguns instantes após o checkout.
                    </p>
                    <button
                      type="button"
                      onClick={() => void onPay()}
                      disabled={busy !== null}
                    >
                      {busy === "pay" ? "Redirecionando…" : "Pagar taxa"}
                    </button>
                  </>
                ) : null}
              </section>

              <section className="kit-pickup-detail__section">
                <h2 className="kit-pickup-detail__section-title">Termo</h2>

                {!item.term.accepted && item.status === "TERM_PENDING" ? (
                  <div className="kit-pickup-page__term">
                    <p>Termo de retirada (versão {item.term.version})</p>
                    {state.status === "ready" && state.termContent ? (
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
                  </div>
                ) : item.term.accepted ? (
                  <div>
                    <p className="kit-pickup-detail__term-accepted">
                      ✓ Termo aceito
                    </p>
                    <p>
                      Versão: {item.term.version}
                      {item.term.acceptedAt
                        ? ` · Aceito em: ${formatKitPickupDateTime(item.term.acceptedAt)}`
                        : null}
                    </p>
                    <button
                      type="button"
                      className="kit-pickup-detail__link-button"
                      onClick={() => setShowTermContent((open) => !open)}
                    >
                      {showTermContent ? "Ocultar termo" : "Ver termo"}
                    </button>
                    {showTermContent && state.status === "ready" && state.termContent ? (
                      <pre className="kit-pickup-page__term-body">
                        {state.termContent}
                      </pre>
                    ) : null}
                  </div>
                ) : null}
              </section>

              <section className="kit-pickup-detail__section">
                <h2 className="kit-pickup-detail__section-title">
                  Acompanhamento
                </h2>
                <KitPickupRequestTimeline item={item} />
              </section>

              {item.status === "DELIVERED" && item.handover ? (
                <section className="kit-pickup-detail__section">
                  <h2 className="kit-pickup-detail__section-title">
                    Kit entregue
                  </h2>
                  <dl className="kit-pickup-page__meta">
                    <div>
                      <dt>Entregue para</dt>
                      <dd>{item.handover.receivedByName}</dd>
                    </div>
                    <div>
                      <dt>Data da entrega</dt>
                      <dd>
                        {formatKitPickupDateTime(item.handover.deliveredAt)}
                      </dd>
                    </div>
                    {item.handover.notes ? (
                      <div>
                        <dt>Observações</dt>
                        <dd>{item.handover.notes}</dd>
                      </div>
                    ) : null}
                  </dl>
                </section>
              ) : null}

              {item.status === "CANCELLED" ? (
                <p className="kit-pickup-detail__cancelled" role="status">
                  Solicitação cancelada
                </p>
              ) : null}

              {cancellable ? (
                <button
                  type="button"
                  className="kit-pickup-page__cancel"
                  onClick={() => setShowCancelDialog(true)}
                  disabled={busy !== null}
                >
                  Cancelar solicitação
                </button>
              ) : null}

              {actionError ? (
                <p className="kit-pickup-page__error" role="alert">
                  {actionError}
                </p>
              ) : null}

              <p>
                <Link href="/kit-pickup-requests">Voltar para minhas solicitações</Link>
              </p>
            </>
          ) : null}
        </div>
      </main>
      <Footer />

      {showCancelDialog ? (
        <KitPickupCancelDialog
          hasConfirmedPayment={paidCancellation}
          busy={busy === "cancel"}
          onConfirm={() => void onConfirmCancel()}
          onDismiss={() => setShowCancelDialog(false)}
        />
      ) : null}
    </Layout>
  );
}
