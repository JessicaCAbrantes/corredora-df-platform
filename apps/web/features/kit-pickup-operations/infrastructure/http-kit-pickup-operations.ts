import type {
  HandoverInput,
  OperationalActionResult,
  OperationalPaymentStatus,
  OperationalRequestItem,
  OperationalRequestStatus,
  OperationsListParams,
  OperationsListResult,
} from "../types/kit-pickup-operations";

type ApiErrorBody = {
  error?: { code?: string; message?: string; status?: number };
};

function getDefaultBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL ?? "";
  return raw.replace(/\/$/, "");
}

function isStatus(value: unknown): value is OperationalRequestStatus {
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

function isPaymentStatus(value: unknown): value is OperationalPaymentStatus {
  return (
    value === "UNPAID" ||
    value === "PENDING" ||
    value === "PAID" ||
    value === "WAIVED" ||
    value === "FAILED"
  );
}

export function mapOperationalRequestItem(
  raw: unknown,
): OperationalRequestItem | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const event = row.event as Record<string, unknown> | undefined;
  const service = row.service as Record<string, unknown> | undefined;
  const participantRaw = row.participant;

  if (typeof row.id !== "string") return null;
  if (!isStatus(row.status)) return null;
  if (typeof row.statusLabel !== "string") return null;
  if (row.registrationMode !== "internal" && row.registrationMode !== "external") {
    return null;
  }
  if (row.registrationId !== null && typeof row.registrationId !== "string") {
    return null;
  }
  if (!isPaymentStatus(row.paymentStatus)) return null;
  if (
    row.feeAmountSnapshot !== null &&
    typeof row.feeAmountSnapshot !== "string"
  ) {
    return null;
  }
  if (
    row.feeCurrencySnapshot !== null &&
    typeof row.feeCurrencySnapshot !== "string"
  ) {
    return null;
  }
  if (row.termAcceptedAt !== null && typeof row.termAcceptedAt !== "string") {
    return null;
  }
  if (!event || typeof event.id !== "string") return null;
  if (typeof event.name !== "string" || typeof event.slug !== "string") {
    return null;
  }
  if (typeof event.date !== "string" || typeof event.city !== "string") {
    return null;
  }
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

  const nullableString = (value: unknown) =>
    value === null || typeof value === "string" ? value : undefined;
  const pickedUpAt = nullableString(row.pickedUpAt);
  const pickedUpBy = nullableString(row.pickedUpBy);
  const custodyAt = nullableString(row.custodyAt);
  const custodyBy = nullableString(row.custodyBy);
  const readyAt = nullableString(row.readyAt);
  const readyBy = nullableString(row.readyBy);
  const deliveredAt = nullableString(row.deliveredAt);
  const deliveredBy = nullableString(row.deliveredBy);
  const receivedByName = nullableString(row.receivedByName);
  const handoverNotes = nullableString(row.handoverNotes);
  if (
    pickedUpAt === undefined ||
    pickedUpBy === undefined ||
    custodyAt === undefined ||
    custodyBy === undefined ||
    readyAt === undefined ||
    readyBy === undefined ||
    deliveredAt === undefined ||
    deliveredBy === undefined ||
    receivedByName === undefined ||
    handoverNotes === undefined
  ) {
    return null;
  }
  if (typeof row.createdAt !== "string" || typeof row.updatedAt !== "string") {
    return null;
  }

  let participant: OperationalRequestItem["participant"] = null;
  if (participantRaw !== null && participantRaw !== undefined) {
    if (typeof participantRaw !== "object") return null;
    const p = participantRaw as Record<string, unknown>;
    if (typeof p.fullName !== "string") return null;
    if (p.email !== null && typeof p.email !== "string") return null;
    if (p.phone !== null && typeof p.phone !== "string") return null;
    if (
      p.externalRegistrationCode !== null &&
      typeof p.externalRegistrationCode !== "string"
    ) {
      return null;
    }
    participant = {
      fullName: p.fullName,
      email: p.email,
      phone: p.phone,
      externalRegistrationCode: p.externalRegistrationCode,
    };
  }

  return {
    id: row.id,
    status: row.status,
    statusLabel: row.statusLabel,
    registrationMode: row.registrationMode,
    registrationId: row.registrationId,
    feeAmountSnapshot: row.feeAmountSnapshot,
    feeCurrencySnapshot: row.feeCurrencySnapshot,
    paymentStatus: row.paymentStatus,
    termAcceptedAt: row.termAcceptedAt,
    event: {
      id: event.id,
      name: event.name,
      slug: event.slug,
      date: event.date,
      city: event.city,
    },
    service: { id: service.id, title: service.title, pickupLabel },
    participant,
    pickedUpAt,
    pickedUpBy,
    custodyAt,
    custodyBy,
    readyAt,
    readyBy,
    deliveredAt,
    deliveredBy,
    receivedByName,
    handoverNotes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapActionError(
  status: number,
  body: ApiErrorBody,
): Extract<OperationalActionResult, { ok: false }> {
  const code = body.error?.code;
  if (status === 401 || code === "UNAUTHORIZED") {
    return { ok: false, reason: "UNAUTHORIZED", code, message: body.error?.message };
  }
  if (status === 403 || code === "FORBIDDEN") {
    return { ok: false, reason: "FORBIDDEN", code, message: body.error?.message };
  }
  if (status === 404 || code === "NOT_FOUND") {
    return { ok: false, reason: "NOT_FOUND", code, message: body.error?.message };
  }
  if (status === 409) {
    return { ok: false, reason: "CONFLICT", code, message: body.error?.message };
  }
  if (status === 400) {
    return { ok: false, reason: "VALIDATION", code, message: body.error?.message };
  }
  return { ok: false, reason: "UNKNOWN", code, message: body.error?.message };
}

async function parseJson(response: Response): Promise<ApiErrorBody & { data?: unknown; meta?: unknown }> {
  try {
    return (await response.json()) as ApiErrorBody & {
      data?: unknown;
      meta?: unknown;
    };
  } catch {
    return {};
  }
}

function buildQuery(params: OperationsListParams): string {
  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);
  if (params.eventId) search.set("eventId", params.eventId);
  if (params.registrationMode) {
    search.set("registrationMode", params.registrationMode);
  }
  if (params.page) search.set("page", String(params.page));
  if (params.perPage) search.set("perPage", String(params.perPage));
  if (params.sort) search.set("sort", params.sort);
  if (params.order) search.set("order", params.order);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export type HttpKitPickupOperationsOptions = {
  baseUrl?: string;
  fetchFn?: typeof fetch;
};

export function createHttpGetKitPickupOperations(
  options: HttpKitPickupOperationsOptions = {},
) {
  const baseUrl = options.baseUrl ?? getDefaultBaseUrl();
  const fetchFn = options.fetchFn ?? fetch;

  return async function getKitPickupOperations(
    params: OperationsListParams = {},
  ): Promise<OperationsListResult> {
    try {
      const response = await fetchFn(
        `${baseUrl}/api/v1/kit-pickup-requests/operations${buildQuery(params)}`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
          credentials: "include",
        },
      );
      const body = await parseJson(response);
      if (!response.ok) {
        if (response.status === 401) {
          return { ok: false, reason: "UNAUTHORIZED", message: body.error?.message };
        }
        if (response.status === 403) {
          return { ok: false, reason: "FORBIDDEN", message: body.error?.message };
        }
        return { ok: false, reason: "UNKNOWN", message: body.error?.message };
      }
      if (!Array.isArray(body.data) || !body.meta || typeof body.meta !== "object") {
        return { ok: false, reason: "UNKNOWN" };
      }
      const meta = body.meta as Record<string, unknown>;
      const data = body.data
        .map((row) => mapOperationalRequestItem(row))
        .filter((row): row is OperationalRequestItem => row !== null);
      return {
        ok: true,
        data,
        meta: {
          page: Number(meta.page),
          perPage: Number(meta.perPage),
          total: Number(meta.total),
          totalPages: Number(meta.totalPages),
          hasNextPage: Boolean(meta.hasNextPage),
          hasPreviousPage: Boolean(meta.hasPreviousPage),
        },
      };
    } catch {
      return { ok: false, reason: "NETWORK" };
    }
  };
}

function createTransitionRequest(
  path: string,
  options: HttpKitPickupOperationsOptions,
  body?: unknown,
) {
  const baseUrl = options.baseUrl ?? getDefaultBaseUrl();
  const fetchFn = options.fetchFn ?? fetch;

  return async function transition(id: string): Promise<OperationalActionResult> {
    try {
      const response = await fetchFn(
        `${baseUrl}/api/v1/kit-pickup-requests/${encodeURIComponent(id)}${path}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
          },
          credentials: "include",
          ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
        },
      );
      const parsed = await parseJson(response);
      if (!response.ok) {
        return mapActionError(response.status, parsed);
      }
      const data = mapOperationalRequestItem(parsed.data);
      if (!data) return { ok: false, reason: "UNKNOWN" };
      return { ok: true, data };
    } catch {
      return { ok: false, reason: "NETWORK" };
    }
  };
}

export function createHttpPickupKitPickupRequest(
  options: HttpKitPickupOperationsOptions = {},
) {
  return createTransitionRequest("/pickup", options);
}

export function createHttpTakeKitPickupIntoCustody(
  options: HttpKitPickupOperationsOptions = {},
) {
  return createTransitionRequest("/take-into-custody", options);
}

export function createHttpMarkKitPickupReady(
  options: HttpKitPickupOperationsOptions = {},
) {
  return createTransitionRequest("/ready", options);
}

export function createHttpHandoverKitPickupRequest(
  options: HttpKitPickupOperationsOptions = {},
) {
  const baseUrl = options.baseUrl ?? getDefaultBaseUrl();
  const fetchFn = options.fetchFn ?? fetch;

  return async function handover(
    id: string,
    input: HandoverInput,
  ): Promise<OperationalActionResult> {
    try {
      const response = await fetchFn(
        `${baseUrl}/api/v1/kit-pickup-requests/${encodeURIComponent(id)}/handover`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            receivedByName: input.receivedByName,
            ...(input.notes !== undefined ? { notes: input.notes } : {}),
          }),
        },
      );
      const parsed = await parseJson(response);
      if (!response.ok) {
        return mapActionError(response.status, parsed);
      }
      const data = mapOperationalRequestItem(parsed.data);
      if (!data) return { ok: false, reason: "UNKNOWN" };
      return { ok: true, data };
    } catch {
      return { ok: false, reason: "NETWORK" };
    }
  };
}
