import type { ExecArgs, IInventoryService, IProductModuleService } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createInventoryLevelsWorkflow, updateInventoryLevelsWorkflow, updateProductsWorkflow } from "@medusajs/medusa/core-flows"
import { writeFileSync, statSync, accessSync, constants } from "node:fs"
import { dirname } from "node:path"

/** Confirmed WhatsApp stock and gallery correction, Oct 1. Staging only. */
export default async function updateTotalWet({ container }: ExecArgs) {
  const db = new URL(process.env.DATABASE_URL!)
  if (process.env.ARDMAG_STAGING_ENVIRONMENT_ID !== "c47689f6-eaf2-48ac-8eae-bdcf11e7c27c" || db.hostname !== "switchback.proxy.rlwy.net" || db.port !== "17902") throw new Error("Isolated staging database required")
  if (!process.env.ARDMAG_FOLLOWUP_BACKUP || statSync(process.env.ARDMAG_FOLLOWUP_BACKUP).size < 10000) throw new Error("Fresh staging backup required")
  const backup = statSync(process.env.ARDMAG_FOLLOWUP_BACKUP)
  if (Date.now() - backup.mtimeMs > 2 * 60 * 60 * 1000) throw new Error("Staging backup is stale")
  if (!process.env.ARDMAG_FOLLOWUP_RESULT) throw new Error("Result path required before writes")
  accessSync(dirname(process.env.ARDMAG_FOLLOWUP_RESULT), constants.W_OK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fields = ["id", "handle", "metadata", "thumbnail", "images.*", "sales_channels.id", "variants.id", "variants.title", "variants.metadata", "variants.inventory_items.inventory_item_id", "variants.inventory_items.required_quantity", "variants.options.*", "variants.price_set.prices.*"]
  const { data } = await query.graph({ entity: "product", fields, filters: { handle: "total-wet" } })
  const product = data[0]
  if (data.length !== 1 || product.variants?.length !== 2 || product.id !== "prod_01M3S3AKA7JMSKKPSV2V5Q23XZ") throw new Error("Expected test product missing")
  const targets = [
    { variant_id: "variant_01M3S3AM4VFQS6E2E26J40WVGP", inventory_item_id: "iitem_01M3S3AMD4CD4V2MDZ7ARDHA8R", title: "1 LITRU", stocked_quantity: 48 },
    { variant_id: "variant_01M3S3AM4W518PZTVSZ0KXDNMM", inventory_item_id: "iitem_01M3S3AMD4AHMCK477FJNMQE3A", title: "5 LITRI", stocked_quantity: 60 },
  ]
  const location_id = "sloc_01KPH3TTXD2AD13KRV3R56ETQT"
  for (const target of targets) {
    const variant = product.variants!.find(v => v?.id === target.variant_id)
    const links = variant?.inventory_items ?? []
    if (links.length !== 1 || links[0]?.inventory_item_id !== target.inventory_item_id || Number(links[0]?.required_quantity) !== 1) throw new Error("Variant inventory link mismatch")
  }
  const { data: locations } = await query.graph({ entity: "stock_location", fields: ["id", "sales_channels.id"], filters: { id: location_id } })
  if (locations.length !== 1 || !product.sales_channels?.some(s => locations[0].sales_channels?.some(l => l?.id === s?.id))) throw new Error("Stock location not linked to product sales channel")
  const inventory = container.resolve<IInventoryService>(Modules.INVENTORY)
  const levels = await inventory.listInventoryLevels({ inventory_item_id: targets.map(t => t.inventory_item_id), location_id })
  const primary = product.images?.find(i => i?.url === product.thumbnail)
  if (!primary || targets.some(t => !product.variants?.some(v => v?.id === t.variant_id && v.title === t.title))) throw new Error("Unexpected variants or primary photo")
  if (levels.some(l => Number(l.reserved_quantity) !== 0)) throw new Error("Reserved stock requires operator reconciliation")
  const applying = process.env.ARDMAG_FOLLOWUP_APPLY === "1"
  if (applying) {
    const missing = targets.filter(t => !levels.some(l => l.inventory_item_id === t.inventory_item_id))
    if (missing.length) await createInventoryLevelsWorkflow(container).run({ input: { inventory_levels: missing.map(t => ({ inventory_item_id: t.inventory_item_id, location_id, stocked_quantity: t.stocked_quantity })) } })
    const updates = targets.flatMap(t => { const level = levels.find(l => l.inventory_item_id === t.inventory_item_id); return level && Number(level.stocked_quantity) !== t.stocked_quantity ? [{ id: level.id, inventory_item_id: t.inventory_item_id, location_id, stocked_quantity: t.stocked_quantity }] : [] })
    if (updates.length) await updateInventoryLevelsWorkflow(container).run({ input: { updates } })
    await updateProductsWorkflow(container).run({ input: { products: [{ id: product.id, images: [{ id: primary.id, url: primary.url }], metadata: { ...product.metadata, stock_confirmation_pending: false, stock_confirmed_at: "2026-10-01" }, variants: targets.map(t => ({ id: t.variant_id, manage_inventory: true, allow_backorder: false, metadata: { ...product.variants!.find(v => v?.id === t.variant_id)!.metadata, contact_to_order: false } })) }] } })
  }
  const readback = await inventory.listInventoryLevels({ inventory_item_id: targets.map(t => t.inventory_item_id), location_id })
  if (applying && targets.some(t => !readback.some(l => l.inventory_item_id === t.inventory_item_id && Number(l.stocked_quantity) === t.stocked_quantity))) throw new Error("Stock readback mismatch")
  const { data: after } = await query.graph({ entity: "product", fields, filters: { id: product.id } })
  const commercial = (p: typeof product) => JSON.stringify(p.variants?.map(v => ({ id: v?.id, prices: [...(v?.price_set?.prices ?? [])].sort((a,b) => String(a?.id).localeCompare(String(b?.id))), options: [...(v?.options ?? [])].sort((a,b) => String(a?.id).localeCompare(String(b?.id))) })).sort((a,b) => String(a.id).localeCompare(String(b.id))))
  if (commercial(product) !== commercial(after[0])) throw new Error("Product prices or options unexpectedly changed")
  if (applying && (after[0].images?.length !== 1 || after[0].thumbnail !== product.thumbnail || after[0].variants?.some(v => v?.metadata?.contact_to_order !== false))) throw new Error("Product gallery or ordering readback mismatch")
  const report = { applying, staging: true, product_id: product.id, targets, commercial_data_preserved: true, image_count: after[0].images?.length, before_levels: levels.map(l => ({ inventory_item_id: l.inventory_item_id, stocked_quantity: l.stocked_quantity })), primary_image: primary.url, levels: readback.map(l => ({ inventory_item_id: l.inventory_item_id, stocked_quantity: l.stocked_quantity, reserved_quantity: l.reserved_quantity })) }
  writeFileSync(process.env.ARDMAG_FOLLOWUP_RESULT!, JSON.stringify(report, null, 2), { mode: 0o600 })
  console.log(JSON.stringify(report))
}
