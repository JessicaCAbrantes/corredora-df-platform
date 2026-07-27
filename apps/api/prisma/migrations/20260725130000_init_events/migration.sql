-- CreateEnum
CREATE TYPE "EventLifecycleStatus" AS ENUM ('active', 'cancelled', 'completed');

-- CreateEnum
CREATE TYPE "EventRegistrationStatus" AS ENUM ('open', 'closed', 'upcoming');

-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('marathon', 'half-marathon', '5k', '10k', 'trail');

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "city" TEXT NOT NULL,
    "category" "EventCategory" NOT NULL,
    "distance" TEXT NOT NULL,
    "status" "EventLifecycleStatus" NOT NULL,
    "registration_status" "EventRegistrationStatus" NOT NULL,
    "cover_image" TEXT NOT NULL,
    "price_amount" DECIMAL(10,2),
    "price_currency" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "events_slug_key" ON "events"("slug");

-- CreateIndex
CREATE INDEX "events_date_idx" ON "events"("date");

-- CreateIndex
CREATE INDEX "events_status_idx" ON "events"("status");

-- CreateIndex
CREATE INDEX "events_category_idx" ON "events"("category");

-- CreateIndex
CREATE INDEX "events_city_idx" ON "events"("city");

-- CreateIndex
CREATE INDEX "events_created_at_idx" ON "events"("created_at");

-- CreateIndex
CREATE INDEX "events_registration_status_idx" ON "events"("registration_status");
