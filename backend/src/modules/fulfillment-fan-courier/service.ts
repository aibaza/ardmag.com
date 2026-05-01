import { AbstractFulfillmentProviderService } from "@medusajs/framework/utils"
import { Logger, CreateShippingOptionDTO } from "@medusajs/framework/types"
import { fallbackTariff } from "./lib/fallback-tariff"
import { totalWeightGrams } from "./lib/weight"
import { getToken } from "./lib/token-cache"
import { getInternalTariff } from "./lib/api"

type InjectedDeps = { logger: Logger }

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
    const items = (context.items as Array<{ quantity: number; variant?: { weight?: number | null } | null }>) ?? []
    const addr = context.shipping_address as { province?: string; city?: string } | undefined

    const totalKg = totalWeightGrams(items) / 1000
    const county = addr?.province || "Cluj"
    const locality = addr?.city || "Cluj-Napoca"

    const hasCredentials =
      process.env.FAN_COURIER_USERNAME &&
      process.env.FAN_COURIER_PASSWORD &&
      process.env.FAN_COURIER_CLIENT_ID

    if (!hasCredentials) {
      return {
        calculated_amount: fallbackTariff(totalKg) * 100,
        is_calculated_price_tax_inclusive: true,
      }
    }

    try {
      const token = await getToken()
      const total = await getInternalTariff({ token, weight: Math.max(totalKg, 0.1), county, locality })
      return {
        calculated_amount: Math.round(total * 100),
        is_calculated_price_tax_inclusive: true,
      }
    } catch (err) {
      this.logger.error("[FanCourier] calculatePrice failed, using fallback", err as Error)
      return {
        calculated_amount: fallbackTariff(totalKg) * 100,
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
    // Faza 2: genereaza AWB prin POST /intern-awb
    return { data: {}, labels: [] }
  }

  async cancelFulfillment() {
    return {}
  }

  async createReturnFulfillment() {
    return { data: {}, labels: [] }
  }
}
