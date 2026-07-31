-- FASE 3.3-A — Foreign Keys: opaque userId → User.id
--
-- Strategy:
--   ON DELETE RESTRICT — refuse deleting a User that still has registrations
--   or kit-pickup requests (preserve operational/payment history).
--   ON UPDATE CASCADE  — align with existing FKs in this project.
--
-- Pre-flight check
-- Esta migration pressupõe inexistência de registros órfãos.
-- Se existirem órfãos, o ADD CONSTRAINT falha (fail-closed) — corrigir dados e reaplicar.
--
-- Verificar (deve retornar 0 linhas):
--
--   SELECT er.user_id
--   FROM event_registrations er
--   LEFT JOIN users u ON u.id = er.user_id
--   WHERE u.id IS NULL;
--
--   SELECT kpr.user_id
--   FROM kit_pickup_requests kpr
--   LEFT JOIN users u ON u.id = kpr.user_id
--   WHERE u.id IS NULL;

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kit_pickup_requests" ADD CONSTRAINT "kit_pickup_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
