/**
 * Kit Pickup Operations — operator dashboard types.
 */

export type OperationalRequestStatus =
  | "TERM_PENDING"
  | "TERM_ACCEPTED"
  | "PAYMENT_PENDING"
  | "PAID"
  | "WAIVED"
  | "PICKUP_PENDING"
  | "PICKED_UP"
  | "IN_CUSTODY"
  | "READY_FOR_HANDOVER"
  | "DELIVERED"
  | "CANCELLED";

export type OperationalPaymentStatus =
  | "UNPAID"
  | "PENDING"
  | "PAID"
  | "WAIVED"
  | "FAILED";

export type OperationalParticipant = {
  fullName: string;
  email: string | null;
  phone: string | null;
  externalRegistrationCode: string | null;
};

export type OperationalRequestItem = {
  id: string;
  status: OperationalRequestStatus;
  statusLabel: string;
  registrationMode: "internal" | "external";
  registrationId: string | null;
  feeAmountSnapshot: string | null;
  feeCurrencySnapshot: string | null;
  paymentStatus: OperationalPaymentStatus;
  termAcceptedAt: string | null;
  event: {
    id: string;
    name: string;
    slug: string;
    date: string;
    city: string;
  };
  service: {
    id: string;
    title: string;
    pickupLabel: string | null;
  };
  participant: OperationalParticipant | null;
  pickedUpAt: string | null;
  pickedUpBy: string | null;
  custodyAt: string | null;
  custodyBy: string | null;
  readyAt: string | null;
  readyBy: string | null;
  deliveredAt: string | null;
  deliveredBy: string | null;
  receivedByName: string | null;
  handoverNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OperationsListParams = {
  status?: OperationalRequestStatus;
  eventId?: string;
  registrationMode?: "internal" | "external";
  page?: number;
  perPage?: number;
  sort?:
    | "createdAt"
    | "updatedAt"
    | "pickedUpAt"
    | "custodyAt"
    | "readyAt"
    | "deliveredAt";
  order?: "asc" | "desc";
};

export type OperationsListMeta = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type OperationsListResult =
  | { ok: true; data: OperationalRequestItem[]; meta: OperationsListMeta }
  | {
      ok: false;
      reason: "UNAUTHORIZED" | "FORBIDDEN" | "NETWORK" | "UNKNOWN";
      message?: string;
    };

export type OperationalActionResult =
  | { ok: true; data: OperationalRequestItem }
  | {
      ok: false;
      reason:
        | "UNAUTHORIZED"
        | "FORBIDDEN"
        | "NOT_FOUND"
        | "CONFLICT"
        | "VALIDATION"
        | "NETWORK"
        | "UNKNOWN";
      code?: string;
      message?: string;
    };

export type HandoverInput = {
  receivedByName: string;
  notes?: string;
};

export type OperationalQueueTab =
  | "PICKUP_PENDING"
  | "PICKED_UP"
  | "IN_CUSTODY"
  | "READY_FOR_HANDOVER"
  | "DELIVERED";

export type OperationalAction =
  | "pickup"
  | "takeIntoCustody"
  | "ready"
  | "handover";
