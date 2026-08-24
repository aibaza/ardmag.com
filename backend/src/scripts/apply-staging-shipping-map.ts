// @ts-nocheck
import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { Client } from "pg"

const SQL = `
BEGIN;
UPDATE shipping_option SET deleted_at = NOW(), updated_at = NOW()
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

export default async function applyStagingShippingMap({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  if (
    process.env.RAILWAY_ENVIRONMENT_NAME !== "staging" ||
    process.env.RAILWAY_ENVIRONMENT_ID !== "c47689f6-eaf2-48ac-8eae-bdcf11e7c27c"
  ) {
    throw new Error("apply-staging-shipping-map: guard refuzat; numai Railway staging sandbox")
  }
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  try {
    await client.query(SQL)
    logger.info("apply-staging-shipping-map: SQL applied transactionally on staging")
  } finally {
    await client.end()
  }
}
