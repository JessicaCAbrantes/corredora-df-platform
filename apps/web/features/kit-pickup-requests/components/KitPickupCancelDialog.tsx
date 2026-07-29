type Props = {
  hasConfirmedPayment: boolean;
  busy: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
};

export function KitPickupCancelDialog({
  hasConfirmedPayment,
  busy,
  onConfirm,
  onDismiss,
}: Props) {
  return (
    <div
      className="kit-pickup-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="kit-pickup-cancel-title"
    >
      <div className="kit-pickup-dialog__panel">
        <h2 id="kit-pickup-cancel-title" className="kit-pickup-dialog__title">
          Cancelar solicitação?
        </h2>

        {hasConfirmedPayment ? (
          <>
            <p>
              Esta solicitação já possui um pagamento confirmado.
            </p>
            <p className="kit-pickup-dialog__warning">
              O cancelamento não gera reembolso automático. Caso tenha realizado
              um pagamento, entre em contato com a Corredora DF para verificar as
              condições de reembolso.
            </p>
            <p>Deseja continuar?</p>
          </>
        ) : (
          <p>
            Sua solicitação será cancelada e não poderá continuar no fluxo de
            retirada.
          </p>
        )}

        <div className="kit-pickup-dialog__actions">
          <button type="button" onClick={onDismiss} disabled={busy}>
            Voltar
          </button>
          <button
            type="button"
            className="kit-pickup-dialog__confirm"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Cancelando…" : "Cancelar solicitação"}
          </button>
        </div>
      </div>
    </div>
  );
}
