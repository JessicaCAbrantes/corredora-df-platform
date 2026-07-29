-- AlterEnum: operational states (Phase 2.1)
ALTER TYPE "KitPickupRequestStatus" ADD VALUE 'PICKUP_PENDING';
ALTER TYPE "KitPickupRequestStatus" ADD VALUE 'PICKED_UP';
ALTER TYPE "KitPickupRequestStatus" ADD VALUE 'IN_CUSTODY';
ALTER TYPE "KitPickupRequestStatus" ADD VALUE 'READY_FOR_HANDOVER';
ALTER TYPE "KitPickupRequestStatus" ADD VALUE 'DELIVERED';

-- Operational audit columns
ALTER TABLE "kit_pickup_requests" ADD COLUMN "picked_up_at" TIMESTAMP(3),
ADD COLUMN "picked_up_by" TEXT,
ADD COLUMN "custody_at" TIMESTAMP(3),
ADD COLUMN "custody_by" TEXT,
ADD COLUMN "ready_at" TIMESTAMP(3),
ADD COLUMN "ready_by" TEXT,
ADD COLUMN "delivered_at" TIMESTAMP(3),
ADD COLUMN "delivered_by" TEXT,
ADD COLUMN "received_by_name" TEXT,
ADD COLUMN "handover_notes" TEXT;

CREATE INDEX "kit_pickup_requests_picked_up_at_idx" ON "kit_pickup_requests"("picked_up_at");
CREATE INDEX "kit_pickup_requests_custody_at_idx" ON "kit_pickup_requests"("custody_at");
CREATE INDEX "kit_pickup_requests_ready_at_idx" ON "kit_pickup_requests"("ready_at");
CREATE INDEX "kit_pickup_requests_delivered_at_idx" ON "kit_pickup_requests"("delivered_at");
