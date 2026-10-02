import type { HttpTypes } from "@medusajs/types"

export function availablePaymentProviders(providers: Array<(HttpTypes.StorePaymentProvider & { is_enabled?: boolean }) | null>) {
  return providers
    .filter((provider): provider is HttpTypes.StorePaymentProvider =>
      provider != null && typeof provider.id === "string" && provider.id.length > 0 && provider.is_enabled !== false
    )
    .sort((a, b) => a.id.localeCompare(b.id))
}
