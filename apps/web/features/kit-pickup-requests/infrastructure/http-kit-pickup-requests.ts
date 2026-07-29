import type {
  CreateKitPickupRequestInput,
  CurrentTermResult,
  KitPickupPaymentStatus,
  KitPickupRequestHandover,
  KitPickupRequestItem,
  KitPickupRequestListResult,
  KitPickupRequestResult,
  KitPickupRequestStatus,
  KitPickupRequestTimeline,
  ParticipantSnapshot,
  StartPaymentResult,
} from "../types/kit-pickup-request";

type ApiErrorBody = {
  error?: { code?: string; message?: string; status?: number };
};

function getDefaultBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL ?? "";
  return raw.replace(/\/$/, "");
}

function isStatus(value: unknown): value is KitPickupRequestStatus {
  return (
    value === "TERM_PENDING" ||
    value === "TERM_ACCEPTED" ||
    value === "PAYMENT_PENDING" ||
    value === "PAID" ||
    value === "WAIVED" ||
    value === "PICKUP_PENDING" ||
    value === "PICKED_UP" ||
    value === "IN_CUSTODY" ||
    value === "READY_FOR_HANDOVER" ||
    value === "DELIVERED" ||
    value === "CANCELLED"
  );
}

function isPaymentStatus(value: unknown): value is KitPickupPaymentStatus {
  return (
    value === "UNPAID" ||
    value === "PENDING" ||
    value === "PAID" ||
    value === "WAIVED" ||
    value === "FAILED"
  );
}

function mapParticipant(raw: unknown): ParticipantSnapshot | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  if (typeof row.fullName !== "string") return null;
  if (typeof row.email !== "string") return null;
  if (typeof row.phone !== "string") return null;
  if (typeof row.externalRegistrationCode !== "string") return null;
  return {
    fullName: row.fullName,
    email: row.email,
    phone: row.phone,
    externalRegistrationCode: row.externalRegistrationCode,
  };
}

function mapTimeline(raw: unknown): KitPickupRequestTimeline | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const nullableString = (value: unknown) =>
    value === null || typeof value === "string" ? value : undefined;
  const pickedUpAt = nullableString(row.pickedUpAt);
  const custodyAt = nullableString(row.custodyAt);
  const readyAt = nullableString(row.readyAt);
  const deliveredAt = nullableString(row.deliveredAt);
  if (
    pickedUpAt === undefined ||
    custodyAt === undefined ||
    readyAt === undefined ||
    deliveredAt === undefined
  ) {
    return null;
  }
  return { pickedUpAt, custodyAt, readyAt, deliveredAt };
}

function mapHandover(raw: unknown): KitPickupRequestHandover | null {
  if (raw === null) return null;
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  if (typeof row.receivedByName !== "string") return null;
  if (row.notes !== null && typeof row.notes !== "string") return null;
  if (typeof row.deliveredAt !== "string") return null;
  return {
    receivedByName: row.receivedByName,
    notes: row.notes,
    deliveredAt: row.deliveredAt,
  };
}

export function mapKitPickupRequestItem(
  raw: unknown,
): KitPickupRequestItem | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const event = row.event as Record<string, unknown> | undefined;
  const service = row.service as Record<string, unknown> | undefined;
  const term = row.term as Record<string, unknown> | undefined;

  if (typeof row.id !== "string") return null;
  if (!isStatus(row.status)) return null;
  if (typeof row.statusLabel !== "string") return null;
  if (!isPaymentStatus(row.paymentStatus)) return null;
  if (typeof row.paymentStatusLabel !== "string") return null;
  if (row.registrationMode !== "internal" && row.registrationMode !== "external") {
    return null;
  }
  if (row.feeAmount !== null && typeof row.feeAmount !== "string") return null;
  if (row.feeCurrency !== null && typeof row.feeCurrency !== "string") return null;
  if (!event || typeof event.id !== "string") return null;
  if (typeof event.name !== "string" || typeof event.slug !== "string") return null;
  if (!service || typeof service.id !== "string" || typeof service.title !== "string") {
    return null;
  }
  const pickupLabel =
    service.pickupLabel === null || service.pickupLabel === undefined
      ? null
      : typeof service.pickupLabel === "string"
        ? service.pickupLabel
        : undefined;
  if (pickupLabel === undefined) return null;
  if (row.registrationId !== null && typeof row.registrationId !== "string") {
    return null;
  }
  if (!term || typeof term.version !== "string" || typeof term.accepted !== "boolean") {
    return null;
  }
  if (term.acceptedAt !== null && typeof term.acceptedAt !== "string") return null;
  if (typeof row.createdAt !== "string" || typeof row.updatedAt !== "string") {
    return null;
  }

  const timeline = mapTimeline(row.timeline);
  if (!timeline) return null;

  const handover = mapHandover(row.handover);
  if (row.handover !== null && row.handover !== undefined && handover === null) {
    return null;
  }

  return {
    id: row.id,
    status: row.status,
    statusLabel: row.statusLabel,
    paymentStatus: row.paymentStatus,
    paymentStatusLabel: row.paymentStatusLabel,
    registrationMode: row.registrationMode,
    feeAmount: row.feeAmount,
    feeCurrency: row.feeCurrency,
    event: { id: event.id, name: event.name, slug: event.slug },
    service: { id: service.id, title: service.title, pickupLabel },
    registrationId: row.registrationId,
    participant: mapParticipant(row.participant),
    term: {
      version: term.version,
      accepted: term.accepted,
      acceptedAt: term.acceptedAt,
    },
    timeline,
    handover,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapErrorReason(
  status: number,
  code?: string,
): Extract<KitPickupRequestResult, { ok: false }>["reason"] {
  if (status === 401 || code === "UNAUTHORIZED") return "UNAUTHORIZED";
  if (status === 404 || code === "NOT_FOUND") return "NOT_FOUND";
  if (status === 403 || code === "REGISTRATION_FORBIDDEN") return "FORBIDDEN";
  if (status === 409) return "CONFLICT";
  if (status === 400) return "VALIDATION";
  return "UNKNOWN";
}

async function parseJson(response: Response): Promise<ApiErrorBody & { data?: unknown }> {
  try {
    return (await response.json()) as ApiErrorBody & { data?: unknown };
  } catch {
    return {};
  }
}

export type HttpKitPickupOptions = {
  baseUrl?: string;
  fetchFn?: typeof fetch;
};

export function createHttpCreateKitPickupRequest(
  options: HttpKitPickupOptions = {},
) {
  const baseUrl = options.baseUrl ?? getDefaultBaseUrl();
  const fetchFn = options.fetchFn ?? fetch;

  return async function createKitPickupRequest(
    input: CreateKitPickupRequestInput,
  ): Promise<KitPickupRequestResult> {
    try {
      const response = await fetchFn(`${baseUrl}/api/v1/kit-pickup-requests`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(input),
      });
      const body = await parseJson(response);
      if (!response.ok) {
        return {
          ok: false,
          reason: mapErrorReason(response.status, body.error?.code),
          code: body.error?.code,
          message: body.error?.message,
        };
      }
      const data = mapKitPickupRequestItem(body.data);
      if (!data) return { ok: false, reason: "UNKNOWN" };
      return { ok: true, data };
    } catch {
      return { ok: false, reason: "NETWORK" };
    }
  };
}

export function createHttpGetMyKitPickupRequests(
  options: HttpKitPickupOptions = {},
) {
  const baseUrl = options.baseUrl ?? getDefaultBaseUrl();
  const fetchFn = options.fetchFn ?? fetch;

  return async function getMyKitPickupRequests(): Promise<KitPickupRequestListResult> {
    try {
      const response = await fetchFn(`${baseUrl}/api/v1/kit-pickup-requests/me`, {
        method: "GET",
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      const body = await parseJson(response);
      if (!response.ok) {
        if (response.status === 401) return { ok: false, reason: "UNAUTHORIZED" };
        return { ok: false, reason: "UNKNOWN" };
      }
      if (!Array.isArray(body.data)) return { ok: false, reason: "UNKNOWN" };
      const data = body.data
        .map((row) => mapKitPickupRequestItem(row))
        .filter((row): row is KitPickupRequestItem => row !== null);
      return { ok: true, data };
    } catch {
      return { ok: false, reason: "NETWORK" };
    }
  };
}

export function createHttpGetKitPickupRequest(
  options: HttpKitPickupOptions = {},
) {
  const baseUrl = options.baseUrl ?? getDefaultBaseUrl();
  const fetchFn = options.fetchFn ?? fetch;

  return async function getKitPickupRequest(
    id: string,
  ): Promise<KitPickupRequestResult> {
    try {
      const response = await fetchFn(
        `${baseUrl}/api/v1/kit-pickup-requests/${encodeURIComponent(id)}`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
          credentials: "include",
        },
      );
      const body = await parseJson(response);
      if (!response.ok) {
        return {
          ok: false,
          reason: mapErrorReason(response.status, body.error?.code),
          code: body.error?.code,
          message: body.error?.message,
        };
      }
      const data = mapKitPickupRequestItem(body.data);
      if (!data) return { ok: false, reason: "UNKNOWN" };
      return { ok: true, data };
    } catch {
      return { ok: false, reason: "NETWORK" };
    }
  };
}

export function createHttpAcceptKitPickupTerm(
  options: HttpKitPickupOptions = {},
) {
  const baseUrl = options.baseUrl ?? getDefaultBaseUrl();
  const fetchFn = options.fetchFn ?? fetch;

  return async function acceptKitPickupTerm(
    id: string,
  ): Promise<KitPickupRequestResult> {
    try {
      const response = await fetchFn(
        `${baseUrl}/api/v1/kit-pickup-requests/${encodeURIComponent(id)}/accept-term`,
        {
          method: "POST",
          headers: { Accept: "application/json" },
          credentials: "include",
        },
      );
      const body = await parseJson(response);
      if (!response.ok) {
        return {
          ok: false,
          reason: mapErrorReason(response.status, body.error?.code),
          code: body.error?.code,
          message: body.error?.message,
        };
      }
      const data = mapKitPickupRequestItem(body.data);
      if (!data) return { ok: false, reason: "UNKNOWN" };
      return { ok: true, data };
    } catch {
      return { ok: false, reason: "NETWORK" };
    }
  };
}

export function createHttpCancelKitPickupRequest(
  options: HttpKitPickupOptions = {},
) {
  const baseUrl = options.baseUrl ?? getDefaultBaseUrl();
  const fetchFn = options.fetchFn ?? fetch;

  return async function cancelKitPickupRequest(
    id: string,
  ): Promise<KitPickupRequestResult> {
    try {
      const response = await fetchFn(
        `${baseUrl}/api/v1/kit-pickup-requests/${encodeURIComponent(id)}/cancel`,
        {
          method: "POST",
          headers: { Accept: "application/json" },
          credentials: "include",
        },
      );
      const body = await parseJson(response);
      if (!response.ok) {
        return {
          ok: false,
          reason: mapErrorReason(response.status, body.error?.code),
          code: body.error?.code,
          message: body.error?.message,
        };
      }
      const data = mapKitPickupRequestItem(body.data);
      if (!data) return { ok: false, reason: "UNKNOWN" };
      return { ok: true, data };
    } catch {
      return { ok: false, reason: "NETWORK" };
    }
  };
}

export function createHttpStartKitPickupPayment(
  options: HttpKitPickupOptions = {},
) {
  const baseUrl = options.baseUrl ?? getDefaultBaseUrl();
  const fetchFn = options.fetchFn ?? fetch;

  return async function startKitPickupPayment(
    id: string,
  ): Promise<StartPaymentResult> {
    try {
      const response = await fetchFn(
        `${baseUrl}/api/v1/kit-pickup-requests/${encodeURIComponent(id)}/payment`,
        {
          method: "POST",
          headers: { Accept: "application/json" },
          credentials: "include",
        },
      );
      const body = await parseJson(response);
      if (!response.ok) {
        return {
          ok: false,
          reason:
            response.status === 401
              ? "UNAUTHORIZED"
              : response.status === 404
                ? "NOT_FOUND"
                : response.status === 409
                  ? "CONFLICT"
                  : "UNKNOWN",
          code: body.error?.code,
          message: body.error?.message,
        };
      }
      const data = body.data as
        | { checkoutUrl?: string; paymentId?: string; provider?: string }
        | undefined;
      if (
        !data ||
        typeof data.checkoutUrl !== "string" ||
        typeof data.paymentId !== "string" ||
        typeof data.provider !== "string"
      ) {
        return { ok: false, reason: "UNKNOWN" };
      }
      return {
        ok: true,
        checkoutUrl: data.checkoutUrl,
        paymentId: data.paymentId,
        provider: data.provider,
      };
    } catch {
      return { ok: false, reason: "NETWORK" };
    }
  };
}

export function createHttpGetCurrentKitPickupTerm(
  options: HttpKitPickupOptions = {},
) {
  const baseUrl = options.baseUrl ?? getDefaultBaseUrl();
  const fetchFn = options.fetchFn ?? fetch;

  return async function getCurrentKitPickupTerm(): Promise<CurrentTermResult> {
    try {
      const response = await fetchFn(`${baseUrl}/api/v1/kit-pickup-requests/term`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      const body = await parseJson(response);
      if (!response.ok) return { ok: false, reason: "UNKNOWN" };
      const data = body.data as
        | { version?: string; content?: string; contentHash?: string }
        | undefined;
      if (
        !data ||
        typeof data.version !== "string" ||
        typeof data.content !== "string" ||
        typeof data.contentHash !== "string"
      ) {
        return { ok: false, reason: "UNKNOWN" };
      }
      return {
        ok: true,
        version: data.version,
        content: data.content,
        contentHash: data.contentHash,
      };
    } catch {
      return { ok: false, reason: "NETWORK" };
    }
  };
}
