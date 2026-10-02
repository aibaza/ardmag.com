import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createPriceListsWorkflow, createPromotionsWorkflow, createProductsWorkflow, createInventoryLevelsWorkflow, updateProductsWorkflow } from "@medusajs/medusa/core-flows"
import { readFileSync, writeFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { createHash } from "node:crypto"
import { SOLIDO_1L_VARIANTS, TENAX_QUANTITY_ATTRIBUTE, TENAX_START, TENAX_END } from "../modules/tenax-promotion/policy"

const handles = ["mastic-lichid","mastic-semisolid-wet","mastic-semisolid","tixo-xe-transparent","mastic-solid","mastic-thassos","glaxs-easy","set-adeziv-profesional-decapant","gravity-solid-extra-clear","strongedge-45-epoxy-solid-transparent","rivo-epoxy-solid","fixtop-epoxy-solid","fast-glaxs-glue-cartus","kit-colla-glaxs-transparent","eliox-epoxy-solid-extra-clear","domo-10-epoxy-solid"]
const code = "TENAX-SOLIDO-20-MIX12-2026Q4"
const timestamp = (value: unknown) => value instanceof Date ? value.getTime() : Date.parse(String(value))
export default async function release({ container }: ExecArgs) {
  const db = new URL(process.env.DATABASE_URL ?? "")
  if (process.env.ARDMAG_PRODUCTION_ENVIRONMENT_ID !== "7f5d3fcc-e6f7-4196-8dd5-20c28faf3ee7" || process.env.RAILWAY_ENVIRONMENT_ID !== "7f5d3fcc-e6f7-4196-8dd5-20c28faf3ee7" || db.hostname !== "shinkansen.proxy.rlwy.net" || db.port !== "29130") throw new Error("Verified production target required")
  const dir = process.env.ARDMAG_RELEASE_DIR!
  const backup = statSync(join(dir, "production-before.dump"))
  if (backup.size < 10000 || Date.now() - backup.mtimeMs > 4*3600000) throw new Error("Fresh full production backup required")
  const manifest = JSON.parse(readFileSync(join(dir, "production-price-manifest.json"), "utf8"))
  if (manifest.environment_id !== process.env.RAILWAY_ENVIRONMENT_ID || manifest.changes.length !== 354 || manifest.conflicts.length) throw new Error("Approved production manifest required")
  const approval=JSON.parse(readFileSync(join(dir,"production-data-approval.json"),"utf8"))
  const digest=(name:string)=>createHash("sha256").update(readFileSync(join(dir,name))).digest("hex")
  if(!approval.passed || approval.environment_id!==process.env.RAILWAY_ENVIRONMENT_ID || approval.manifest_sha256!==digest("production-price-manifest.json") || approval.total_wet_sha256!==digest("approved-total-wet.json")) throw new Error("Approved source hashes required")
  if(new Set(manifest.changes.map((p:any)=>p.price_id)).size!==354 || new Set(manifest.changes.map((p:any)=>p.variant_id)).size!==354 || manifest.changes.some((p:any)=>!Number.isFinite(p.amount)||p.amount<=0)) throw new Error("Unique valid manifest targets required")
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const pricing = container.resolve(Modules.PRICING)
  const promotion = container.resolve(Modules.PROMOTION)
  const { data: products } = await query.graph({entity:"product", fields:["id","handle","metadata","tags.value","shipping_profile.id","sales_channels.id","variants.id","variants.title","variants.price_set.id","variants.price_set.prices.*"], pagination:{take:200}})
  const chosen = products.filter(p => handles.includes(p.handle))
  if (chosen.length !== handles.length || !chosen.every(p => p.tags?.some((t:any) => t.value === "brand:tenax"))) throw new Error("Mastic identities changed")
  const solid:any = chosen.find(p => p.handle === "mastic-solid")
  if (SOLIDO_1L_VARIANTS.some(id => !solid.variants.some((v:any) => v.id === id))) throw new Error("Four approved Solido colors required")
  const phase = process.env.ARDMAG_RELEASE_PHASE
  const receiptPath = join(dir,"catalog-release-receipt.json")
  if (phase === "prepare") {
    if (products.some(p => p.handle === "total-wet")) throw new Error("Existing Total Wet requires reconciliation")
    const existing = await promotion.listPromotions({code})
    if (existing.length) throw new Error("Existing campaign requires reconciliation")
    const direct:any[]=[]
    for (const product of chosen) for (const v of product.variants ?? []) {
      const prices:any[] = await pricing.listPrices({price_set_id:[v.price_set!.id]},{take:100})
      const base = prices.filter(p => p.currency_code === "ron" && !p.price_list_id && p.min_quantity == null && p.max_quantity == null)
      if (base.length !== 1) throw new Error("Ambiguous base price")
      for (const id of [...new Set(prices.filter(p=>p.price_list_id).map(p=>p.price_list_id!))]) {
        const historical = await pricing.retrievePriceList(id)
        // Preserve expired historical campaigns. Any future/current overlap requires explicit reconciliation.
        if (!historical.ends_at || Date.parse(String(historical.ends_at)) >= Date.parse(TENAX_START)) throw new Error("Existing overlapping variant price list requires reconciliation")
      }
      const source = manifest.changes.find((x:any) => x.variant_id === v.id)
      const amount = source ? source.amount : Number(base[0]!.amount)
      if (!Number.isFinite(amount) || amount <= 0) throw new Error("Invalid approved base price")
      if (!SOLIDO_1L_VARIANTS.includes(v.id as any)) direct.push({variant_id:v.id,currency_code:"ron",amount:Math.round(amount*.8*100)/100})
      else if (amount !== 76) throw new Error("Unexpected Solido 1L base")
    }
    if (direct.length !== 27) throw new Error("Expected 27 direct-sale variants")
    const {result:lists}=await createPriceListsWorkflow(container).run({input:{price_lists_data:[{title:"TENAX mastici -20% 2026Q4 (except Solido 1L mix12)",description:"Andrei confirmed Oct 1-2: four Solido 1L colors mixed threshold; larger packs and other mastics direct -20%; hardeners excluded.",status:"draft",starts_at:TENAX_START,ends_at:new Date(Date.parse(TENAX_END)-1).toISOString(),prices:direct}]}})
    const receipt:any={phase:"prepared",price_list_id:lists[0].id,direct_variants:direct,base_manifest:manifest.changes}
    writeFileSync(receiptPath,JSON.stringify(receipt,null,2),{mode:0o600})
    const {result:promos}=await createPromotionsWorkflow(container).run({input:{promotionsData:[{code,type:"standard",status:"draft",is_automatic:true,campaign:{name:"Tenax Solido 1L mix12 -20%",campaign_identifier:code,starts_at:new Date(TENAX_START),ends_at:new Date(TENAX_END)},rules:[{attribute:TENAX_QUANTITY_ATTRIBUTE,operator:"gte",values:["12"]}],application_method:{type:"percentage",target_type:"items",allocation:"across",value:20,currency_code:"ron",target_rules:[{attribute:"items.variant_id",operator:"in",values:[...SOLIDO_1L_VARIANTS]}]}}]}})
    receipt.promotion_id=promos[0].id;writeFileSync(receiptPath,JSON.stringify(receipt,null,2),{mode:0o600});console.log("Inactive production campaigns prepared; catalog untouched");return
  }
  const receipt = JSON.parse(readFileSync(receiptPath,"utf8"))
  if (phase === "apply") {
    if (receipt.phase !== "prepared") throw new Error("Prepared receipt required")
    if(Date.now()-Date.parse(approval.preflight_at)>15*60000)throw new Error("Fresh production preflight required")
    const identities=new Map<string,any>()
    for(const p of products)for(const v of p.variants ?? [])for(const price of v.price_set?.prices ?? [])if(price)identities.set(price.id,{product_id:p.id,handle:p.handle,variant_id:v.id})
    for(const x of manifest.changes){const p=identities.get(x.price_id);if(!p||p.product_id!==x.product_id||p.variant_id!==x.variant_id||p.handle!==x.handle)throw new Error("Production manifest association changed")}
    const updates:any[]=[]
    for (const change of manifest.changes) {
      const matches:any[] = await pricing.listPrices({id:[change.price_id]}, {take:2}); if(matches.length!==1) throw new Error("Missing unique production price"); const price=matches[0]
      if (price.currency_code !== "ron" || price.price_list_id || price.min_quantity != null || price.max_quantity != null || Number(price.amount) !== change.production_before) throw new Error("Concurrent base price change")
      if (Number(price.amount) !== change.amount) updates.push({id:price.id,amount:change.amount})
    }
    if (updates.length !== 97) throw new Error("Expected 97 base-price corrections")
    const approved=JSON.parse(readFileSync(join(dir,"approved-total-wet.json"),"utf8"))
    if (approved.handle !== "total-wet" || approved.images.length !== 1 || approved.variants.length !== 2) throw new Error("Approved Total Wet identity changed")
    const reference:any=products.find(p => p.handle === "hydrex")
    if (!reference?.shipping_profile?.id || !reference.sales_channels?.length) throw new Error("Production fulfillment reference missing")
    const priceById=new Map(updates.map(p=>[p.id,p.amount]))
    const priceToSet=new Map<string,string>()
    for(const p of products) for(const v of p.variants ?? []) for(const price of v.price_set?.prices ?? []) {if(price)priceToSet.set(price.id,v.price_set!.id)}
    const setIds=[...new Set(updates.map(p=>{const id=priceToSet.get(p.id);if(!id)throw new Error("Price-set identity missing");return id}))]
    const baseSets:any[]=[]
    for(const id of setIds){
      const all:any[]=await pricing.listPrices({price_set_id:[id]}, {take:100})
      const base=all.filter(p=>!p.price_list_id)
      if(!base.length || base.some(p=>p.rules_count)) throw new Error("Rule-bearing base set requires separate review")
      baseSets.push({id,prices:base.map(p=>({id:p.id,currency_code:p.currency_code,amount:Number(p.amount),min_quantity:p.min_quantity,max_quantity:p.max_quantity}))})
    }
    receipt.base_sets_before=baseSets;receipt.solido_metadata_before=solid.metadata;receipt.phase="applying"
    writeFileSync(receiptPath,JSON.stringify(receipt,null,2),{mode:0o600})
    await pricing.upsertPriceSets(baseSets.map(set=>({...set,prices:set.prices.map((p:any)=>({...p,amount:priceById.get(p.id) ?? p.amount}))})))
    receipt.phase="prices-applied";writeFileSync(receiptPath,JSON.stringify(receipt,null,2),{mode:0o600})
    const {result:created}=await createProductsWorkflow(container).run({input:{products:[{title:approved.title,handle:approved.handle,description:approved.description,status:"draft",metadata:approved.metadata,thumbnail:approved.thumbnail,images:approved.images.map((i:any)=>({url:i.url})),category_ids:["pcat_01KPH383SVDBH60EZM36CEBRKY"],tag_ids:approved.tags.map((t:any)=>t.id),shipping_profile_id:reference.shipping_profile.id,sales_channels:reference.sales_channels.map((s:any)=>({id:s.id})),options:[{title:"CANTITATE",values:["1 LITRU","5 LITRI"]}],variants:[{title:"1 LITRU",sku:"DELTA-TOTAL-WET-1L",options:{CANTITATE:"1 LITRU"},manage_inventory:true,allow_backorder:false,metadata:{contact_to_order:false},prices:[{currency_code:"ron",amount:140}]},{title:"5 LITRI",sku:"DELTA-TOTAL-WET-5L",options:{CANTITATE:"5 LITRI"},manage_inventory:true,allow_backorder:false,metadata:{contact_to_order:false},prices:[{currency_code:"ron",amount:622}]}]}]}})
    receipt.total_wet_id=created[0].id;receipt.phase="prices-applied-product-draft";writeFileSync(receiptPath,JSON.stringify(receipt,null,2),{mode:0o600})
    const {data:wet}=await query.graph({entity:"product",fields:["id","variants.id","variants.title","variants.inventory_items.inventory_item_id"],filters:{id:receipt.total_wet_id}})
    const levels=wet[0].variants!.map((v:any)=>{if(v.inventory_items?.length!==1)throw new Error("New inventory link missing");return {inventory_item_id:v.inventory_items[0].inventory_item_id,location_id:"sloc_01KPH3TTXD2AD13KRV3R56ETQT",stocked_quantity:v.title==="1 LITRU"?48:60}})
    await createInventoryLevelsWorkflow(container).run({input:{inventory_levels:levels}})
    receipt.inventory_levels=levels;receipt.phase="applied";writeFileSync(receiptPath,JSON.stringify(receipt,null,2),{mode:0o600});console.log("97 prices applied; Total Wet prepared with confirmed stocks, unpublished");return
  }
  if (phase === "rollback") {
    // Operator-only compensation restores approved base targets; never restore the whole database over live customer activity.
    await pricing.updatePriceLists([{id:receipt.price_list_id,status:"draft"}])
    await promotion.updatePromotions([{id:receipt.promotion_id,status:"draft"}])
    if(receipt.base_sets_before) await pricing.upsertPriceSets(receipt.base_sets_before)
    const changes:any[]=[]
    if(receipt.total_wet_id) changes.push({id:receipt.total_wet_id,status:"draft"})
    if(receipt.solido_metadata_before) changes.push({id:solid.id,metadata:receipt.solido_metadata_before})
    if(changes.length) await updateProductsWorkflow(container).run({input:{products:changes}})
    receipt.phase="rolled-back";writeFileSync(receiptPath,JSON.stringify(receipt,null,2),{mode:0o600});console.log("Catalog compensation completed; customer/order data preserved");return
  }
  if (phase === "activate") {
    if(receipt.phase!=="applied" || promotion.constructor.name!=="TenaxPromotionService")throw new Error("Applied data and active verified extension required")
    if(Date.now()<Date.parse(TENAX_START)||Date.now()>=Date.parse(TENAX_END))throw new Error("Campaign outside confirmed interval")
    const list=await pricing.retrievePriceList(receipt.price_list_id)
    const expected:any[]=JSON.parse(readFileSync(join(dir,"approved-direct-campaign.json"),"utf8"))
    const actual:any[]=await pricing.listPrices({price_list_id:[receipt.price_list_id]},{take:100})
    if(list.status!=="draft" || timestamp(list.starts_at)!==Date.parse(TENAX_START) || timestamp(list.ends_at)!==Date.parse(TENAX_END)-1 || actual.length!==expected.length || expected.some(p=>!actual.some(a=>a.currency_code===p.currency_code && Number(a.amount)===Number(p.amount) && receipt.direct_variants.some((v:any)=>v.variant_id===p.variant_id && Number(v.amount)===Number(a.amount)))))throw new Error("Prepared direct campaign changed")
    const promos:any[]=await promotion.listPromotions({id:[receipt.promotion_id]},{relations:["rules.values","application_method.target_rules.values","campaign"]})
    const promo=promos[0],quantityRule=promo?.rules?.find((r:any)=>r.attribute===TENAX_QUANTITY_ATTRIBUTE),target=promo?.application_method?.target_rules?.find((r:any)=>r.attribute==="items.variant_id")
    if(promos.length!==1||promo.status!=="draft"||promo.code!==code||!promo.is_automatic||timestamp(promo.campaign?.starts_at)!==Date.parse(TENAX_START)||timestamp(promo.campaign?.ends_at)!==Date.parse(TENAX_END)||quantityRule?.operator!=="gte"||quantityRule.values?.[0]?.value!=="12"||promo.application_method?.value!==20||target?.values.length!==4||target.values.some((v:any)=>!SOLIDO_1L_VARIANTS.includes(v.value)))throw new Error("Prepared Solido promotion changed")
    receipt.phase="activating";writeFileSync(receiptPath,JSON.stringify(receipt,null,2),{mode:0o600})
    await pricing.updatePriceLists([{id:receipt.price_list_id,status:"active"}])
    receipt.price_list_active=true;writeFileSync(receiptPath,JSON.stringify(receipt,null,2),{mode:0o600})
    await promotion.updatePromotions([{id:receipt.promotion_id,status:"active"}]);receipt.promotion_active=true;writeFileSync(receiptPath,JSON.stringify(receipt,null,2),{mode:0o600})
    await updateProductsWorkflow(container).run({input:{products:[{id:receipt.total_wet_id,status:"published"},{id:solid.id,metadata:{...solid.metadata,tenax_promotion:{starts_at:TENAX_START,ends_at:TENAX_END,min_quantity:12,discount_percent:20,quantity_variant_ids:[...SOLIDO_1L_VARIANTS]}}}]}})
    receipt.phase="active";writeFileSync(receiptPath,JSON.stringify(receipt,null,2),{mode:0o600});console.log("Confirmed catalog, Total Wet and Tenax promotion activated");return
  }
  throw new Error("Explicit prepare/apply/activate phase required")
}
