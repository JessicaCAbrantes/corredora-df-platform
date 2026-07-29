import type {
  Event,
  KitPickupRequest,
  KitPickupRequestStatus,
  KitPickupService,
  ParticipantSnapshot,
  PickupTermAcceptance,
  Prisma,
} from "@prisma/client";
import { buildPickupLabel } from "../kit-pickup-services/kit-pickup-services.mapper";
import type { OperationalRequestDto } from "./kit-pickup-operations.types";

export type OperationalRequestRow = KitPickupRequest & {
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

function fee(value: Prisma.Decimal | null | undefined): string | null {
  if (value == null) return null;
  return value.toFixed(2);
}

function iso(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null;
}

export function toOperationalRequestDto(
  row: OperationalRequestRow,
): OperationalRequestDto {
  const mode = row.kitPickupService.event.registrationMode;
  const participant = row.participant
    ? {
        fullName: row.participant.fullName,
        email: row.participant.email,
        phone: row.participant.phone,
        externalRegistrationCode: row.participant.externalRegistrationCode,
      }
    : null;

  return {
    id: row.id,
    status: row.status,
    statusLabel: STATUS_LABELS[row.status],
    registrationMode: mode,
    registrationId: row.registrationId,
    feeAmountSnapshot: fee(row.feeAmountSnapshot),
    feeCurrencySnapshot: row.feeCurrencySnapshot,
    paymentStatus: row.paymentStatus,
    termAcceptedAt: iso(row.termAcceptance?.acceptedAt),
    event: {
      id: row.kitPickupService.event.id,
      name: row.kitPickupService.event.name,
      slug: row.kitPickupService.event.slug,
      date: row.kitPickupService.event.date.toISOString(),
      city: row.kitPickupService.event.city,
    },
    service: {
      id: row.kitPickupService.id,
      title: row.kitPickupService.title,
      pickupLabel: buildPickupLabel(row.kitPickupService),
    },
    participant,
    pickedUpAt: iso(row.pickedUpAt),
    pickedUpBy: row.pickedUpBy,
    custodyAt: iso(row.custodyAt),
    custodyBy: row.custodyBy,
    readyAt: iso(row.readyAt),
    readyBy: row.readyBy,
    deliveredAt: iso(row.deliveredAt),
    deliveredBy: row.deliveredBy,
    receivedByName: row.receivedByName,
    handoverNotes: row.handoverNotes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
