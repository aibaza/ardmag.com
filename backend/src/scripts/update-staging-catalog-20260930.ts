import type { ExecArgs, IPricingModuleService, IFileModuleService } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules, ProductStatus } from "@medusajs/framework/utils"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import { readFileSync, statSync, writeFileSync } from "node:fs"

type Change = { variant_id: string; product_id: string; price_id: string; before: number; amount: number; source: { filename: string; table: number; row: number }; multiplier: number }
type Manifest = { environment_id: string; currency: string; changes: Change[] }

export default async function updateStagingCatalog({ container }: ExecArgs) {
  const envId = "c47689f6-eaf2-48ac-8eae-bdcf11e7c27c"
  const db = new URL(process.env.DATABASE_URL!)
  if (process.env.ARDMAG_STAGING_ENVIRONMENT_ID !== envId || db.hostname !== "switchback.proxy.rlwy.net" || db.port !== "17902") throw new Error("Isolated staging database required")
  const manifest: Manifest = JSON.parse(readFileSync(process.env.ARDMAG_CATALOG_MANIFEST!, "utf8"))
  if (manifest.environment_id !== envId || manifest.currency !== "ron") throw new Error("Staging RON manifest required")
  if (statSync(process.env.ARDMAG_BACKUP_FILE!).size < 10000) throw new Error("Staging backup required")
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: products } = await query.graph({ entity: "product", fields: ["id", "handle", "shipping_profile.id", "sales_channels.id", "variants.id", "variants.price_set.prices.*"], pagination: { take: 1000 } })
  const prices = new Map<string, { variantId: string; productId: string; price: any }>()
  for (const product of products) for (const variant of product.variants ?? []) for (const price of variant.price_set?.prices ?? []) { if (price) prices.set(price.id, { variantId: variant.id, productId: product.id, price }) }
  const seen = new Set<string>()
  for (const change of manifest.changes) {
    const record = prices.get(change.price_id)
    if (seen.has(change.price_id) || !record || record.variantId !== change.variant_id || record.productId !== change.product_id || record.price.currency_code !== "ron" || record.price.price_list_id || record.price.rules_count || record.price.min_quantity || record.price.max_quantity) throw new Error(`Not a unique base RON price: ${change.variant_id}`)
    if (!Number.isFinite(change.amount) || change.amount <= 0 || !Number.isInteger(change.multiplier) || change.multiplier < 1) throw new Error("Invalid source amount or quantity")
    if (Number(record.price.amount) !== change.before && Number(record.price.amount) !== change.amount) throw new Error(`Price changed since inspection: ${change.variant_id}`)
    seen.add(change.price_id)
  }
  const applying = process.env.ARDMAG_CATALOG_APPLY === "1"
  const report: any = { applying, staging: true, manifest_changes: manifest.changes.length, updated_prices: 0, new_product_id: products.find(p => p.handle === "total-wet")?.id ?? null }
  if (applying) {
    const pricing = container.resolve<IPricingModuleService>(Modules.PRICING)
    const changed = manifest.changes.filter(c => Number(prices.get(c.price_id)!.price.amount) !== c.amount)
    if (changed.length) {
      const byId = new Map(changed.map(c => [c.price_id, c.amount]))
      const setIds = new Set(changed.map(c => prices.get(c.price_id)!.price.price_set_id))
      const updates = [...setIds].map(id => {
        const basePrices = [...prices.values()].map(r => r.price).filter(p => p.price_set_id === id && !p.price_list_id)
        if (basePrices.some(p => p.rules_count)) throw new Error("Rule-bearing price set requires separate review")
        return { id, prices: basePrices.map(p => ({ id: p.id, currency_code: p.currency_code, amount: byId.get(p.id) ?? Number(p.amount), min_quantity: p.min_quantity, max_quantity: p.max_quantity })) }
      })
      // Medusa replaces base prices: include every existing base entry to preserve other currencies and tiers.
      await pricing.upsertPriceSets(updates)
    }
    report.updated_prices = changed.length
    if (!report.new_product_id) {
      const reference = products.find(p => p.handle === "seal")!
      if (!reference?.shipping_profile?.id || !reference.sales_channels?.length) throw new Error("Staging sales channel and shipping profile missing")
      const [file, instructions] = await container.resolve<IFileModuleService>(Modules.FILE).createFiles([
        { filename: "total-wet-1l-studio-20260930.png", mimeType: "image/png", content: readFileSync(process.env.ARDMAG_PRODUCT_IMAGE!).toString("base64") },
        { filename: "total-wet-1l-eticheta-instructiuni-20260930.jpg", mimeType: "image/jpeg", content: readFileSync(process.env.ARDMAG_PRODUCT_LABEL_IMAGE!).toString("base64") },
      ])
      const { result } = await createProductsWorkflow(container).run({ input: { products: [{
        title: "TOTAL WET", handle: "total-wet", status: ProductStatus.PUBLISHED,
        description: "Efect umed profesional. Protecție hidrofugă pentru marmură, granit, travertin și piatră naturală. Imaginea prezintă ambalajul de 1 L.",
        metadata: { is_new: true, features: ["Efect umed profesional"], aplicatii: ["Marmură", "Granit", "Travertin", "Piatră naturală"], catalog_added_at: "2026-09-30", image_volume: "1 L", stock_confirmation_pending: true },
        category_ids: ["pcat_01KPH383SVDBH60EZM36CEBRKY"],
        tag_ids: ["ptag_01KPMEPPZJRD74JMMP683TNTPN", "ptag_01KPMEPQ0JQPF94SVD1NQE2BJE"],
        shipping_profile_id: reference.shipping_profile.id,
        sales_channels: reference.sales_channels.filter((s): s is NonNullable<typeof s> => Boolean(s)).map(s => ({ id: s.id })), thumbnail: file.url, images: [{ url: file.url }, { url: instructions.url }],
        options: [{ title: "CANTITATE", values: ["1 LITRU", "5 LITRI"] }],
        variants: [{ title: "1 LITRU", sku: "DELTA-TOTAL-WET-1L", options: { CANTITATE: "1 LITRU" }, manage_inventory: true, allow_backorder: false, metadata: { contact_to_order: true }, prices: [{ currency_code: "ron", amount: 140 }] },
          { title: "5 LITRI", sku: "DELTA-TOTAL-WET-5L", options: { CANTITATE: "5 LITRI" }, manage_inventory: true, allow_backorder: false, metadata: { contact_to_order: true }, prices: [{ currency_code: "ron", amount: 622 }] }],
      }] } })
      report.new_product_id = result[0].id
      report.image_url = file.url
    }
  }
  writeFileSync(process.env.ARDMAG_CATALOG_RESULT!, JSON.stringify(report, null, 2), { mode: 0o600 })
  console.log(JSON.stringify(report))
}
