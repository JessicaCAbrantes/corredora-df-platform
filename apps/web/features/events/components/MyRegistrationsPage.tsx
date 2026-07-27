"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Footer } from "../../../../../packages/ui/src/components/Footer";
import { Layout } from "../../../../../packages/ui/src/components/Layout";
import { SiteNavbar } from "../../auth/components/SiteNavbar";
import { buildLoginUrl } from "../auth/build-login-url";
import { createHttpCancelEventRegistration } from "../infrastructure/http-cancel-event-registration";
import {
  createHttpGetMyRegistrations,
  type MyRegistrationItem,
} from "../infrastructure/http-get-my-registrations";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; items: MyRegistrationItem[] }
  | { status: "error" };

const MY_REGISTRATIONS_RETURN_URL = "/minhas-inscricoes";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function statusLabel(status: MyRegistrationItem["event"]["status"]): string {
  switch (status) {
    case "active":
      return "Ativo";
    case "cancelled":
      return "Cancelado";
    case "completed":
      return "Encerrado";
    default:
      return status;
  }
}

/**
 * My Registrations — list + cancel action (US-EVT-04).
 * Anonymous / 401 → login with returnUrl=/minhas-inscricoes.
 */
export function MyRegistrationsPage() {
  const router = useRouter();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancellingEventId, setCancellingEventId] = useState<string | null>(
    null,
  );
  const [getMyRegistrations] = useState(() => createHttpGetMyRegistrations());
  const [cancelRegistration] = useState(() =>
    createHttpCancelEventRegistration(),
  );

  async function loadRegistrations(): Promise<void> {
    const result = await getMyRegistrations();

    if (!result.ok) {
      if (result.reason === "UNAUTHORIZED") {
        router.replace(buildLoginUrl(MY_REGISTRATIONS_RETURN_URL));
        return;
      }
      setState({ status: "error" });
      return;
    }

    setState({ status: "ready", items: result.data });
  }

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const result = await getMyRegistrations();
      if (cancelled) return;

      if (!result.ok) {
        if (result.reason === "UNAUTHORIZED") {
          router.replace(buildLoginUrl(MY_REGISTRATIONS_RETURN_URL));
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
  }, [getMyRegistrations, router]);

  async function handleCancel(item: MyRegistrationItem): Promise<void> {
    const confirmed = window.confirm(
      `Cancelar inscrição em “${item.event.name}”? Esta ação não pode ser desfeita.`,
    );
    if (!confirmed) return;

    setCancelError(null);
    setCancellingEventId(item.event.id);

    const result = await cancelRegistration(item.event.id);
    setCancellingEventId(null);

    if (!result.ok) {
      if (result.reason === "UNAUTHORIZED") {
        router.replace(buildLoginUrl(MY_REGISTRATIONS_RETURN_URL));
        return;
      }
      setCancelError(
        "Não foi possível cancelar a inscrição. Tente novamente.",
      );
      return;
    }

    await loadRegistrations();
  }

  return (
    <Layout className="my-registrations-page">
      <SiteNavbar activeItemId="minhas-inscricoes" />
      <main id="main-content" className="my-registrations-page__main">
        {state.status === "loading" ? (
          <p className="my-registrations-page__status" role="status">
            Carregando suas inscrições…
          </p>
        ) : null}

        {state.status === "error" ? (
          <div className="my-registrations-page__panel" role="alert">
            <h1 className="my-registrations-page__title">Minhas inscrições</h1>
            <p className="my-registrations-page__error">
              Não foi possível carregar suas inscrições. Tente novamente.
            </p>
          </div>
        ) : null}

        {state.status === "ready" && state.items.length === 0 ? (
          <div className="my-registrations-page__panel">
            <h1 className="my-registrations-page__title">Minhas inscrições</h1>
            <p className="my-registrations-page__empty-lead">
              Você ainda não possui inscrições.
            </p>
            <p className="my-registrations-page__empty-copy">
              Encontre sua próxima corrida e participe do desafio.
            </p>
            <Link href="/corridas" className="my-registrations-page__cta">
              Ver corridas
            </Link>
          </div>
        ) : null}

        {state.status === "ready" && state.items.length > 0 ? (
          <div className="my-registrations-page__panel">
            <h1 className="my-registrations-page__title">Minhas inscrições</h1>
            <p className="my-registrations-page__subtitle">
              Suas inscrições. Você pode cancelar a qualquer momento.
            </p>

            {cancelError ? (
              <p className="my-registrations-page__error" role="alert">
                {cancelError}
              </p>
            ) : null}

            <ul className="my-registrations-page__list">
              {state.items.map((item) => (
                <li key={item.registrationId} className="my-registrations-page__item">
                  <div className="my-registrations-page__card">
                    <Link
                      href={`/corridas/${item.event.slug}`}
                      className="my-registrations-page__link"
                    >
                      {item.event.coverImage ? (
                        // Framework-agnostic img; same pattern as EventHero.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.event.coverImage}
                          alt=""
                          width={120}
                          height={80}
                          className="my-registrations-page__image"
                        />
                      ) : null}
                      <span className="my-registrations-page__body">
                        <span className="my-registrations-page__event-name">
                          {item.event.name}
                        </span>
                        <span className="my-registrations-page__meta">
                          {formatDate(item.event.date)} · {item.event.city} ·{" "}
                          {item.event.distance}
                        </span>
                        <span className="my-registrations-page__meta">
                          Status: {statusLabel(item.event.status)}
                        </span>
                        <span className="my-registrations-page__meta">
                          Inscrito em {formatDate(item.registeredAt)}
                        </span>
                      </span>
                    </Link>
                    <button
                      type="button"
                      className="my-registrations-page__cancel"
                      disabled={cancellingEventId === item.event.id}
                      onClick={() => {
                        void handleCancel(item);
                      }}
                    >
                      {cancellingEventId === item.event.id
                        ? "Cancelando…"
                        : "Cancelar inscrição"}
                    </button>
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
