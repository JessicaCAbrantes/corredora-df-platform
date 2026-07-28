-- CreateEnum
CREATE TYPE "EventRegistrationMode" AS ENUM ('internal', 'external');

-- AlterTable
ALTER TABLE "events" ADD COLUMN "registration_mode" "EventRegistrationMode" NOT NULL DEFAULT 'internal';

-- CreateIndex
CREATE INDEX "events_registration_mode_idx" ON "events"("registration_mode");

-- CreateTable
CREATE TABLE "kit_pickup_services" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "service_available" BOOLEAN NOT NULL DEFAULT true,
    "fee_amount" DECIMAL(10,2),
    "fee_currency" TEXT NOT NULL DEFAULT 'BRL',
    "pickup_location" TEXT,
    "pickup_start_at" TIMESTAMP(3),
    "pickup_end_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kit_pickup_services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kit_pickup_services_event_id_key" ON "kit_pickup_services"("event_id");

-- CreateIndex
CREATE INDEX "kit_pickup_services_service_available_idx" ON "kit_pickup_services"("service_available");

-- CreateIndex
CREATE INDEX "kit_pickup_services_pickup_start_at_idx" ON "kit_pickup_services"("pickup_start_at");

-- CreateIndex
CREATE INDEX "kit_pickup_services_created_at_idx" ON "kit_pickup_services"("created_at");

-- AddForeignKey
ALTER TABLE "kit_pickup_services" ADD CONSTRAINT "kit_pickup_services_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
