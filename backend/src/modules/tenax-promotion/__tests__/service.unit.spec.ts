import TenaxPromotionService from "../service"
import { PromotionModuleService } from "@medusajs/promotion/dist/services"
import { SOLIDO_1L_VARIANTS } from "../policy"
it("overwrites a forged threshold while forwarding native options and shared transaction context",async()=>{
  const native=jest.spyOn(PromotionModuleService.prototype,"computeActions").mockResolvedValue([])
  try {
    const context:any={items:[{variant_id:SOLIDO_1L_VARIANTS[0],quantity:11}],ardmag_tenax_solido_1l_quantity:999}
    const options={prevent_auto_promotions:false},shared={}
    await TenaxPromotionService.prototype.computeActions.call({} as any,["other-code"],context,options,shared)
    expect(native).toHaveBeenCalledWith(["other-code"],{...context,ardmag_tenax_solido_1l_quantity:11},options,shared)
    expect(context.ardmag_tenax_solido_1l_quantity).toBe(999)
  }finally{native.mockRestore()}
})
