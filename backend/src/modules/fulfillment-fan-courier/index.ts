import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import { FanCourierProviderService } from "./service"

export default ModuleProvider(Modules.FULFILLMENT, {
  services: [FanCourierProviderService],
})
