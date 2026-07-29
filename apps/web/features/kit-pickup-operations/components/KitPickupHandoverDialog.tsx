import { useState } from "react";
import { buildHandoverPayload } from "../utils/kit-pickup-operations-presentation";

type Props = {
  busy: boolean;
  onConfirm: (input: { receivedByName: string; notes?: string }) => void;
  onDismiss: () => void;
};

export function KitPickupHandoverDialog({ busy, onConfirm, onDismiss }: Props) {
  const [receivedByName, setReceivedByName] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    const result = buildHandoverPayload(receivedByName, notes);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    onConfirm(result.payload);
  }

  return (
    <div
      className="kit-ops-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="kit-ops-handover-title"
    >
      <div className="kit-ops-dialog__panel">
        <h2 id="kit-ops-handover-title">Registrar entrega</h2>
        <p>Confirmar entrega do kit?</p>

        <label className="kit-ops-dialog__field">
          <span>Quem recebeu o kit</span>
          <input
            value={receivedByName}
            onChange={(e) => setReceivedByName(e.target.value)}
            disabled={busy}
            required
          />
        </label>

        <label className="kit-ops-dialog__field">
          <span>Observações (opcional)</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={busy}
            rows={3}
          />
        </label>

        {error ? (
          <p className="kit-ops-dialog__error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="kit-ops-dialog__actions">
          <button type="button" onClick={onDismiss} disabled={busy}>
            Cancelar
          </button>
          <button type="button" onClick={handleSubmit} disabled={busy}>
            {busy ? "Registrando…" : "Confirmar entrega"}
          </button>
        </div>
      </div>
    </div>
  );
}
