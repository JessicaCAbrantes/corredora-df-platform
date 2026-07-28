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
  CANCELLED: "Cancelada",
};

export function formatFeeAmount(
  value: Prisma.Decimal | null | undefined,
): string | null {
  if (value == null) return null;
  return value.toFixed(2);
}

export function toKitPickupRequestDto(row: RequestRow): KitPickupRequestDto {
  const mode = row.kitPickupService.event.registrationMode;
  return {
    id: row.id,
    status: row.status,
    statusLabel: STATUS_LABELS[row.status],
    paymentStatus: row.paymentStatus,
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
  return status;
}
