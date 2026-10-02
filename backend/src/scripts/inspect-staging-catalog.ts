import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { writeFileSync } from "node:fs"
export default async function inspect({container}: ExecArgs) {
  if (process.env.ARDMAG_STAGING_ENVIRONMENT_ID !== 'c47689f6-eaf2-48ac-8eae-bdcf11e7c27c' || !process.env.DATABASE_URL?.includes('switchback.proxy.rlwy.net:17902')) throw new Error('Staging identity required')
  const query=container.resolve(ContainerRegistrationKeys.QUERY)
  const {data}=await query.graph({entity:'product', fields:['id','title','handle','shipping_profile.id','sales_channels.id','variants.id','variants.price_set.prices.*'], pagination:{take:100}})
  writeFileSync(process.env.ARDMAG_CATALOG_INSPECTION_PATH!,JSON.stringify(data,null,2),{mode:0o600})
  console.log(JSON.stringify({products:data.length,staging:true}))
}
