import { Module, Modules, ModulesSdkUtils, toMikroOrmEntities } from "@medusajs/framework/utils"
import * as nativeModels from "@medusajs/promotion/dist/models"
import { dirname, join } from "node:path"
import TenaxPromotionService from "./service"

// Keep native entities and native migration history; only computeActions is extended.
const loadNativeConnection = ModulesSdkUtils.mikroOrmConnectionLoaderFactory({
  moduleName: Modules.PROMOTION,
  moduleModels: toMikroOrmEntities(Object.values(nativeModels)),
  migrationsPath: join(dirname(require.resolve("@medusajs/promotion")), "migrations"),
})
async function connectionLoader(...args: Parameters<typeof loadNativeConnection>) {
  return loadNativeConnection(...args)
}
export default Module(Modules.PROMOTION, {service: TenaxPromotionService, loaders:[connectionLoader]})
