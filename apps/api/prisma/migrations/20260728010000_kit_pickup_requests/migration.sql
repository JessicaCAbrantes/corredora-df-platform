-- CreateEnum
CREATE TYPE "KitPickupRequestStatus" AS ENUM ('TERM_PENDING', 'TERM_ACCEPTED', 'PAYMENT_PENDING', 'PAID', 'WAIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "KitPickupPaymentStatus" AS ENUM ('UNPAID', 'PENDING', 'PAID', 'WAIVED', 'FAILED');

-- CreateEnum
CREATE TYPE "KitPickupPaymentRecordStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "kit_pickup_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "kit_pickup_service_id" TEXT NOT NULL,
    "registration_id" TEXT,
    "status" "KitPickupRequestStatus" NOT NULL DEFAULT 'TERM_PENDING',
    "payment_status" "KitPickupPaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "fee_amount_snapshot" DECIMAL(10,2),
    "fee_currency_snapshot" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kit_pickup_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participant_snapshots" (
    "id" TEXT NOT NULL,
    "kit_pickup_request_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "external_registration_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "participant_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pickup_term_acceptances" (
    "id" TEXT NOT NULL,
    "kit_pickup_request_id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "term_content_hash" TEXT NOT NULL,
    "accepted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_by_user_id" TEXT NOT NULL,

    CONSTRAINT "pickup_term_acceptances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kit_pickup_payments" (
    "id" TEXT NOT NULL,
    "kit_pickup_request_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_payment_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "KitPickupPaymentRecordStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kit_pickup_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "kit_pickup_requests_user_id_idx" ON "kit_pickup_requests"("user_id");

-- CreateIndex
CREATE INDEX "kit_pickup_requests_kit_pickup_service_id_idx" ON "kit_pickup_requests"("kit_pickup_service_id");

-- CreateIndex
CREATE INDEX "kit_pickup_requests_status_idx" ON "kit_pickup_requests"("status");

-- CreateIndex
CREATE INDEX "kit_pickup_requests_created_at_idx" ON "kit_pickup_requests"("created_at");

-- One active request per (user, service). Cancelled rows may be recreated.
CREATE UNIQUE INDEX "kit_pickup_requests_active_user_service_uidx"
ON "kit_pickup_requests" ("user_id", "kit_pickup_service_id")
WHERE "status" <> 'CANCELLED';

-- CreateIndex
CREATE UNIQUE INDEX "participant_snapshots_kit_pickup_request_id_key" ON "participant_snapshots"("kit_pickup_request_id");

-- CreateIndex
CREATE UNIQUE INDEX "pickup_term_acceptances_kit_pickup_request_id_key" ON "pickup_term_acceptances"("kit_pickup_request_id");

-- CreateIndex
CREATE UNIQUE INDEX "kit_pickup_payments_provider_payment_id_key" ON "kit_pickup_payments"("provider_payment_id");

-- CreateIndex
CREATE INDEX "kit_pickup_payments_kit_pickup_request_id_idx" ON "kit_pickup_payments"("kit_pickup_request_id");

-- CreateIndex
CREATE INDEX "kit_pickup_payments_status_idx" ON "kit_pickup_payments"("status");

-- AddForeignKey
ALTER TABLE "kit_pickup_requests" ADD CONSTRAINT "kit_pickup_requests_kit_pickup_service_id_fkey" FOREIGN KEY ("kit_pickup_service_id") REFERENCES "kit_pickup_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kit_pickup_requests" ADD CONSTRAINT "kit_pickup_requests_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "event_registrations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participant_snapshots" ADD CONSTRAINT "participant_snapshots_kit_pickup_request_id_fkey" FOREIGN KEY ("kit_pickup_request_id") REFERENCES "kit_pickup_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pickup_term_acceptances" ADD CONSTRAINT "pickup_term_acceptances_kit_pickup_request_id_fkey" FOREIGN KEY ("kit_pickup_request_id") REFERENCES "kit_pickup_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kit_pickup_payments" ADD CONSTRAINT "kit_pickup_payments_kit_pickup_request_id_fkey" FOREIGN KEY ("kit_pickup_request_id") REFERENCES "kit_pickup_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
