import type {
  KitPickupRequestItem,
  KitPickupRequestStatus,
} from "../types/kit-pickup-request";

export const REGISTRATION_MODE_LABELS = {
  internal: "Evento organizado pela Corredora DF",
  external: "Evento organizado por outra empresa",
} as const;

export const EXTERNAL_EVENT_DISCLAIMER =
  "A Corredora DF está realizando apenas o serviço de retirada e entrega do kit. A inscrição e a participação no evento são de responsabilidade do participante junto à organizadora do evento.";

export const SNAPSHOT_FROZEN_HINT =
  "Os dados desta solicitação ficam vinculados ao pedido após sua criação. Para corrigir algum dado, cancele esta solicitação e faça uma nova enquanto o cancelamento estiver disponível.";

const CANCELLABLE_STATUSES: KitPickupRequestStatus[] = [
  "TERM_PENDING",
  "TERM_ACCEPTED",
  "PAYMENT_PENDING",
  "PAID",
  "WAIVED",
  "PICKUP_PENDING",
];

const OPERATIONAL_STATUSES: KitPickupRequestStatus[] = [
  "PICKED_UP",
  "IN_CUSTODY",
  "READY_FOR_HANDOVER",
  "DELIVERED",
];

export function getRegistrationModeLabel(
  mode: KitPickupRequestItem["registrationMode"],
): string {
  return REGISTRATION_MODE_LABELS[mode];
}

export function isKitPickupRequestCancellable(
  status: KitPickupRequestStatus,
): boolean {
  return CANCELLABLE_STATUSES.includes(status);
}

export function hasConfirmedPayment(item: KitPickupRequestItem): boolean {
  return (
    item.paymentStatus === "PAID" ||
    item.paymentStatus === "WAIVED" ||
    item.status === "PAID" ||
    item.status === "WAIVED" ||
    item.status === "PICKUP_PENDING" ||
    OPERATIONAL_STATUSES.includes(item.status)
  );
}

export function formatKitPickupDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  });
}

export function formatKitPickupDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

export function formatFeeDisplay(
  feeAmount: string | null,
  feeCurrency: string | null,
): string {
  if (!feeAmount) return "Sem custo";
  const currency = feeCurrency ?? "BRL";
  if (currency === "BRL") {
    return `R$ ${feeAmount.replace(".", ",")}`;
  }
  return `${feeAmount} ${currency}`;
}

export type TimelineStepState = "completed" | "current" | "upcoming" | "skipped";

export type TimelineStep = {
  id: string;
  label: string;
  state: TimelineStepState;
  timestamp: string | null;
};

const STATUS_ORDER: KitPickupRequestStatus[] = [
  "TERM_PENDING",
  "TERM_ACCEPTED",
  "PAYMENT_PENDING",
  "PAID",
  "WAIVED",
  "PICKUP_PENDING",
  "PICKED_UP",
  "IN_CUSTODY",
  "READY_FOR_HANDOVER",
  "DELIVERED",
];

function statusRank(status: KitPickupRequestStatus): number {
  const index = STATUS_ORDER.indexOf(status);
  return index === -1 ? 0 : index;
}

function paymentStepCompleted(item: KitPickupRequestItem): boolean {
  if (!item.feeAmount) return item.term.accepted;
  return (
    item.paymentStatus === "PAID" ||
    item.paymentStatus === "WAIVED" ||
    statusRank(item.status) >= statusRank("PICKUP_PENDING")
  );
}

function paymentStepTimestamp(item: KitPickupRequestItem): string | null {
  if (!item.feeAmount && item.term.acceptedAt) return item.term.acceptedAt;
  if (item.paymentStatus === "PAID" || item.paymentStatus === "WAIVED") {
    return item.term.acceptedAt ?? item.updatedAt;
  }
  return null;
}

export function buildKitPickupTimeline(
  item: KitPickupRequestItem,
): TimelineStep[] {
  if (item.status === "CANCELLED") {
    return [
      {
        id: "created",
        label: "Solicitação criada",
        state: "completed",
        timestamp: item.createdAt,
      },
      {
        id: "cancelled",
        label: "Solicitação cancelada",
        state: "current",
        timestamp: item.updatedAt,
      },
    ];
  }

  const currentRank = statusRank(item.status);
  const steps: Omit<TimelineStep, "state">[] = [
    {
      id: "created",
      label: "Solicitação criada",
      timestamp: item.createdAt,
    },
    {
      id: "term",
      label: "Termo aceito",
      timestamp: item.term.acceptedAt,
    },
    {
      id: "payment",
      label: item.feeAmount ? "Pagamento confirmado" : "Serviço confirmado",
      timestamp: paymentStepTimestamp(item),
    },
    {
      id: "pickup_pending",
      label: "Aguardando retirada",
      timestamp:
        currentRank >= statusRank("PICKUP_PENDING") ? item.updatedAt : null,
    },
    {
      id: "picked_up",
      label: "Kit retirado",
      timestamp: item.timeline.pickedUpAt,
    },
    {
      id: "custody",
      label: "Em custódia",
      timestamp: item.timeline.custodyAt,
    },
    {
      id: "ready",
      label: "Pronto para entrega",
      timestamp: item.timeline.readyAt,
    },
    {
      id: "delivered",
      label: "Entregue",
      timestamp: item.timeline.deliveredAt,
    },
  ];

  const statusToStepId: Partial<Record<KitPickupRequestStatus, string>> = {
    TERM_PENDING: "created",
    TERM_ACCEPTED: "term",
    PAYMENT_PENDING: "payment",
    PAID: "pickup_pending",
    WAIVED: "pickup_pending",
    PICKUP_PENDING: "pickup_pending",
    PICKED_UP: "picked_up",
    IN_CUSTODY: "custody",
    READY_FOR_HANDOVER: "ready",
    DELIVERED: "delivered",
  };

  const currentStepId = statusToStepId[item.status] ?? "created";

  return steps.map((step) => {
    let completed = false;
    if (step.id === "created") completed = true;
    else if (step.id === "term") completed = item.term.accepted;
    else if (step.id === "payment") completed = paymentStepCompleted(item);
    else if (step.id === "pickup_pending")
      completed = currentRank >= statusRank("PICKUP_PENDING");
    else if (step.id === "picked_up") completed = Boolean(item.timeline.pickedUpAt);
    else if (step.id === "custody") completed = Boolean(item.timeline.custodyAt);
    else if (step.id === "ready") completed = Boolean(item.timeline.readyAt);
    else if (step.id === "delivered") completed = Boolean(item.timeline.deliveredAt);

    let state: TimelineStepState;
    if (step.id === currentStepId) {
      state = "current";
    } else if (completed) {
      state = "completed";
    } else {
      state = "upcoming";
    }

    return { ...step, state };
  });
}

export function shouldShowPaymentStatusOnCard(
  item: KitPickupRequestItem,
): boolean {
  return (
    item.status === "PAYMENT_PENDING" ||
    item.paymentStatus === "PENDING" ||
    item.paymentStatus === "FAILED" ||
    (item.feeAmount !== null && !hasConfirmedPayment(item))
  );
}

export function shouldShowSnapshotFrozenHint(
  item: KitPickupRequestItem,
): boolean {
  return (
    isKitPickupRequestCancellable(item.status) &&
    (item.participant !== null || item.registrationMode === "external")
  );
}
