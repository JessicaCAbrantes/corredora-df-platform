/**
 * Contract tests — FASE 3.5-B3 payment decision log schema.
 * Asserts exact payload shape / enums (not merely "logger was called").
 * Run via: pnpm --filter api test
 */
import {
  buildPaymentDecisionPayload,
  checkoutRejectReason,
  emitPaymentDecisionLog,
  PAYMENT_DECISION_CATEGORIES,
  PAYMENT_DECISION_EVENT_NAMES,
  PAYMENT_DECISION_PAYLOAD_KEYS,
  PAYMENT_DECISION_REASONS,
  PAYMENT_DECISION_RESULTS,
  type PaymentDecisionPayload,
} from "./payment-decision-log";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function assertExactPayload(
  payload: PaymentDecisionPayload,
  expected: Omit<PaymentDecisionPayload, "timestamp"> & { timestamp?: string },
): void {
  const keys = Object.keys(payload).sort();
  const expectedKeys = [...PAYMENT_DECISION_PAYLOAD_KEYS].sort();
  assert(
    JSON.stringify(keys) === JSON.stringify(expectedKeys),
    `payload keys mismatch: ${keys.join(",")}`,
  );

  for (const key of PAYMENT_DECISION_PAYLOAD_KEYS) {
    if (key === "timestamp") {
      assert(
        typeof payload.timestamp === "string" &&
          !Number.isNaN(Date.parse(payload.timestamp)),
        "timestamp ISO",
      );
      continue;
    }
    assert(
      Object.prototype.hasOwnProperty.call(expected, key),
      `expected has ${key}`,
    );
    assert(
      payload[key] === expected[key as keyof typeof expected],
      `${key}: got ${JSON.stringify(payload[key])} want ${JSON.stringify(expected[key as keyof typeof expected])}`,
    );
  }

  const forbidden = [
    "rawBody",
    "signature",
    "payloadHash",
    "customerEmail",
    "successUrl",
    "cancelUrl",
    "stack",
    "password",
  ];
  for (const key of forbidden) {
    assert(!(key in payload), `forbidden field ${key}`);
  }

  const raw = JSON.stringify(payload);
  assert(!raw.includes("whsec_"), "no whsec");
  assert(!raw.includes("sk_live"), "no sk_live");
  assert(!raw.includes("sk_test"), "no sk_test");
}

async function main(): Promise<void> {
  assert(PAYMENT_DECISION_RESULTS.length === 4, "result enum size");
  assert(PAYMENT_DECISION_CATEGORIES.length === 4, "category enum size");
  assert(PAYMENT_DECISION_REASONS.length === 23, "reason enum size");
  assert(PAYMENT_DECISION_EVENT_NAMES.length === 15, "event catalog size");
  assert(PAYMENT_DECISION_PAYLOAD_KEYS.length === 14, "schema field count");

  // --- builder: exact success checkout payload ---
  {
    const fixedNow = () => new Date("2026-08-04T15:00:00.000Z");
    const payload = buildPaymentDecisionPayload(
      {
        environment: "test",
        event: "payment.checkout.created",
        category: "audit",
        provider: "mock",
        paymentId: "kpp_1",
        requestId: "kpr_1",
        userId: "usr_1",
        providerPaymentId: "mock_pay_1",
        providerEventId: null,
        result: "success",
        code: null,
        reason: null,
      },
      fixedNow,
    );

    assertExactPayload(payload, {
      timestamp: "2026-08-04T15:00:00.000Z",
      service: "api",
      environment: "test",
      event: "payment.checkout.created",
      category: "audit",
      provider: "mock",
      paymentId: "kpp_1",
      requestId: "kpr_1",
      userId: "usr_1",
      providerPaymentId: "mock_pay_1",
      providerEventId: null,
      result: "success",
      code: null,
      reason: null,
    });
  }

  // --- emit: exact duplicate webhook payload via sink ---
  {
    const captured: PaymentDecisionPayload[] = [];
    emitPaymentDecisionLog(
      {
        environment: "production",
        event: "payment.webhook.duplicate",
        category: "audit",
        provider: "stripe",
        paymentId: "kpp_2",
        requestId: "kpr_2",
        userId: null,
        providerPaymentId: "cs_2",
        providerEventId: "evt_2",
        result: "noop",
        code: null,
        reason: "duplicate_event",
      },
      (p) => captured.push(p),
    );

    assert(captured.length === 1, "exactly one emission");
    assertExactPayload(captured[0], {
      service: "api",
      environment: "production",
      event: "payment.webhook.duplicate",
      category: "audit",
      provider: "stripe",
      paymentId: "kpp_2",
      requestId: "kpr_2",
      userId: null,
      providerPaymentId: "cs_2",
      providerEventId: "evt_2",
      result: "noop",
      code: null,
      reason: "duplicate_event",
    });
  }

  // --- emit: acknowledged_permanent with code ---
  {
    const captured: PaymentDecisionPayload[] = [];
    emitPaymentDecisionLog(
      {
        environment: "test",
        event: "payment.webhook.acknowledged_permanent",
        category: "audit",
        provider: "mock",
        paymentId: "kpp_3",
        requestId: "kpr_3",
        userId: null,
        providerPaymentId: "cs_3",
        providerEventId: "evt_3",
        result: "noop",
        code: "AMOUNT_MISMATCH",
        reason: "permanent_domain_conflict",
      },
      (p) => captured.push(p),
    );

    assert(captured.length === 1, "one permanent ack");
    assert(captured[0].event === "payment.webhook.acknowledged_permanent", "event name");
    assert(captured[0].code === "AMOUNT_MISMATCH", "code exact");
    assert(captured[0].reason === "permanent_domain_conflict", "reason exact");
    assert(captured[0].result === "noop", "result exact");
    assert(captured[0].category === "audit", "category exact");
  }

  // --- reject reason mapping (closed) ---
  assert(checkoutRejectReason("REQUEST_CANCELLED") === "request_cancelled", "cancelled");
  assert(checkoutRejectReason("NOT_FOUND") === "request_not_found", "not found");
  assert(checkoutRejectReason("INVALID_STATUS") === "invalid_transition", "invalid");
  assert(checkoutRejectReason("UNKNOWN_X") === "invalid_transition", "fallback");

  // --- forbidden keys never present (leak protection) ---
  {
    const payload = buildPaymentDecisionPayload({
      environment: "test",
      event: "payment.webhook.signature_rejected",
      category: "warn",
      provider: "stripe",
      result: "rejected",
      code: "INVALID_SIGNATURE",
      reason: "invalid_signature",
    });
    assertNoForbiddenProperties(payload);
    assert(!Object.prototype.hasOwnProperty.call(payload, "signature"), "no signature");
    assert(!Object.prototype.hasOwnProperty.call(payload, "rawBody"), "no rawBody");
    assert(!Object.prototype.hasOwnProperty.call(payload, "cookie"), "no cookie");
  }

  // --- enums contain emitted reasons ---
  for (const reason of [
    "duplicate_event",
    "permanent_domain_conflict",
    "payment_not_found",
    "stale_session",
    "declined",
  ] as const) {
    assert(
      (PAYMENT_DECISION_REASONS as readonly string[]).includes(reason),
      `reason catalog has ${reason}`,
    );
  }

  for (const event of PAYMENT_DECISION_EVENT_NAMES) {
    assert(event.startsWith("payment."), `event prefix ${event}`);
  }

  console.log("payment-decision-log.contract.test.ts: OK");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
