import type { OperationalRequestItem } from "../types/kit-pickup-operations";
import {
  buildOperationalTimeline,
  formatFeeSnapshot,
  formatOperationalDate,
  formatOperationalDateTime,
  getPaymentStatusLabel,
  getRegistrationModeLabel,
} from "../utils/kit-pickup-operations-presentation";

type Props = {
  item: OperationalRequestItem;
};

export function KitPickupOperationTimeline({ item }: Props) {
  const steps = buildOperationalTimeline(item);

  return (
    <ol className="kit-ops-timeline" aria-label="Histórico operacional">
      {steps.map((step) => (
        <li key={step.id} className="kit-ops-timeline__step">
          <span className="kit-ops-timeline__label">{step.label}</span>
          {step.timestamp ? (
            <time dateTime={step.timestamp} className="kit-ops-timeline__time">
              {formatOperationalDateTime(step.timestamp)}
            </time>
          ) : (
            <span className="kit-ops-timeline__pending">Pendente</span>
          )}
          {step.operatorId ? (
            <span className="kit-ops-timeline__operator">
              Operador: {step.operatorId}
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

type DetailProps = {
  item: OperationalRequestItem;
  onClose: () => void;
};

export function KitPickupOperationDetailPanel({ item, onClose }: DetailProps) {
  return (
    <aside className="kit-ops-detail" aria-label="Detalhe da solicitação">
      <div className="kit-ops-detail__header">
        <h2>{item.event.name}</h2>
        <button type="button" onClick={onClose} aria-label="Fechar painel">
          ×
        </button>
      </div>

      <p className="kit-ops-detail__status">{item.statusLabel}</p>

      <section>
        <h3>Evento</h3>
        <p>
          {item.event.city} · {formatOperationalDate(item.event.date)}
        </p>
        <p>{getRegistrationModeLabel(item.registrationMode)}</p>
      </section>

      <section>
        <h3>Serviço</h3>
        <p>{item.service.title}</p>
        {item.service.pickupLabel ? <p>{item.service.pickupLabel}</p> : null}
      </section>

      <section>
        <h3>Participante</h3>
        {item.registrationMode === "external" && item.participant ? (
          <dl className="kit-ops-detail__dl">
            <div>
              <dt>Nome</dt>
              <dd>{item.participant.fullName}</dd>
            </div>
            <div>
              <dt>E-mail</dt>
              <dd>{item.participant.email}</dd>
            </div>
            <div>
              <dt>Telefone</dt>
              <dd>{item.participant.phone}</dd>
            </div>
            <div>
              <dt>Código externo</dt>
              <dd>{item.participant.externalRegistrationCode}</dd>
            </div>
          </dl>
        ) : (
          <>
            <p>Inscrição vinculada</p>
            {item.registrationId ? <p>Referência: {item.registrationId}</p> : null}
          </>
        )}
      </section>

      <section>
        <h3>Pagamento</h3>
        <p>{getPaymentStatusLabel(item.paymentStatus)}</p>
        <p>
          {formatFeeSnapshot(item.feeAmountSnapshot, item.feeCurrencySnapshot)}
        </p>
      </section>

      {item.termAcceptedAt ? (
        <section>
          <h3>Termo</h3>
          <p>Aceito em {formatOperationalDateTime(item.termAcceptedAt)}</p>
        </section>
      ) : null}

      {item.status === "DELIVERED" && item.receivedByName ? (
        <section>
          <h3>Entrega</h3>
          <p>Recebido por: {item.receivedByName}</p>
          {item.deliveredAt ? (
            <p>Em {formatOperationalDateTime(item.deliveredAt)}</p>
          ) : null}
          {item.handoverNotes ? <p>Observações: {item.handoverNotes}</p> : null}
        </section>
      ) : null}

      <section>
        <h3>Histórico operacional</h3>
        <KitPickupOperationTimeline item={item} />
      </section>
    </aside>
  );
}
