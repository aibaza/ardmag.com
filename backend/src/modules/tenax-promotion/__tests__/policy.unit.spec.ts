import { solidoQuantity, SOLIDO_1L_VARIANTS } from "../policy"
import { areRulesValidForContext } from "@medusajs/promotion/dist/utils/validations/promotion-rule"
import { getComputedActionsForItems } from "@medusajs/promotion/dist/utils/compute-actions/line-items"

function calculate(quantities: number[], extras: Array<{variant_id:string;quantity:number}> = []) {
  const items = [...quantities.map((quantity, i) => ({variant_id: SOLIDO_1L_VARIANTS[i],quantity})),...extras]
    .map((item, i) => ({...item,id:`item_${i}`,subtotal:item.quantity*76,original_total:item.quantity*76,is_discountable:true}))
  const promotion:any={code:"TENAX-SOLIDO-20",is_tax_inclusive:false,rules:[{attribute:"ardmag_tenax_solido_1l_quantity",operator:"gte",values:[{value:"12"}]}],application_method:{type:"percentage",target_type:"items",allocation:"across",value:20,target_rules:[{attribute:"items.variant_id",operator:"in",values:SOLIDO_1L_VARIANTS.map(value=>({value}))}]}}
  const context={items,ardmag_tenax_solido_1l_quantity:solidoQuantity(items)}
  return areRulesValidForContext(promotion.rules,context as any,"order") ? getComputedActionsForItems(promotion,items as any,new Map()) : []
}
describe("Tenax mixed-color quantity using the native Medusa rule and adjustment engine",()=>{
  it("discounts all 12 units of 4 white + 4 beige + 4 black by 20%",()=>{
    const actions=calculate([4,4,4]);expect(actions).toHaveLength(3)
    expect(actions.reduce((s:any,a:any)=>s+Number(a.amount),0)).toBeCloseTo(182.4)
  })
  it("does not discount 11 eligible units",()=>expect(calculate([4,4,3])).toEqual([]))
  it("does not count larger packs, hardener or unrelated variants toward 12",()=>expect(calculate([4,4,3],[{variant_id:"variant_01KPH3PYSKZRTTFQSG4P1ZBPTF",quantity:100},{variant_id:"variant_01KPH3QGRB4APWNGMJ4DTFJA1X",quantity:100}])).toEqual([]))
  it("never discounts excluded products in an otherwise qualifying cart",()=>expect(calculate([4,4,4],[{variant_id:"excluded",quantity:20}])).toHaveLength(3))
  it("qualifies one color with 12 units and quantities above 12",()=>{
    expect(calculate([12,0,0])).toHaveLength(1);expect(calculate([5,5,5])).toHaveLength(3)
  })
  it("includes Jura alone and mixed with the other three colors",()=>{
    expect(calculate([0,0,0,12])).toHaveLength(1)
    const actions=calculate([3,3,3,3]);expect(actions).toHaveLength(4)
    expect(actions.reduce((s:any,a:any)=>s+Number(a.amount),0)).toBeCloseTo(182.4)
    expect(calculate([3,3,3,2])).toEqual([])
  })
  it("ignores invalid quantities",()=>expect(solidoQuantity([{variant_id:SOLIDO_1L_VARIANTS[0],quantity:-1},{variant_id:SOLIDO_1L_VARIANTS[1],quantity:1.5},{variant_id:SOLIDO_1L_VARIANTS[2],quantity:NaN}])).toBe(0))
})
