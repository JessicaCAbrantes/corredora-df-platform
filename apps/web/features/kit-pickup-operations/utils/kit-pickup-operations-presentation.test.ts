import { describe, expect, it } from "vitest";
import type { OperationalRequestItem } from "../types/kit-pickup-operations";
import {
  buildHandoverPayload,
  buildOperationalTimeline,
  getActionLabel,
  getAvailableAction,
  getEmptyQueueMessage,
  getPaymentStatusLabel,
  getQueueExternalCode,
  getQueueParticipantLabel,
  getRegistrationModeLabel,
  isOperationalStatus,
  validateHandoverReceivedByName,
} from "./kit-pickup-operations-presentation";

function baseItem(
  overrides: Partial<OperationalRequestItem> = {},
): OperationalRequestItem {
  return {
    id: "kpr_01",
    status: "PICKUP_PENDING",
    statusLabel: "Aguardando retirada",
    registrationMode: "external",
    registrationId: null,
    feeAmountSnapshot: "10.00",
    feeCurrencySnapshot: "BRL",
    paymentStatus: "PAID",
    termAcceptedAt: "2026-07-27T13:00:00.000Z",
    event: {
      id: "evt_01",
      name: "Corrida X",
      slug: "corrida-x",
      date: "2026-08-16T10:00:00.000Z",
      city: "Brasília",
    },
    service: {
      id: "kps_01",
      title: "Retirada de kit",
      pickupLabel: "Asa Norte · 10–12 ago",
    },
    participant: {
      fullName: "Ana",
      email: "ana@example.com",
      phone: "61999999999",
      externalRegistrationCode: "EXT-1",
    },
    pickedUpAt: null,
    pickedUpBy: null,
    custodyAt: null,
    custodyBy: null,
    readyAt: null,
    readyBy: null,
    deliveredAt: null,
    deliveredBy: null,
    receivedByName: null,
    handoverNotes: null,
    createdAt: "2026-07-27T12:00:00.000Z",
    updatedAt: "2026-07-27T12:00:00.000Z",
    ...overrides,
  };
}

describe("kit-pickup-operations-presentation", () => {
  it("maps registration mode labels", () => {
    expect(getRegistrationModeLabel("internal")).toBe(
      "Evento organizado pela Corredora DF",
    );
    expect(getRegistrationModeLabel("external")).toBe(
      "Evento organizado por outra empresa",
    );
  });

  it("maps payment status labels", () => {
    expect(getPaymentStatusLabel("PAID")).toBe("Pagamento confirmado");
    expect(getPaymentStatusLabel("UNPAID")).toBe("Aguardando pagamento");
  });

  it("resolves available actions by status", () => {
    expect(getAvailableAction("PICKUP_PENDING")).toBe("pickup");
    expect(getAvailableAction("PAID")).toBe("pickup");
    expect(getAvailableAction("WAIVED")).toBe("pickup");
    expect(getAvailableAction("PICKED_UP")).toBe("takeIntoCustody");
    expect(getAvailableAction("IN_CUSTODY")).toBe("ready");
    expect(getAvailableAction("READY_FOR_HANDOVER")).toBe("handover");
    expect(getAvailableAction("DELIVERED")).toBeNull();
    expect(getAvailableAction("TERM_PENDING")).toBeNull();
  });

  it("maps action labels", () => {
    expect(getActionLabel("pickup")).toBe("Retirar kit");
    expect(getActionLabel("handover")).toBe("Registrar entrega");
  });

  it("detects non-operational statuses", () => {
    expect(isOperationalStatus("PICKUP_PENDING")).toBe(true);
    expect(isOperationalStatus("TERM_PENDING")).toBe(false);
    expect(isOperationalStatus("CANCELLED")).toBe(false);
  });

  it("formats queue participant labels for internal/external", () => {
    expect(getQueueParticipantLabel(baseItem())).toBe("Ana");
    expect(
      getQueueParticipantLabel(
        baseItem({
          registrationMode: "internal",
          participant: null,
          registrationId: "reg_01",
        }),
      ),
    ).toBe("Inscrição vinculada");
  });

  it("shows external code only for external mode", () => {
    expect(getQueueExternalCode(baseItem())).toBe("EXT-1");
    expect(
      getQueueExternalCode(
        baseItem({ registrationMode: "internal", participant: null }),
      ),
    ).toBeNull();
  });

  it("builds operational timeline with audit fields", () => {
    const timeline = buildOperationalTimeline(
      baseItem({
        pickedUpAt: "2026-07-28T10:30:00.000Z",
        pickedUpBy: "usr_operator",
      }),
    );
    expect(timeline[0]?.timestamp).toBe("2026-07-28T10:30:00.000Z");
    expect(timeline[0]?.operatorId).toBe("usr_operator");
    expect(timeline[3]?.label).toBe("Entregue");
  });

  it("returns contextual empty queue messages", () => {
    expect(getEmptyQueueMessage("PICKUP_PENDING")).toContain("retirada");
    expect(getEmptyQueueMessage("DELIVERED")).toContain("entregue");
  });
});

describe("handover validation and payload", () => {
  it("rejects empty receivedByName", () => {
    expect(validateHandoverReceivedByName("")).toBe("Informe quem recebeu o kit.");
    expect(validateHandoverReceivedByName("   ")).toBe(
      "Informe quem recebeu o kit.",
    );
    expect(buildHandoverPayload("", "").ok).toBe(false);
  });

  it("accepts valid receivedByName with trim", () => {
    const result = buildHandoverPayload("  Maria  ", "");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.receivedByName).toBe("Maria");
      expect(result.payload.notes).toBeUndefined();
    }
  });

  it("includes optional notes when provided", () => {
    const result = buildHandoverPayload("Maria", "  Entregue no balcão  ");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.notes).toBe("Entregue no balcão");
    }
  });
});
