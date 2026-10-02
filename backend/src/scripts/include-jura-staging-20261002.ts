import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { removePriceListPricesWorkflow, updatePromotionRulesWorkflow, updateProductsWorkflow } from "@medusajs/medusa/core-flows"
import { writeFileSync, statSync } from "node:fs"
import { SOLIDO_1L_VARIANTS } from "../modules/tenax-promotion/policy"

export default async function reconcile({ container }: ExecArgs) {
  const db = new URL(process.env.DATABASE_URL ?? "")
  if (process.env.ARDMAG_STAGING_ENVIRONMENT_ID !== "c47689f6-eaf2-48ac-8eae-bdcf11e7c27c" || db.hostname !== "switchback.proxy.rlwy.net" || db.port !== "17902") throw new Error("Isolated staging required")
  if (statSync(process.env.ARDMAG_FEEDBACK_BACKUP!).size < 10000) throw new Error("Staging backup required")
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: products } = await query.graph({ entity: "product", fields: ["id", "handle", "metadata", "variants.id", "variants.title", "variants.price_set.id", "variants.price_set.prices.*"], filters: { handle: "mastic-solid" } })
  const product: any = products[0]
  const jura: any = product?.variants.find((v: any) => v.id === SOLIDO_1L_VARIANTS[3])
  if (!jura || jura.title !== "JURA / 1 LITRU") throw new Error("Jura identity changed")
  const pricing = container.resolve(Modules.PRICING)
  jura.price_set.prices = await pricing.listPrices({price_set_id: jura.price_set.id}, {take:100})
  const base = jura.price_set.prices.filter((p: any) => p.currency_code === "ron" && !p.price_list_id && p.min_quantity == null && p.max_quantity == null)
  const sales = jura.price_set.prices.filter((p: any) => p.price_list_id && p.currency_code === "ron")
  if (base.length !== 1 || Number(base[0].amount) !== 76 || sales.length !== 1 || Number(sales[0].amount) !== 60.8) throw new Error("Expected Jura prices changed")
  const list = await pricing.retrievePriceList(sales[0].price_list_id)
  if (!list.title?.startsWith("TENAX mastici -20% 2026Q4")) throw new Error("Unexpected sale list")
  const promotion = container.resolve(Modules.PROMOTION)
  const promos = await promotion.listPromotions({ code: "TENAX-SOLIDO-20-MIX12-2026Q4" }, { relations: ["application_method.target_rules", "application_method.target_rules.values"] })
  const rules = promos[0]?.application_method?.target_rules?.filter((r: any) => r.attribute === "items.variant_id")
  if (promos.length !== 1 || rules?.length !== 1) throw new Error("Expected promotion rule missing")
  const rule = rules[0]
  const oldValues = rule.values.map((v: any) => v.value)
  if (oldValues.length !== 3 || !oldValues.every((v: string) => SOLIDO_1L_VARIANTS.includes(v as any))) throw new Error("Expected eligibility changed")
  writeFileSync(process.env.ARDMAG_FEEDBACK_RESULT!, JSON.stringify({ product, promotion: promos[0], sale_list: list }, null, 2), { mode: 0o600 })
  await updatePromotionRulesWorkflow(container).run({ input: { data: [{ id: rule.id, values: [...SOLIDO_1L_VARIANTS] }] } })
  await removePriceListPricesWorkflow(container).run({ input: { ids: [sales[0].id] } })
  await updateProductsWorkflow(container).run({ input: { products: [{ id: product.id, metadata: { ...product.metadata, tenax_promotion: { ...product.metadata.tenax_promotion, quantity_variant_ids: [...SOLIDO_1L_VARIANTS] } } }] } })
  console.log("Jura 1L included in mixed threshold; direct sale removed; base price preserved")
}
