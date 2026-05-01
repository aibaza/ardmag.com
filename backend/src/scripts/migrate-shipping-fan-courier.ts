/**
 * One-shot migration: trece la Fan Courier (calculated) + Ridicare Cluj (flat).
 * Sterge Sameday, Cargus, Posta Romana.
 * Actualizeaza Fan Courier la price_type=calculated si provider_id=fan-courier_fan-courier.
 *
 * Idempotent: ruleaza de mai multe ori fara efecte nedorite.
 *
 * Usage:
 *   npx medusa exec ./src/scripts/migrate-shipping-fan-courier.ts          # dry-run (afiseaza SQL)
 *   npx medusa exec ./src/scripts/migrate-shipping-fan-courier.ts -- apply # aplica
 */

import { ExecArgs } from "@medusajs/framework/types"
import { spawnSync } from "child_process"
import * as path from "path"

const APPLY = process.argv.includes("apply")
const BACKEND_DIR = path.resolve(__dirname, "../../..")

// Curierii de sters
const DELETE_NAMES = ["Sameday", "Cargus", "Posta Romana"]

function runSql(sql: string): string {
  const result = spawnSync("railway", ["connect", "Postgres"], {
    input: sql,
    encoding: "utf8",
    cwd: BACKEND_DIR,
  })
  if (result.error) throw result.error
  return (result.stdout || "") + (result.stderr || "")
}

export default async function migrateShippingFanCourier({ container }: ExecArgs) {
  const logger = {
    info: (msg: string) => console.log(`[migrate-shipping-fan-courier] ${msg}`),
    warn: (msg: string) => console.warn(`[migrate-shipping-fan-courier] WARN: ${msg}`),
    error: (msg: string, e?: unknown) => console.error(`[migrate-shipping-fan-courier] ERROR: ${msg}`, e ?? ""),
  }

  // --- 1. Verifica starea curenta ---
  const checkSql = `
SELECT name, price_type, provider_id, deleted_at IS NOT NULL AS deleted
FROM shipping_option
WHERE name IN ('Fan Courier', 'Sameday', 'Cargus', 'Posta Romana', 'Ridicare Cluj')
ORDER BY name;
`
  logger.info("Stare curenta shipping options:")
  const current = runSql(checkSql)
  console.log(current)

  // --- 2. SQL de migratie ---
  const deleteList = DELETE_NAMES.map(n => `'${n}'`).join(", ")

  const sql = `
BEGIN;

-- Sterge curierii nefolositi (soft delete)
UPDATE shipping_option
SET deleted_at = NOW(), updated_at = NOW()
WHERE name IN (${deleteList})
  AND deleted_at IS NULL;

-- Actualizeaza Fan Courier -> calculated + fan-courier provider
UPDATE shipping_option
SET
  price_type    = 'calculated',
  provider_id   = 'fan-courier_fan-courier',
  data          = '{"id": "fan-courier-standard"}',
  updated_at    = NOW()
WHERE name = 'Fan Courier'
  AND deleted_at IS NULL;

-- Sterge regula de free shipping de pe Fan Courier (item_total >= 50000)
-- (nu mai e necesara cu calculated price)
DELETE FROM shipping_option_rule
WHERE shipping_option_id IN (
  SELECT id FROM shipping_option WHERE name = 'Fan Courier' AND deleted_at IS NULL
)
AND attribute = 'item_total';

-- Sterge pretul 0 cu regula de la Fan Courier (pastreaza doar stub-ul amount=0 fara regula)
DELETE FROM price
WHERE id IN (
  SELECT p.id
  FROM price p
  JOIN price_rule pr ON pr.price_id = p.id
  JOIN shipping_option_price_set sops ON sops.price_set_id = p.price_set_id
  JOIN shipping_option so ON so.id = sops.shipping_option_id
  WHERE so.name = 'Fan Courier'
    AND so.deleted_at IS NULL
    AND pr.attribute = 'item_total'
);

COMMIT;
`

  if (!APPLY) {
    logger.info("DRY-RUN — SQL generat (nu s-a aplicat):")
    console.log(sql)
    logger.info("Ruleaza cu 'apply' pentru a aplica: npx medusa exec ./src/scripts/migrate-shipping-fan-courier.ts -- apply")
    return
  }

  logger.info("Aplicare migratie...")
  const out = runSql(sql)
  console.log(out)

  // --- 3. Verifica rezultat ---
  const verifySql = `
SELECT name, price_type, provider_id
FROM shipping_option
WHERE deleted_at IS NULL
ORDER BY name;
`
  logger.info("Shipping options dupa migratie:")
  const after = runSql(verifySql)
  console.log(after)
  logger.info("Done.")
}
