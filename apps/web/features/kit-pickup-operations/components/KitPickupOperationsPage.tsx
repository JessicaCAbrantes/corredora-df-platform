"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Footer } from "../../../../../packages/ui/src/components/Footer";
import { Layout } from "../../../../../packages/ui/src/components/Layout";
import { SiteNavbar } from "../../auth/components/SiteNavbar";
import { buildLoginUrl } from "../../events/auth/build-login-url";
import {
  getKitPickupOperations,
  handoverKitPickupRequest,
  markKitPickupRequestReady,
  pickupKitPickupRequest,
  takeKitPickupRequestIntoCustody,
} from "../services";
import type {
  OperationalQueueTab,
  OperationalRequestItem,
  OperationsListMeta,
} from "../types/kit-pickup-operations";
import {
  CONFLICT_MESSAGE,
  getAvailableAction,
} from "../utils/kit-pickup-operations-presentation";
import { KitPickupHandoverDialog } from "./KitPickupHandoverDialog";
import { KitPickupOperationActionBar } from "./KitPickupOperationActionBar";
import { KitPickupOperationDetailPanel } from "./KitPickupOperationDetailPanel";
import { KitPickupOperationsFilters } from "./KitPickupOperationsFilters";
import { KitPickupOperationsQueue } from "./KitPickupOperationsQueue";
import { KitPickupOperatorAccessDenied } from "./KitPickupOperatorAccessDenied";

const RETURN_URL = "/operator/kit-pickup";

type PageState =
  | { status: "loading" }
  | { status: "forbidden" }
  | { status: "error" }
  | {
      status: "ready";
      items: OperationalRequestItem[];
      meta: OperationsListMeta;
    };

export function KitPickupOperationsPage() {
  const router = useRouter();
  const [pageState, setPageState] = useState<PageState>({ status: "loading" });
  const [activeTab, setActiveTab] = useState<OperationalQueueTab>("PICKUP_PENDING");
  const [registrationMode, setRegistrationMode] = useState<
    "" | "internal" | "external"
  >("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<OperationalRequestItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [handoverTarget, setHandoverTarget] =
    useState<OperationalRequestItem | null>(null);

  const load = useCallback(async () => {
    setActionError(null);
    const result = await getKitPickupOperations({
      status: activeTab,
      page,
      perPage: 20,
      sort: "createdAt",
      order: "asc",
      ...(registrationMode ? { registrationMode } : {}),
    });

    if (!result.ok) {
      if (result.reason === "UNAUTHORIZED") {
        router.replace(buildLoginUrl(RETURN_URL));
        return;
      }
      if (result.reason === "FORBIDDEN") {
        setPageState({ status: "forbidden" });
        return;
      }
      setPageState({ status: "error" });
      return;
    }

    setPageState({
      status: "ready",
      items: result.data,
      meta: result.meta,
    });

    setSelected((prev) => {
      if (!prev) return null;
      return result.data.find((item) => item.id === prev.id) ?? null;
    });
  }, [activeTab, page, registrationMode, router]);

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

  function handleTabChange(tab: OperationalQueueTab) {
    setActiveTab(tab);
    setPage(1);
    setSelected(null);
  }

  function handleRegistrationModeChange(mode: "" | "internal" | "external") {
    setRegistrationMode(mode);
    setPage(1);
    setSelected(null);
  }

  async function executeAction(item: OperationalRequestItem) {
    const action = getAvailableAction(item.status);
    if (!action) return;

    if (action === "handover") {
      setHandoverTarget(item);
      return;
    }

    setBusy(true);
    setActionError(null);
    setFeedback(null);

    try {
      const result =
        action === "pickup"
          ? await pickupKitPickupRequest(item.id)
          : action === "takeIntoCustody"
            ? await takeKitPickupRequestIntoCustody(item.id)
            : await markKitPickupRequestReady(item.id);

      if (!result.ok) {
        if (result.reason === "UNAUTHORIZED") {
          router.replace(buildLoginUrl(RETURN_URL));
          return;
        }
        if (result.reason === "FORBIDDEN") {
          setPageState({ status: "forbidden" });
          return;
        }
        if (result.reason === "CONFLICT") {
          setActionError(CONFLICT_MESSAGE);
          await load();
          return;
        }
        if (result.reason === "NOT_FOUND") {
          setActionError("Solicitação não encontrada.");
          await load();
          return;
        }
        setActionError(result.message ?? "Não foi possível executar a operação.");
        return;
      }

      setSelected(result.data);
      setFeedback("Operação registrada com sucesso.");
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function confirmHandover(input: {
    receivedByName: string;
    notes?: string;
  }) {
    if (!handoverTarget) return;
    setBusy(true);
    setActionError(null);
    setFeedback(null);

    try {
      const result = await handoverKitPickupRequest(handoverTarget.id, input);
      if (!result.ok) {
        if (result.reason === "UNAUTHORIZED") {
          router.replace(buildLoginUrl(RETURN_URL));
          return;
        }
        if (result.reason === "FORBIDDEN") {
          setPageState({ status: "forbidden" });
          return;
        }
        if (result.reason === "CONFLICT") {
          setActionError(CONFLICT_MESSAGE);
          setHandoverTarget(null);
          await load();
          return;
        }
        if (result.reason === "VALIDATION") {
          setActionError(result.message ?? "Dados inválidos para entrega.");
          return;
        }
        setActionError(result.message ?? "Não foi possível registrar a entrega.");
        return;
      }

      setHandoverTarget(null);
      setSelected(result.data);
      setFeedback("Entrega registrada com sucesso.");
      await load();
    } finally {
      setBusy(false);
    }
  }

  if (pageState.status === "forbidden") {
    return <KitPickupOperatorAccessDenied />;
  }

  return (
    <Layout className="kit-ops-page">
      <SiteNavbar />
      <main id="main-content" className="kit-ops-page__main">
        <div className="kit-ops-page__header">
          <h1 className="kit-ops-page__title">Operação de retirada de kits</h1>
          <p className="kit-ops-page__lead">
            Fila operacional para retirada, custódia e entrega de kits.
          </p>
        </div>

        <KitPickupOperationsFilters
          activeTab={activeTab}
          onTabChange={handleTabChange}
          registrationMode={registrationMode}
          onRegistrationModeChange={handleRegistrationModeChange}
        />

        {pageState.status === "loading" ? (
          <p role="status">Carregando fila operacional…</p>
        ) : null}

        {pageState.status === "error" ? (
          <div role="alert">
            <p>Não foi possível carregar a fila operacional.</p>
            <button type="button" onClick={() => void load()}>
              Tentar novamente
            </button>
          </div>
        ) : null}

        {pageState.status === "ready" ? (
          <>
            {pageState.items.length === 0 ? (
              <p role="status">
                Nenhuma solicitação aguardando operação nesta aba.
              </p>
            ) : (
              <div className="kit-ops-layout">
                <KitPickupOperationsQueue
                  items={pageState.items}
                  selectedId={selected?.id ?? null}
                  onSelect={setSelected}
                  onAction={(item) => void executeAction(item)}
                />
                {selected ? (
                  <KitPickupOperationDetailPanel
                    item={selected}
                    onClose={() => setSelected(null)}
                  />
                ) : null}
              </div>
            )}

            <KitPickupOperationActionBar
              item={selected}
              busy={busy}
              onAction={(item) => void executeAction(item)}
            />

            <div className="kit-ops-pagination">
              <button
                type="button"
                disabled={!pageState.meta.hasPreviousPage || busy}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </button>
              <span>
                Página {pageState.meta.page} de {pageState.meta.totalPages || 1}
              </span>
              <button
                type="button"
                disabled={!pageState.meta.hasNextPage || busy}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima
              </button>
            </div>
          </>
        ) : null}

        {feedback ? (
          <p className="kit-ops-feedback" role="status">
            {feedback}
          </p>
        ) : null}
        {actionError ? (
          <p className="kit-ops-error" role="alert">
            {actionError}
          </p>
        ) : null}
      </main>
      <Footer />

      {handoverTarget ? (
        <KitPickupHandoverDialog
          busy={busy}
          onConfirm={(input) => void confirmHandover(input)}
          onDismiss={() => setHandoverTarget(null)}
        />
      ) : null}
    </Layout>
  );
}
