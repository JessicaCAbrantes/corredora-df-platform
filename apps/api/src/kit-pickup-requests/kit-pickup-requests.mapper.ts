import type {
  Event,
  KitPickupPaymentStatus,
  KitPickupRequest,
  KitPickupRequestStatus,
  KitPickupService,
  ParticipantSnapshot,
  PickupTermAcceptance,
  Prisma,
} from "@prisma/client";
import {
  KIT_PICKUP_TERM_TEXT,
  KIT_PICKUP_TERM_VERSION,
  hashKitPickupTerm,
} from "./kit-pickup-term";
import { buildPickupLabel } from "../kit-pickup-services/kit-pickup-services.mapper";
import type {
  CurrentTermResponse,
  KitPickupRequestDto,
} from "./kit-pickup-requests.types";

type RequestRow = KitPickupRequest & {
  kitPickupService: KitPickupService & { event: Event };
  participant: ParticipantSnapshot | null;
  termAcceptance: PickupTermAcceptance | null;
};

const STATUS_LABELS: Record<KitPickupRequestStatus, string> = {
  TERM_PENDING: "Aguardando aceite do termo",
  TERM_ACCEPTED: "Termo aceito",
  PAYMENT_PENDING: "Aguardando pagamento",
  PAID: "Pagamento confirmado",
  WAIVED: "Taxa dispensada",
  PICKUP_PENDING: "Aguardando retirada",
  PICKED_UP: "Kit retirado",
  IN_CUSTODY: "Em custódia",
  READY_FOR_HANDOVER: "Pronto para entrega",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelada",
};

const PAYMENT_STATUS_LABELS: Record<KitPickupPaymentStatus, string> = {
  UNPAID: "Aguardando pagamento",
  PENDING: "Pagamento pendente",
  PAID: "Pagamento confirmado",
  WAIVED: "Taxa dispensada",
  FAILED: "Pagamento não confirmado",
};

export function formatFeeAmount(
  value: Prisma.Decimal | null | undefined,
): string | null {
  if (value == null) return null;
  return value.toFixed(2);
}

function buildHandover(
  row: RequestRow,
): KitPickupRequestDto["handover"] {
  if (
    row.status !== "DELIVERED" ||
    !row.receivedByName?.trim() ||
    !row.deliveredAt
  ) {
    return null;
  }
  return {
    receivedByName: row.receivedByName.trim(),
    notes: row.handoverNotes?.trim() || null,
    deliveredAt: row.deliveredAt.toISOString(),
  };
}

export function toKitPickupRequestDto(row: RequestRow): KitPickupRequestDto {
  const mode = row.kitPickupService.event.registrationMode;
  return {
    id: row.id,
    status: row.status,
    statusLabel: STATUS_LABELS[row.status],
    paymentStatus: row.paymentStatus,
    paymentStatusLabel: PAYMENT_STATUS_LABELS[row.paymentStatus],
    registrationMode: mode,
    feeAmount: formatFeeAmount(row.feeAmountSnapshot),
    feeCurrency: row.feeCurrencySnapshot,
    event: {
      id: row.kitPickupService.event.id,
      name: row.kitPickupService.event.name,
      slug: row.kitPickupService.event.slug,
    },
    service: {
      id: row.kitPickupService.id,
      title: row.kitPickupService.title,
      pickupLabel: buildPickupLabel(row.kitPickupService),
    },
    registrationId: row.registrationId,
    participant: row.participant
      ? {
          fullName: row.participant.fullName,
          email: row.participant.email,
          phone: row.participant.phone,
          externalRegistrationCode: row.participant.externalRegistrationCode,
        }
      : null,
    term: {
      version: row.termAcceptance?.version ?? KIT_PICKUP_TERM_VERSION,
      accepted: Boolean(row.termAcceptance),
      acceptedAt: row.termAcceptance?.acceptedAt.toISOString() ?? null,
    },
    timeline: {
      pickedUpAt: row.pickedUpAt?.toISOString() ?? null,
      custodyAt: row.custodyAt?.toISOString() ?? null,
      readyAt: row.readyAt?.toISOString() ?? null,
      deliveredAt: row.deliveredAt?.toISOString() ?? null,
    },
    handover: buildHandover(row),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toCurrentTermResponse(): CurrentTermResponse {
  return {
    data: {
      version: KIT_PICKUP_TERM_VERSION,
      content: KIT_PICKUP_TERM_TEXT,
      contentHash: hashKitPickupTerm(),
    },
  };
}

export function isActiveRequestStatus(status: KitPickupRequestStatus): boolean {
  return status !== "CANCELLED";
}

export function paymentStatusLabel(status: KitPickupPaymentStatus): string {
  return PAYMENT_STATUS_LABELS[status];
}
