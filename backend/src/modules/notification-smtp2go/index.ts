import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import { Smtp2goNotificationService } from "./service"

export const SMTP2GO_MODULE = "smtp2go"

export default ModuleProvider(Modules.NOTIFICATION, {
  services: [Smtp2goNotificationService],
})
