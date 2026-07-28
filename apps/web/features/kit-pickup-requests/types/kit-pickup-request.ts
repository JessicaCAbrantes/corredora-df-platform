/**
 * Kit Pickup Request application types (Phase 2).
 */

export type KitPickupRequestStatus =
  | "TERM_PENDING"
  | "TERM_ACCEPTED"
  | "PAYMENT_PENDING"
  | "PAID"
  | "WAIVED"
  | "CANCELLED";

export type KitPickupPaymentStatus =
  | "UNPAID"
  | "PENDING"
  | "PAID"
  | "WAIVED"
  | "FAILED";

export type ParticipantSnapshot = {
  fullName: string;
  email: string;
  phone: string;
  externalRegistrationCode: string;
};

export type KitPickupRequestItem = {
  id: string;
  status: KitPickupRequestStatus;
  statusLabel: string;
  paymentStatus: KitPickupPaymentStatus;
  registrationMode: "internal" | "external";
  feeAmount: string | null;
  feeCurrency: string | null;
  event: { id: string; name: string; slug: string };
  service: { id: string; title: string };
  registrationId: string | null;
  participant: ParticipantSnapshot | null;
  term: {
    version: string;
    accepted: boolean;
    acceptedAt: string | null;
  };
  createdAt: string;
  updatedAt: string;
};

export type CreateKitPickupRequestInput =
  | {
      kitPickupServiceId: string;
      registrationId: string;
    }
  | {
      kitPickupServiceId: string;
      participant: ParticipantSnapshot;
    };

export type KitPickupRequestResult =
  | { ok: true; data: KitPickupRequestItem }
  | {
      ok: false;
      reason:
        | "UNAUTHORIZED"
        | "NOT_FOUND"
        | "VALIDATION"
        | "CONFLICT"
        | "FORBIDDEN"
        | "NETWORK"
        | "UNKNOWN";
      code?: string;
      message?: string;
    };

export type KitPickupRequestListResult =
  | { ok: true; data: KitPickupRequestItem[] }
  | {
      ok: false;
      reason: "UNAUTHORIZED" | "NETWORK" | "UNKNOWN";
    };

export type StartPaymentResult =
  | {
      ok: true;
      checkoutUrl: string;
      paymentId: string;
      provider: string;
    }
  | {
      ok: false;
      reason:
        | "UNAUTHORIZED"
        | "NOT_FOUND"
        | "CONFLICT"
        | "NETWORK"
        | "UNKNOWN";
      code?: string;
      message?: string;
    };

export type CurrentTermResult =
  | {
      ok: true;
      version: string;
      content: string;
      contentHash: string;
    }
  | { ok: false; reason: "NETWORK" | "UNKNOWN" };
