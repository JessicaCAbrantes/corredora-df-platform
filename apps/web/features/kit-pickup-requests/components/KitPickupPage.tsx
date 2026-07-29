"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Footer } from "../../../../../packages/ui/src/components/Footer";
import { Layout } from "../../../../../packages/ui/src/components/Layout";
import { SiteNavbar } from "../../auth/components/SiteNavbar";
import { buildLoginUrl } from "../../events/auth/build-login-url";
import {
  createHttpGetMyRegistrations,
  type MyRegistrationItem,
} from "../../events/infrastructure/http-get-my-registrations";
import { createHttpGetKitPickupServices } from "../../kit-pickup-services/infrastructure/http-get-kit-pickup-services";
import type { KitPickupServiceListItem } from "../../kit-pickup-services/types/kit-pickup-services-list";
import {
  createKitPickupRequest,
  getMyKitPickupRequests,
} from "../services";
import type { KitPickupRequestItem } from "../types";
import { KitPickupRequestCard } from "./KitPickupRequestCard";

type CatalogState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; services: KitPickupServiceListItem[] };

type RequestsState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "unauthorized" }
  | { status: "ready"; items: KitPickupRequestItem[] };

const RETURN_URL = "/kit-pickup";

/**
 * Minimal participant UI — catalog + create request + link to own requests.
 */
export function KitPickupPage() {
  const router = useRouter();
  const [catalog, setCatalog] = useState<CatalogState>({ status: "loading" });
  const [mine, setMine] = useState<RequestsState>({ status: "loading" });
  const [registrations, setRegistrations] = useState<MyRegistrationItem[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [registrationId, setRegistrationId] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [externalCode, setExternalCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const getServices = useMemo(() => createHttpGetKitPickupServices(), []);
  const getRegistrations = useMemo(() => createHttpGetMyRegistrations(), []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await getServices({
        page: 1,
        perPage: 20,
        serviceAvailable: true,
        sort: "pickupStartAt",
        order: "asc",
      });
      if (cancelled) return;
      if (result.status === "error") {
        setCatalog({ status: "error" });
        return;
      }
      setCatalog({ status: "ready", services: result.services });
      if (result.services[0]) {
        setSelectedServiceId(result.services[0].id);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getServices]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [requestsResult, regsResult] = await Promise.all([
        getMyKitPickupRequests(),
        getRegistrations(),
      ]);
      if (cancelled) return;

      if (!requestsResult.ok) {
        if (requestsResult.reason === "UNAUTHORIZED") {
          setMine({ status: "unauthorized" });
        } else {
          setMine({ status: "error" });
        }
      } else {
        setMine({ status: "ready", items: requestsResult.data });
      }

      if (regsResult.ok) {
        setRegistrations(regsResult.data);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getRegistrations]);

  const selectedService =
    catalog.status === "ready"
      ? catalog.services.find((s) => s.id === selectedServiceId)
      : undefined;

  const eventScopedRegistrations = useMemo(() => {
    if (!selectedService) return [];
    return registrations.filter((r) => r.event.id === selectedService.event.id);
  }, [registrations, selectedService]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (mine.status === "unauthorized") {
      router.replace(buildLoginUrl(RETURN_URL));
      return;
    }

    if (!selectedService) {
      setFormError("Selecione um serviço.");
      return;
    }

    setSubmitting(true);
    try {
      const result =
        selectedService.registrationMode === "internal"
          ? await createKitPickupRequest({
              kitPickupServiceId: selectedService.id,
              registrationId,
            })
          : await createKitPickupRequest({
              kitPickupServiceId: selectedService.id,
              participant: {
                fullName,
                email,
                phone,
                externalRegistrationCode: externalCode,
              },
            });

      if (!result.ok) {
        if (result.reason === "UNAUTHORIZED") {
          router.replace(buildLoginUrl(RETURN_URL));
          return;
        }
        setFormError(result.message ?? "Não foi possível criar a solicitação.");
        return;
      }

      router.push(`/kit-pickup-requests/${result.data.id}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout className="kit-pickup-page">
      <SiteNavbar />
      <main id="main-content" className="kit-pickup-page__main">
        <div className="kit-pickup-page__panel">
          <h1 className="kit-pickup-page__title">Retirada de kit</h1>
          <p className="kit-pickup-page__lead">
            Solicite o serviço de retirada oferecido pela Corredora DF. A rota{" "}
            <Link href="/kits">/kits</Link> continua sendo My Kits.
          </p>

          {catalog.status === "loading" ? (
            <p role="status">Carregando serviços…</p>
          ) : null}
          {catalog.status === "error" ? (
            <p role="alert">Não foi possível carregar os serviços.</p>
          ) : null}

          {catalog.status === "ready" && catalog.services.length === 0 ? (
            <p>Nenhum serviço disponível no momento.</p>
          ) : null}

          {catalog.status === "ready" && catalog.services.length > 0 ? (
            <form className="kit-pickup-page__form" onSubmit={onSubmit}>
              <label className="kit-pickup-page__field">
                <span>Serviço</span>
                <select
                  value={selectedServiceId}
                  onChange={(e) => {
                    setSelectedServiceId(e.target.value);
                    setRegistrationId("");
                  }}
                  required
                >
                  {catalog.services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.title} — {service.eventName}
                      {service.feeAmount
                        ? ` (${service.feeAmount} ${service.feeCurrency})`
                        : " (sem taxa)"}
                    </option>
                  ))}
                </select>
              </label>

              {selectedService?.registrationMode === "internal" ? (
                <label className="kit-pickup-page__field">
                  <span>Sua inscrição</span>
                  <select
                    value={registrationId}
                    onChange={(e) => setRegistrationId(e.target.value)}
                    required
                  >
                    <option value="">Selecione</option>
                    {eventScopedRegistrations.map((reg) => (
                      <option key={reg.registrationId} value={reg.registrationId}>
                        {reg.event.name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              {selectedService?.registrationMode === "external" ? (
                <>
                  <p className="kit-pickup-detail__disclaimer">
                    Você não está se inscrevendo nesta corrida. A Corredora DF
                    apenas realizará a retirada do seu kit junto à organização do
                    evento e fará a entrega conforme as condições do serviço.
                  </p>
                  <label className="kit-pickup-page__field">
                    <span>Nome completo</span>
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      minLength={2}
                    />
                  </label>
                  <label className="kit-pickup-page__field">
                    <span>E-mail</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </label>
                  <label className="kit-pickup-page__field">
                    <span>Telefone</span>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      minLength={8}
                    />
                  </label>
                  <label className="kit-pickup-page__field">
                    <span>Código da inscrição externa</span>
                    <input
                      value={externalCode}
                      onChange={(e) => setExternalCode(e.target.value)}
                      required
                      minLength={2}
                    />
                  </label>
                </>
              ) : null}

              {formError ? (
                <p className="kit-pickup-page__error" role="alert">
                  {formError}
                </p>
              ) : null}

              {mine.status === "unauthorized" ? (
                <p>
                  <Link href={buildLoginUrl(RETURN_URL)}>Entre na sua conta</Link>{" "}
                  para solicitar a retirada.
                </p>
              ) : (
                <button type="submit" disabled={submitting}>
                  {submitting ? "Enviando…" : "Criar solicitação"}
                </button>
              )}
            </form>
          ) : null}

          <section className="kit-pickup-page__mine">
            <h2>Minhas solicitações</h2>
            {mine.status === "loading" ? <p role="status">Carregando…</p> : null}
            {mine.status === "error" ? (
              <p role="alert">Não foi possível carregar suas solicitações.</p>
            ) : null}
            {mine.status === "unauthorized" ? (
              <p>
                <Link href={buildLoginUrl(RETURN_URL)}>Entre na sua conta</Link>{" "}
                para ver suas solicitações.
              </p>
            ) : null}
            {mine.status === "ready" && mine.items.length === 0 ? (
              <p>Você ainda não possui solicitações.</p>
            ) : null}
            {mine.status === "ready" && mine.items.length > 0 ? (
              <div className="kit-pickup-card-grid">
                {mine.items.slice(0, 3).map((item) => (
                  <KitPickupRequestCard key={item.id} item={item} />
                ))}
              </div>
            ) : null}
            <p>
              <Link href="/kit-pickup-requests">Ver todas</Link>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </Layout>
  );
}
