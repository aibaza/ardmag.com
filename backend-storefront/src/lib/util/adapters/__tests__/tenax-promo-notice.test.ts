import { describe,it,expect } from "vitest"
import { tenaxPromoNotice } from "../tenax-promo-notice"
const p:any={metadata:{tenax_promotion:{starts_at:"2026-09-30T21:00:00Z",ends_at:"2026-12-31T22:00:00Z",discount_percent:20,min_quantity:12,quantity_variant_ids:["white","beige","black","jura"]}}}
describe("Tenax quantity promotion disclosure",()=>{
  it("explains mixed colors and cart discount during campaign",()=>expect(tenaxPromoNotice(p,"white",Date.parse("2026-10-01T12:00:00Z"))).toContain("12 bucăți, culori combinate"))
  it("includes Jura in the mixed-color notice",()=>expect(tenaxPromoNotice(p,"jura",Date.parse("2026-10-02T12:00:00Z"))).toContain("Jura"))
  it("does not advertise conditional discount for a different variant",()=>expect(tenaxPromoNotice(p,"jura-18l",Date.parse("2026-10-01T12:00:00Z"))).toBeUndefined())
  it.each(["2026-09-30T20:59:59Z","2026-12-31T22:00:00Z"])("hides outside campaign %s",date=>expect(tenaxPromoNotice(p,"white",Date.parse(date))).toBeUndefined())
  it("does not affect products without campaign metadata",()=>expect(tenaxPromoNotice({metadata:{}} as any)).toBeUndefined())
})
