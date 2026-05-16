import { Pool } from "pg"

let pool: Pool | null = null

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 2,
      idleTimeoutMillis: 30_000,
    })
  }
  return pool
}

export async function fetchVariantWeights(variantIds: string[]): Promise<Map<string, number>> {
  const map = new Map<string, number>()
  if (variantIds.length === 0) return map
  const result = await getPool().query<{ id: string; weight: number | null }>(
    `SELECT id, weight FROM product_variant WHERE id = ANY($1) AND deleted_at IS NULL`,
    [variantIds]
  )
  for (const row of result.rows) {
    if (typeof row.weight === "number") map.set(row.id, row.weight)
  }
  return map
}
