import { AbstractFulfillmentProviderService } from "@medusajs/framework/utils"
import { Logger, CreateShippingOptionDTO } from "@medusajs/framework/types"
import { fallbackTariff } from "./lib/fallback-tariff"
import { getToken } from "./lib/token-cache"
import { getInternalTariff } from "./lib/api"
import {
  computeTotalWeightKg,
  getItemsTotalRon,
  ShippingContextItem,
} from "../fulfillment-shared/weight"

type InjectedDeps = { logger: Logger }

// Politica ARDmag.ro: livrare gratuita pentru comenzi peste 500 RON valoare produse.
const FREE_SHIPPING_THRESHOLD_RON = 500

export class FanCourierProviderService extends AbstractFulfillmentProviderService {
  static identifier = "fan-courier"

  private logger: Logger

  constructor({ logger }: InjectedDeps) {
    super()
    this.logger = logger
  }

  async getFulfillmentOptions() {
    return [{ id: "fan-courier-standard" }]
  }

  async validateOption(_data: Record<string, unknown>) {
    return true
  }

  async canCalculate(_data: CreateShippingOptionDTO) {
    return true
  }

  async calculatePrice(
    _optionData: Record<string, unknown>,
    _data: Record<string, unknown>,
    context: Record<string, unknown>
  ) {
    const items = (context.items as ShippingContextItem[]) ?? []
    const addr = context.shipping_address as { province?: string; city?: string } | undefined

    const totalKg = await computeTotalWeightKg(items, (error) => {
      this.logger.warn(`[FanCourier] fetchVariantWeights failed: ${error.message}`)
    })
    const county = addr?.province || "Cluj"
    const locality = addr?.city || "Cluj-Napoca"

    // Free shipping policy: comenzi peste 500 RON valoare produse -> gratuit.
    const itemTotal = getItemsTotalRon(items)

    if (itemTotal >= FREE_SHIPPING_THRESHOLD_RON) {
      this.logger.info(`[FanCourier] calc: ${items.length} items, ${totalKg}kg, item_total=${itemTotal} RON >= ${FREE_SHIPPING_THRESHOLD_RON} -> FREE SHIPPING`)
      return {
        calculated_amount: 0,
        is_calculated_price_tax_inclusive: true,
      }
    }

    this.logger.info(`[FanCourier] calc: ${items.length} items, ${totalKg}kg, item_total=${itemTotal} RON -> ${county}/${locality}`)

    const hasCredentials =
      process.env.FAN_COURIER_USERNAME &&
      process.env.FAN_COURIER_PASSWORD &&
      process.env.FAN_COURIER_CLIENT_ID

    if (!hasCredentials) {
      return {
        calculated_amount: fallbackTariff(totalKg),
        is_calculated_price_tax_inclusive: true,
      }
    }

    try {
      const token = await getToken()
      const total = await getInternalTariff({ token, weight: Math.max(totalKg, 0.1), county, locality })
      return {
        calculated_amount: Math.round(total * 100) / 100,
        is_calculated_price_tax_inclusive: true,
      }
    } catch (err) {
      this.logger.error("[FanCourier] calculatePrice failed, using fallback", err as Error)
      return {
        calculated_amount: fallbackTariff(totalKg),
        is_calculated_price_tax_inclusive: true,
      }
    }
  }

  async validateFulfillmentData(
    _optionData: Record<string, unknown>,
    data: Record<string, unknown>,
    _context: Record<string, unknown>
  ) {
    return data
  }

  async createFulfillment() {
    return { data: {}, labels: [] }
  }

  async cancelFulfillment() {
    return {}
  }

  async createReturnFulfillment() {
    return { data: {}, labels: [] }
  }
}
