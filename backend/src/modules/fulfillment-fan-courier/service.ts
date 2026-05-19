import { AbstractFulfillmentProviderService } from "@medusajs/framework/utils"
import { Logger, CreateShippingOptionDTO } from "@medusajs/framework/types"
import { fallbackTariff } from "./lib/fallback-tariff"
import { getToken } from "./lib/token-cache"
import { getInternalTariff } from "./lib/api"
import { fetchVariantWeights } from "./lib/variant-weights"

type InjectedDeps = { logger: Logger }

const DEFAULT_WEIGHT_G = 1000

type ContextItem = {
  quantity: number
  variant_id?: string | null
  variant?: { weight?: number | null } | null
  unit_price?: number | string | null
  subtotal?: number | string | null
}

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

  private async computeTotalKg(items: ContextItem[]): Promise<number> {
    if (items.length === 0) return 0

    const idsToFetch: string[] = []
    for (const it of items) {
      if (typeof it.variant?.weight !== "number" && it.variant_id) {
        idsToFetch.push(it.variant_id)
      }
    }

    let weightMap: Map<string, number> = new Map()
    if (idsToFetch.length > 0) {
      try {
        weightMap = await fetchVariantWeights(idsToFetch)
      } catch (err) {
        this.logger.warn(`[FanCourier] fetchVariantWeights failed: ${(err as Error).message}`)
      }
    }

    let totalG = 0
    for (const it of items) {
      const fromContext = typeof it.variant?.weight === "number" ? it.variant.weight : null
      const fromDb = it.variant_id ? weightMap.get(it.variant_id) ?? null : null
      const w = fromContext ?? fromDb ?? DEFAULT_WEIGHT_G
      totalG += w * (it.quantity || 0)
    }
    return totalG / 1000
  }

  async calculatePrice(
    _optionData: Record<string, unknown>,
    _data: Record<string, unknown>,
    context: Record<string, unknown>
  ) {
    const items = (context.items as ContextItem[]) ?? []
    const addr = context.shipping_address as { province?: string; city?: string } | undefined

    const totalKg = await this.computeTotalKg(items)
    const county = addr?.province || "Cluj"
    const locality = addr?.city || "Cluj-Napoca"

    // Free shipping policy: comenzi peste 500 RON valoare produse -> gratuit.
    const itemTotal = items.reduce((sum, it) => {
      const subtotal = it.subtotal != null ? Number(it.subtotal) : 0
      if (subtotal > 0) return sum + subtotal
      const unitPrice = it.unit_price != null ? Number(it.unit_price) : 0
      return sum + unitPrice * (it.quantity || 0)
    }, 0)

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
