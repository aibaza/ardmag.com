import { PromotionModuleService } from "@medusajs/promotion/dist/services"
import { solidoQuantity, TENAX_QUANTITY_ATTRIBUTE } from "./policy"
export default class TenaxPromotionService extends PromotionModuleService {
  async computeActions(...args: Parameters<PromotionModuleService["computeActions"]>) {
    args[1] = {...args[1], [TENAX_QUANTITY_ATTRIBUTE]: solidoQuantity(args[1].items ?? [])}
    return super.computeActions(...args)
  }
}
