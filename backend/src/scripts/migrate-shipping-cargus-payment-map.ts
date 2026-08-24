/**
 * Migrare idempotenta pentru Fan + Ramburs si Cargus + Card.
 * Ridicare Cluj nu este modificata.
 *
 * Implicit afiseaza SQL-ul fara sa-l execute. Aplicarea este intentionat separata:
 *   npx medusa exec ./src/scripts/migrate-shipping-cargus-payment-map.ts
 *   npx medusa exec ./src/scripts/migrate-shipping-cargus-payment-map.ts -- apply
 */
import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

const APPLY = process.argv.includes("apply")

const SQL = `
BEGIN;

UPDATE shipping_option
SET deleted_at = NOW(), updated_at = NOW()
WHERE name IN ('Sameday', 'Posta Romana') AND deleted_at IS NULL;

UPDATE shipping_option
SET price_type = 'calculated', provider_id = 'fan-courier_fan-courier',
    data = '{"id":"fan-courier-standard"}', deleted_at = NULL, updated_at = NOW()
WHERE name = 'Fan Courier';

UPDATE shipping_option
SET price_type = 'calculated', provider_id = 'cargus_cargus',
    data = '{"id":"cargus-standard"}', deleted_at = NULL, updated_at = NOW()
WHERE name = 'Cargus';

DELETE FROM shipping_option_rule
WHERE shipping_option_id IN (
  SELECT id FROM shipping_option WHERE name IN ('Fan Courier', 'Cargus')
) AND attribute = 'item_total';

COMMIT;
`

export default async function migrateShippingCargusPaymentMap({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  logger.info("migrate-shipping-cargus-payment-map: SQL idempotent generat")
  console.log(SQL)

  if (!APPLY) {
    logger.info("DRY-RUN: nu s-a modificat baza de date. Foloseste -- apply numai conform rollout-ului aprobat.")
    return
  }

  // Nu ascundem aplicarea in spatele unui client extern: operatorul executa SQL-ul afisat
  // intr-o tranzactie controlata, dupa backup si validarea preflight din documentatie.
  throw new Error("Aplicare blocata intentionat: executa SQL-ul afisat prin consola SQL aprobata, conform docs/livrare-fan-cargus-rollout.md")
}

