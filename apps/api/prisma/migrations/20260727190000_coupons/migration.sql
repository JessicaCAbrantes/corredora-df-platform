-- CreateTable
CREATE TABLE "coupons" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "discount_label" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "partner_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "coupons_active_idx" ON "coupons"("active");

-- CreateIndex
CREATE INDEX "coupons_expires_at_idx" ON "coupons"("expires_at");

-- CreateIndex
CREATE INDEX "coupons_created_at_idx" ON "coupons"("created_at");

-- CreateIndex
CREATE INDEX "coupons_partner_id_idx" ON "coupons"("partner_id");

-- AddForeignKey
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;
