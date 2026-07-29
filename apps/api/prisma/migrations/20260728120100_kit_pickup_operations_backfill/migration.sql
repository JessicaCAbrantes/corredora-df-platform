-- Backfill eligible paid/waived requests into the operational queue.
-- Separate migration so new enum values are committed first (PostgreSQL).
UPDATE "kit_pickup_requests"
SET "status" = 'PICKUP_PENDING',
    "updated_at" = CURRENT_TIMESTAMP
WHERE "status" IN ('PAID', 'WAIVED');
