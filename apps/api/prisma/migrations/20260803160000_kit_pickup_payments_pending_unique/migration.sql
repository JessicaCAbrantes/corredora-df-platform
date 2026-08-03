-- FASE 3.4-C3 — At most one PENDING KitPickupPayment per request
--
-- Prisma cannot model partial unique indexes. Do NOT replace with @@unique
-- and do NOT DROP this index. See schema.prisma (KitPickupPayment) and
-- docs/database/README.md.
--
-- Pre-flight (must return 0 rows before apply):
--
--   SELECT kit_pickup_request_id, COUNT(*)
--   FROM kit_pickup_payments
--   WHERE status = 'PENDING'
--   GROUP BY kit_pickup_request_id
--   HAVING COUNT(*) > 1;

CREATE UNIQUE INDEX "kit_pickup_payments_pending_request_uidx"
ON "kit_pickup_payments" ("kit_pickup_request_id")
WHERE "status" = 'PENDING';
