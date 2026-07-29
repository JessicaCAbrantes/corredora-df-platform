import { describe, expect, it } from "vitest";
import {
  buildKitPickupTimeline,
  formatFeeDisplay,
  getRegistrationModeLabel,
  hasConfirmedPayment,
  isKitPickupRequestCancellable,
  shouldShowPaymentStatusOnCard,
} from "./kit-pickup-request-presentation";
import type { KitPickupRequestItem } from "../types/kit-pickup-request";

function baseItem(
  overrides: Partial<KitPickupRequestItem> = {},
): KitPickupRequestItem {
  return {
    id: "kpr_01",
    status: "IN_CUSTODY",
    statusLabel: "Em custódia",
    paymentStatus: "PAID",
    paymentStatusLabel: "Pagamento confirmado",
    registrationMode: "external",
    feeAmount: "10.00",
    feeCurrency: "BRL",
    event: { id: "evt_01", name: "Corrida X", slug: "corrida-x" },
    service: {
      id: "kps_01",
      title: "Retirada de kit",
      pickupLabel: "Asa Norte · 10–12 ago",
    },
    registrationId: null,
    participant: {
      fullName: "Ana",
      email: "ana@example.com",
      phone: "61999999999",
      externalRegistrationCode: "123456",
    },
    term: {
      version: "v1",
      accepted: true,
      acceptedAt: "2026-07-27T13:00:00.000Z",
    },
    timeline: {
      pickedUpAt: "2026-07-28T10:30:00.000Z",
      custodyAt: "2026-07-28T11:00:00.000Z",
      readyAt: null,
      deliveredAt: null,
    },
    handover: null,
    createdAt: "2026-07-27T12:00:00.000Z",
    updatedAt: "2026-07-28T11:00:00.000Z",
    ...overrides,
  };
}

describe("kit-pickup-request-presentation", () => {
  it("maps registration mode to friendly labels", () => {
    expect(getRegistrationModeLabel("internal")).toBe(
      "Evento organizado pela Corredora DF",
    );
    expect(getRegistrationModeLabel("external")).toBe(
      "Evento organizado por outra empresa",
    );
  });

  it("formats fee for BRL", () => {
    expect(formatFeeDisplay("10.00", "BRL")).toBe("R$ 10,00");
    expect(formatFeeDisplay(null, "BRL")).toBe("Sem custo");
  });

  it("detects cancellable statuses", () => {
    expect(isKitPickupRequestCancellable("PICKUP_PENDING")).toBe(true);
    expect(isKitPickupRequestCancellable("PICKED_UP")).toBe(false);
  });

  it("detects confirmed payment for post-payment cancel warning", () => {
    expect(hasConfirmedPayment(baseItem())).toBe(true);
    expect(
      hasConfirmedPayment(
        baseItem({ paymentStatus: "UNPAID", status: "TERM_PENDING" }),
      ),
    ).toBe(false);
  });

  it("builds timeline with current custody step", () => {
    const steps = buildKitPickupTimeline(baseItem());
    const current = steps.find((step) => step.state === "current");
    expect(current?.id).toBe("custody");
    expect(steps.some((step) => step.label === "Kit retirado")).toBe(true);
  });

  it("builds cancelled timeline", () => {
    const steps = buildKitPickupTimeline(
      baseItem({ status: "CANCELLED", statusLabel: "Cancelada" }),
    );
    expect(steps).toHaveLength(2);
    expect(steps[1]?.label).toBe("Solicitação cancelada");
  });

  it("shows payment status on card when pending", () => {
    expect(
      shouldShowPaymentStatusOnCard(
        baseItem({ status: "PAYMENT_PENDING", paymentStatus: "PENDING" }),
      ),
    ).toBe(true);
    expect(shouldShowPaymentStatusOnCard(baseItem())).toBe(false);
  });
});
