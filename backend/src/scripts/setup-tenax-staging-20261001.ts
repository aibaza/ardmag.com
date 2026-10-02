import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createPriceListsWorkflow, createPromotionsWorkflow, updateProductsWorkflow } from "@medusajs/medusa/core-flows"
import { writeFileSync, statSync, readFileSync } from "node:fs"
import { SOLIDO_1L_VARIANTS, TENAX_QUANTITY_ATTRIBUTE, TENAX_START, TENAX_END } from "../modules/tenax-promotion/policy"

const handles = ["mastic-lichid","mastic-semisolid-wet","mastic-semisolid","tixo-xe-transparent","mastic-solid","mastic-thassos","glaxs-easy","set-adeziv-profesional-decapant","gravity-solid-extra-clear","strongedge-45-epoxy-solid-transparent","rivo-epoxy-solid","fixtop-epoxy-solid","fast-glaxs-glue-cartus","kit-colla-glaxs-transparent","eliox-epoxy-solid-extra-clear","domo-10-epoxy-solid"]
const code="TENAX-SOLIDO-20-MIX12-2026Q4"
const title="TENAX mastici -20% 2026Q4 (except Solido 1L alb/bej/negru)"
export default async function setup({container}:ExecArgs) {
  const db = new URL(process.env.DATABASE_URL ?? "")
  if(process.env.ARDMAG_STAGING_ENVIRONMENT_ID!=="c47689f6-eaf2-48ac-8eae-bdcf11e7c27c" || db.hostname!=="switchback.proxy.rlwy.net" || db.port!=="17902")throw new Error("Isolated staging required")
  const output=process.env.ARDMAG_TENAX_RESULT!
  if(!output)throw new Error("Result path required")
  const query=container.resolve(ContainerRegistrationKeys.QUERY)
  const {data:products}=await query.graph({entity:"product",fields:["id","title","handle","metadata","tags.value","variants.id","variants.title","variants.price_set.prices.*"],pagination:{take:200}})
  const chosen=products.filter(p=>handles.includes(p.handle))
  if(chosen.length!==handles.length || !chosen.every(p=>p.tags.some((t:any)=>t.value==="brand:tenax")))throw new Error("Eligible mastic identities changed")
  const solid=chosen.find(p=>p.handle==="mastic-solid")!
  const conditional=new Set<string>(SOLIDO_1L_VARIANTS)
  if(SOLIDO_1L_VARIANTS.some(id=>!solid.variants.some((v:any)=>v.id===id)))throw new Error("Conditional variants missing")
  const prices:any[]=[]
  const baseline:any[]=[]
  for(const product of chosen)for(const variant of product.variants){
    const candidates=(variant.price_set?.prices ?? []).filter((p:any)=>p.currency_code==="ron" && !p.price_list_id && p.min_quantity==null && p.max_quantity==null)
    if(candidates.length!==1)throw new Error("Ambiguous base price: "+variant.id)
    const price=candidates[0]!;
    if(process.env.ARDMAG_TENAX_PUBLISH_NOTICE!=="1" && variant.price_set?.prices.some((p:any)=>p.price_list_id))throw new Error("Existing variant price list must be audited first: "+variant.id);const amount=Number(price.amount)
    if(!Number.isFinite(amount)||amount<=0)throw new Error("Invalid base price")
    baseline.push({product_id:product.id,handle:product.handle,variant_id:variant.id,variant_title:variant.title,base_price_id:price.id,base_amount:amount})
    if(!conditional.has(variant.id))prices.push({variant_id:variant.id,currency_code:"ron",amount:Math.round(amount*0.8*100)/100})
    else if(amount!==76)throw new Error("Confirmed Solido base price changed")
  }
  const excludedIds=products.filter(p=>["intaritor-mastic","set-pigmenti","aplicator-fast-glaxs","skudo","toner-black","proseal","ager","hydrex"].includes(p.handle)).flatMap(p=>p.variants.map((v:any)=>v.id))
  if(prices.some(p=>excludedIds.includes(p.variant_id)))throw new Error("Excluded variant in discount manifest")
  const pricing=container.resolve(Modules.PRICING)
  const promotion=container.resolve(Modules.PROMOTION)
  if (promotion.constructor.name !== "TenaxPromotionService") throw new Error("Trusted native promotion extension not active")
  const existingLists=await pricing.listPriceLists({},{take:100}).then(lists=>lists.filter(list=>list.title===title))
  const existingPromos=await promotion.listPromotions({code})
  const report:any={staging:true,apply:process.env.ARDMAG_TENAX_APPLY==="1",products:chosen.map(p=>({id:p.id,handle:p.handle})),baseline,prices,conditional_variants:SOLIDO_1L_VARIANTS,starts_at:TENAX_START,ends_at:TENAX_END,promotion_module:promotion.constructor.name}
  writeFileSync(output,JSON.stringify(report,null,2),{mode:0o600})
  if(process.env.ARDMAG_TENAX_PUBLISH_NOTICE === "1") {
    const proof=JSON.parse(readFileSync(process.env.ARDMAG_TENAX_CART_PROOF!,"utf8"))
    const proofAge=Date.now()-Date.parse(proof.verified_at)
    if(proof.success!==true || proof.backend!=="https://medusa-staging-a4fc.up.railway.app" || !(proofAge>=0 && proofAge<=3600000)) throw new Error("Fresh staging cart proof required before disclosure")
    if(existingLists.length!==1||existingPromos.length!==1)throw new Error("Campaign not configured")
    await updateProductsWorkflow(container).run({input:{products:[{id:solid.id,metadata:{...solid.metadata,tenax_promotion:{starts_at:TENAX_START,ends_at:TENAX_END,quantity_variant_ids:[...SOLIDO_1L_VARIANTS],min_quantity:12,discount_percent:20}}}]}})
    console.log("Promotion notice published after verified live carts")
    return
  }
  if(!report.apply)return
  if(!process.env.ARDMAG_TENAX_BACKUP)throw new Error("Staging backup path required")
  const backup=statSync(process.env.ARDMAG_TENAX_BACKUP)
  if(backup.size<10000||Date.now()-backup.mtimeMs>7200000)throw new Error("Fresh complete staging backup required")
  if(existingLists.length||existingPromos.length)throw new Error("Campaign already exists: reconcile explicitly, do not duplicate")
  const {result:lists}=await createPriceListsWorkflow(container).run({input:{price_lists_data:[{title,description:"Andrei WhatsApp 2026-10-01: mastici Tenax -20%; fara cele 3 intaritoare, solutii sau accesorii. Solido 1L alb/bej/negru are prag mixt separat.",status:"active",starts_at:TENAX_START,ends_at:new Date(Date.parse(TENAX_END)-1).toISOString(),prices}]}})
  report.price_list_id=lists[0].id
  writeFileSync(output,JSON.stringify(report,null,2),{mode:0o600})
  try{
    const {result:promos}=await createPromotionsWorkflow(container).run({input:{promotionsData:[{code,type:"standard",status:"active",is_automatic:true,campaign:{name:"Tenax Solido 1L mix 12 -20%",campaign_identifier:code,starts_at:new Date(TENAX_START),ends_at:new Date(TENAX_END)},rules:[{attribute:TENAX_QUANTITY_ATTRIBUTE,operator:"gte",values:["12"]}],application_method:{type:"percentage",target_type:"items",allocation:"across",value:20,currency_code:"ron",target_rules:[{attribute:"items.variant_id",operator:"in",values:[...SOLIDO_1L_VARIANTS]}]}}]}})
    report.promotion_id=promos[0].id
  }catch(error){
    // Make the newly created price list inactive if the coordinated setup fails.
    await pricing.updatePriceLists(lists.map((l:any)=>({id:l.id,status:"draft"})))
    if(report.promotion_id)await promotion.updatePromotions([{id:report.promotion_id,status:"draft"}])
    report.rolled_back_to_draft=true
    writeFileSync(output,JSON.stringify(report,null,2),{mode:0o600})
    throw error
  }
  report.price_list_id=lists[0].id
  try {
  const {data:after}=await query.graph({entity:"product",fields:["id","handle","variants.id","variants.price_set.prices.*"],pagination:{take:200}})
  for(const before of baseline){const v=after.find(p=>p.id===before.product_id)?.variants.find((v:any)=>v.id===before.variant_id);const price=v?.price_set?.prices.find((p:any)=>p.id===before.base_price_id);if(Number(price?.amount)!==before.base_amount)throw new Error("Base price changed")}
  } catch(error) {
    await pricing.updatePriceLists([{id:report.price_list_id,status:"draft"}])
    await promotion.updatePromotions([{id:report.promotion_id,status:"draft"}])
    report.rolled_back_to_draft=true
    writeFileSync(output,JSON.stringify(report,null,2),{mode:0o600})
    throw error
  }
  report.base_prices_preserved=true
  writeFileSync(output,JSON.stringify(report,null,2),{mode:0o600})
  console.log(JSON.stringify({staging:true,price_list_id:report.price_list_id,promotion_id:report.promotion_id,rest_variants:prices.length,conditional_variants:3}))
}
