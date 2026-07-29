import type {
  HandoverInput,
  OperationalAction,
  OperationalPaymentStatus,
  OperationalQueueTab,
  OperationalRequestItem,
  OperationalRequestStatus,
} from "../types/kit-pickup-operations";

export const REGISTRATION_MODE_LABELS = {
  internal: "Evento organizado pela Corredora DF",
  external: "Evento organizado por outra empresa",
} as const;

export const QUEUE_TABS: { id: OperationalQueueTab; label: string }[] = [
  { id: "PICKUP_PENDING", label: "Aguardando retirada" },
  { id: "PICKED_UP", label: "Retirado" },
  { id: "IN_CUSTODY", label: "Em custódia" },
  { id: "READY_FOR_HANDOVER", label: "Pronto para entrega" },
  { id: "DELIVERED", label: "Entregue" },
];

const PAYMENT_STATUS_LABELS: Record<OperationalPaymentStatus, string> = {
  UNPAID: "Aguardando pagamento",
  PENDING: "Pagamento pendente",
  PAID: "Pagamento confirmado",
  WAIVED: "Taxa dispensada",
  FAILED: "Pagamento não confirmado",
};

const ACTION_LABELS: Record<OperationalAction, string> = {
  pickup: "Retirar kit",
  takeIntoCustody: "Colocar em custódia",
  ready: "Marcar como pronto",
  handover: "Registrar entrega",
};

const NON_OPERATIONAL_STATUSES: OperationalRequestStatus[] = [
  "TERM_PENDING",
  "TERM_ACCEPTED",
  "PAYMENT_PENDING",
  "CANCELLED",
];

export function getRegistrationModeLabel(
  mode: OperationalRequestItem["registrationMode"],
): string {
  return REGISTRATION_MODE_LABELS[mode];
}

export function getPaymentStatusLabel(status: OperationalPaymentStatus): string {
  return PAYMENT_STATUS_LABELS[status];
}

export function getActionLabel(action: OperationalAction): string {
  return ACTION_LABELS[action];
}

export function isOperationalStatus(status: OperationalRequestStatus): boolean {
  return !NON_OPERATIONAL_STATUSES.includes(status);
}

export function getAvailableAction(
  status: OperationalRequestStatus,
): OperationalAction | null {
  switch (status) {
    case "PAID":
    case "WAIVED":
    case "PICKUP_PENDING":
      return "pickup";
    case "PICKED_UP":
      return "takeIntoCustody";
    case "IN_CUSTODY":
      return "ready";
    case "READY_FOR_HANDOVER":
      return "handover";
    default:
      return null;
  }
}

export function getQueueParticipantLabel(item: OperationalRequestItem): string {
  if (item.registrationMode === "external" && item.participant) {
    return item.participant.fullName;
  }
  if (item.registrationMode === "internal") {
    return "Inscrição vinculada";
  }
  return "—";
}

export function getQueueExternalCode(item: OperationalRequestItem): string | null {
  if (item.registrationMode === "external" && item.participant) {
    return item.participant.externalRegistrationCode;
  }
  return null;
}

export function formatOperationalDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  });
}

export function formatOperationalDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

export function formatFeeSnapshot(
  amount: string | null,
  currency: string | null,
): string {
  if (!amount) return "Sem custo";
  if (currency === "BRL") return `R$ ${amount.replace(".", ",")}`;
  return `${amount} ${currency ?? ""}`.trim();
}

export function getEmptyQueueMessage(tab: OperationalQueueTab): string {
  const messages: Record<OperationalQueueTab, string> = {
    PICKUP_PENDING: "Nenhuma solicitação aguardando retirada.",
    PICKED_UP: "Nenhuma solicitação com kit retirado.",
    IN_CUSTODY: "Nenhuma solicitação em custódia.",
    READY_FOR_HANDOVER: "Nenhuma solicitação pronta para entrega.",
    DELIVERED: "Nenhuma solicitação entregue.",
  };
  return messages[tab];
}

export function validateHandoverReceivedByName(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "Informe quem recebeu o kit.";
  return null;
}

export function buildHandoverPayload(
  receivedByName: string,
  notes: string,
): { ok: true; payload: HandoverInput } | { ok: false; error: string } {
  const validationError = validateHandoverReceivedByName(receivedByName);
  if (validationError) {
    return { ok: false, error: validationError };
  }
  return {
    ok: true,
    payload: {
      receivedByName: receivedByName.trim(),
      notes: notes.trim() || undefined,
    },
  };
}

export type OperationalTimelineStep = {
  id: string;
  label: string;
  timestamp: string | null;
  operatorId: string | null;
};

export function buildOperationalTimeline(
  item: OperationalRequestItem,
): OperationalTimelineStep[] {
  return [
    {
      id: "picked_up",
      label: "Retirada",
      timestamp: item.pickedUpAt,
      operatorId: item.pickedUpBy,
    },
    {
      id: "custody",
      label: "Custódia",
      timestamp: item.custodyAt,
      operatorId: item.custodyBy,
    },
    {
      id: "ready",
      label: "Pronto para entrega",
      timestamp: item.readyAt,
      operatorId: item.readyBy,
    },
    {
      id: "delivered",
      label: "Entregue",
      timestamp: item.deliveredAt,
      operatorId: item.deliveredBy,
    },
  ];
}

export const CONFLICT_MESSAGE =
  "Esta solicitação mudou de estado. Atualizando a fila…";
