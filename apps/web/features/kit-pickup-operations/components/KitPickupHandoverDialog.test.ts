import { describe, expect, it } from "vitest";
import { buildHandoverPayload } from "../utils/kit-pickup-operations-presentation";

/**
 * Handover dialog submit gate — mirrors KitPickupHandoverDialog.handleSubmit.
 * Inputs/buttons are disabled via `busy` prop in the component.
 */
function submitHandover(
  receivedByName: string,
  notes: string,
  busy: boolean,
): { submitted: boolean; error: string | null; payload?: { receivedByName: string; notes?: string } } {
  if (busy) {
    return { submitted: false, error: null };
  }
  const result = buildHandoverPayload(receivedByName, notes);
  if (!result.ok) {
    return { submitted: false, error: result.error };
  }
  return { submitted: true, error: null, payload: result.payload };
}

describe("KitPickupHandoverDialog submit behavior", () => {
  it("blocks submit when receivedByName is empty", () => {
    const result = submitHandover("", "", false);
    expect(result.submitted).toBe(false);
    expect(result.error).toBe("Informe quem recebeu o kit.");
  });

  it("submits valid receivedByName", () => {
    const result = submitHandover("Maria", "", false);
    expect(result.submitted).toBe(true);
    expect(result.payload?.receivedByName).toBe("Maria");
  });

  it("submits optional notes", () => {
    const result = submitHandover("Maria", "Observação", false);
    expect(result.submitted).toBe(true);
    expect(result.payload?.notes).toBe("Observação");
  });

  it("blocks submit while busy", () => {
    const result = submitHandover("Maria", "", true);
    expect(result.submitted).toBe(false);
    expect(result.error).toBeNull();
  });
});
