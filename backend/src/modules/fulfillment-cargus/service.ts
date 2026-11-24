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
import {
  CargusQuoteError,
  quoteCargus,
  quoteCargusCashOnDelivery,
} from "./lib/api";
import { fallbackTariff } from "./lib/fallback-tariff";
import {
  CARGUS_PAYMENT_DATA_KEY,
  cargusPaymentMode,
} from "../../lib/checkout/delivery-payment-policy";

type InjectedDeps = { logger: Logger };
const FREE_SHIPPING_THRESHOLD_RON = 500;
const ORIGIN = { county: "Cluj", locality: "Cluj-Napoca" };

function amount(value: unknown): number | null {
  if (value == null) return null;
  const raw =
    typeof value === "object" && value !== null && "numeric" in value
      ? (value as { numeric: unknown }).numeric
      : value;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

// Suma de produse pe care curierul o incaseaza: totalul articolelor dupa reduceri, cu TVA.
// Transportul se adauga separat, in iteratia de ramburs.
export function cashOnDeliveryGoodsRon(
  context: Record<string, unknown>,
  items: ShippingContextItem[]
): number {
  const itemTotal = amount(context.item_total);
  if (itemTotal != null && itemTotal >= 0) return itemTotal;
  const fromItems = items.reduce<number | null>((sum, item) => {
    const total = amount((item as { total?: unknown }).total);
    return sum == null || total == null ? null : sum + total;
  }, 0);
  return fromItems ?? getItemsTotalRon(items);
}

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
    data: Record<string, unknown>,
    context: Record<string, unknown>
  ) {
    const items = (context.items as ShippingContextItem[]) ?? [];
    const address = context.shipping_address as
      | { province?: string; city?: string; postal_code?: string }
      | undefined;
    const payment = cargusPaymentMode(data);
    const totalWeightKg = await computeTotalWeightKg(items, (error) => {
      this.logger.warn(
        `[Cargus] variant weight lookup failed: ${error.message}`
      );
    });
    const itemTotal = getItemsTotalRon(items);

    if (itemTotal >= FREE_SHIPPING_THRESHOLD_RON) {
      this.logger.info(
        `[Cargus] quote source=free-shipping payment=${payment} weight=${totalWeightKg}kg`
      );
      return { calculated_amount: 0, is_calculated_price_tax_inclusive: true };
    }

    const codGoods =
      payment === "cod" ? cashOnDeliveryGoodsRon(context, items) : undefined;
    const fallback = (reason: string, remoteLocality = false) => {
      const value = fallbackTariff({
        weightKg: totalWeightKg,
        declaredValueRon: itemTotal,
        cashOnDeliveryGoodsRon: codGoods,
        remoteLocality,
      });
      return { value, reason };
    };

    const startedAt = Date.now();
    let result: { value: number; reason?: string };
    if (!process.env.CARGUS_API_KEY) {
      result = fallback("key-unset");
    } else {
      try {
        const request = {
          origin: ORIGIN,
          destination: {
            county: address?.province?.trim() || "",
            locality: address?.city?.trim() || "",
            postalCode: address?.postal_code || undefined,
          },
          parcels: 1,
          totalWeightKg: Math.max(totalWeightKg, 0.1),
          declaredValueRon: itemTotal,
          shipmentPayer: "sender" as const,
        };
        const value =
          codGoods == null
            ? await quoteCargus(request)
            : await quoteCargusCashOnDelivery(request, codGoods);
        result = { value };
      } catch (error) {
        const reason =
          error instanceof CargusQuoteError ? error.reason : "api-error";
        result = fallback(
          reason,
          reason === "locality-unmatched" || reason === "county-unmatched"
        );
      }
    }

    const latency = Date.now() - startedAt;
    if (result.reason) {
      this.logger.warn(
        `[Cargus] quote source=static-fallback reason=${result.reason} payment=${payment} weight=${totalWeightKg}kg amount=${result.value} latency_ms=${latency}`
      );
    } else {
      this.logger.info(
        `[Cargus] quote source=cargus-api payment=${payment} weight=${totalWeightKg}kg amount=${result.value} latency_ms=${latency}`
      );
    }
    return {
      calculated_amount: result.value,
      is_calculated_price_tax_inclusive: true,
    };
  }

  // Pastram numai modul de plata: Medusa il retrimite la fiecare recalculare a cosului.
  async validateFulfillmentData(
    _optionData: Record<string, unknown>,
    data: Record<string, unknown>,
    _context: Record<string, unknown>
  ) {
    return { [CARGUS_PAYMENT_DATA_KEY]: cargusPaymentMode(data) };
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
