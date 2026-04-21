import { Module } from "@medusajs/framework/utils"
import { Smtp2goNotificationService } from "./service"

export const SMTP2GO_MODULE = "smtp2go"

export default Module(SMTP2GO_MODULE, {
  service: Smtp2goNotificationService,
})
