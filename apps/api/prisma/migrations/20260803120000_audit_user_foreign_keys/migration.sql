-- FASE 3.3-B — Audit Foreign Keys (*By / acceptedByUserId → User)
--
-- Strategy (same as 3.3-A):
--   ON DELETE RESTRICT — preserve audit / operational history
--   ON UPDATE CASCADE  — align with existing FKs
--
-- Also documents (no DDL change): intentional partial unique drift for active
-- kit pickup requests — index "kit_pickup_requests_active_user_service_uidx"
-- created in 20260728010000. Prisma cannot model it; DO NOT DROP in future
-- migrations. See schema.prisma (KitPickupRequest) and docs/database/README.md.
--
-- Pre-flight check (must return 0 rows before apply):
--
--   SELECT accepted_by_user_id FROM pickup_term_acceptances pta
--   LEFT JOIN users u ON u.id = pta.accepted_by_user_id WHERE u.id IS NULL;
--
--   SELECT picked_up_by FROM kit_pickup_requests
--   WHERE picked_up_by IS NOT NULL AND picked_up_by NOT IN (SELECT id FROM users);
--   -- (repeat for custody_by, ready_by, delivered_by)
--
-- Orphan non-null values cause ADD CONSTRAINT to fail (fail-closed).

-- AddForeignKey
ALTER TABLE "pickup_term_acceptances" ADD CONSTRAINT "pickup_term_acceptances_accepted_by_user_id_fkey" FOREIGN KEY ("accepted_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kit_pickup_requests" ADD CONSTRAINT "kit_pickup_requests_picked_up_by_fkey" FOREIGN KEY ("picked_up_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kit_pickup_requests" ADD CONSTRAINT "kit_pickup_requests_custody_by_fkey" FOREIGN KEY ("custody_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kit_pickup_requests" ADD CONSTRAINT "kit_pickup_requests_ready_by_fkey" FOREIGN KEY ("ready_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kit_pickup_requests" ADD CONSTRAINT "kit_pickup_requests_delivered_by_fkey" FOREIGN KEY ("delivered_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
