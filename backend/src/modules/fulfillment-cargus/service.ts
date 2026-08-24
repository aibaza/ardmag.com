import { AbstractFulfillmentProviderService } from "@medusajs/framework/utils";
import type {
  CreateShippingOptionDTO,
  Logger,
} from "@medusajs/framework/types";
import {
  computeTotalWeightKg,
  getItemsTotalRon,
  ShippingContextItem,
} from "../fulfillment-shared/weight";
import { quoteCargus } from "./lib/api";
import { fallbackTariff } from "./lib/fallback-tariff";

type InjectedDeps = { logger: Logger };
const FREE_SHIPPING_THRESHOLD_RON = 500;

export class CargusProviderService extends AbstractFulfillmentProviderService {
  static identifier = "cargus";
  private logger: Logger;

  constructor({ logger }: InjectedDeps) {
    super();
    this.logger = logger;
  }

  async getFulfillmentOptions() {
    return [{ id: "cargus-standard" }];
  }
  async validateOption(_data: Record<string, unknown>) {
    return true;
  }
  async canCalculate(_data: CreateShippingOptionDTO) {
    return true;
  }

  async calculatePrice(
    _optionData: Record<string, unknown>,
    _data: Record<string, unknown>,
    context: Record<string, unknown>
  ) {
    const items = (context.items as ShippingContextItem[]) ?? [];
    const address = context.shipping_address as
      | { province?: string; city?: string }
      | undefined;
    const totalWeightKg = await computeTotalWeightKg(items, (error) => {
      this.logger.warn(
        `[Cargus] variant weight lookup failed: ${error.message}`
      );
    });
    const itemTotal = getItemsTotalRon(items);

    if (itemTotal >= FREE_SHIPPING_THRESHOLD_RON) {
      this.logger.info(
        `[Cargus] quote source=free-shipping weight=${totalWeightKg}kg`
      );
      return { calculated_amount: 0, is_calculated_price_tax_inclusive: true };
    }

    if (!process.env.CARGUS_API_KEY) {
      this.logger.info(
        `[Cargus] quote source=static-fallback reason=key-unset`
      );
      return {
        calculated_amount: fallbackTariff(totalWeightKg),
        is_calculated_price_tax_inclusive: true,
      };
    }

    const startedAt = Date.now();
    try {
      const amount = await quoteCargus({
        origin: { county: "Cluj", locality: "Cluj-Napoca" },
        destination: {
          county: address?.province || "Cluj",
          locality: address?.city || "Cluj-Napoca",
        },
        parcels: 1,
        totalWeightKg: Math.max(totalWeightKg, 0.1),
        declaredValueRon: itemTotal,
        shipmentPayer: "sender",
      });
      this.logger.info(
        `[Cargus] quote source=cargus-api latency_ms=${Date.now() - startedAt}`
      );
      return {
        calculated_amount: amount,
        is_calculated_price_tax_inclusive: true,
      };
    } catch (error) {
      this.logger.warn(
        `[Cargus] quote source=static-fallback latency_ms=${
          Date.now() - startedAt
        } error=${(error as Error).name}`
      );
      return {
        calculated_amount: fallbackTariff(totalWeightKg),
        is_calculated_price_tax_inclusive: true,
      };
    }
  }

  async validateFulfillmentData(
    _optionData: Record<string, unknown>,
    data: Record<string, unknown>,
    _context: Record<string, unknown>
  ) {
    return data;
  }

  // Fulfillment-ul operational ramane manual. Providerul nu creeaza, tipareste sau anuleaza AWB-uri.
  async createFulfillment() {
    return { data: {}, labels: [] };
  }
  async cancelFulfillment() {
    return {};
  }
  async createReturnFulfillment() {
    return { data: {}, labels: [] };
  }
}
