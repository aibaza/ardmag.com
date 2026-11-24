/**
 * Creeaza optiunea de livrare calculata "Cargus" (provider cargus_cargus), idempotent.
 *
 * Copiaza zona de livrare, profilul si regulile de la optiunea Fan Courier activa,
 * ca Cargus sa apara exact unde apare Fan. Ridicarea personala si Fan nu se modifica.
 *
 * Implicit ruleaza pe uscat (nu scrie nimic). Aplicarea cere argumentul "apply":
 *   npx medusa exec ./src/scripts/setup-cargus-shipping-option.js            # pe uscat
 *   npx medusa exec ./src/scripts/setup-cargus-shipping-option.js apply      # aplica
 *
 * Cere providerul Cargus incarcat, adica CARGUS_CHECKOUT_ENABLED=true in mediul procesului.
 */
import type { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { createShippingOptionsWorkflow } from "@medusajs/medusa/core-flows"

const CARGUS_PROVIDER_ID = "cargus_cargus"
const FAN_PROVIDER_ID = "fan-courier_fan-courier"

type Rule = { attribute: string; operator: string; value: unknown }

export function planCargusOption(state: {
  fanOptions: Array<{ id: string; service_zone_id: string; shipping_profile_id: string; rules?: Rule[] }>
  cargusOptions: Array<{ id: string; service_zone_id: string; price_type: string }>
  providerEnabled: boolean
  zoneLocationIds: string[]
  locationsWithCargus: string[]
}):
  | { action: "abort"; reason: string }
  | { action: "noop"; optionId: string }
  | { action: "create"; serviceZoneId: string; shippingProfileId: string; rules: Rule[]; linkLocations: string[] } {
  if (!state.providerEnabled) return { action: "abort", reason: "providerul cargus_cargus nu este incarcat (CARGUS_CHECKOUT_ENABLED=true si redeploy)" }
  if (state.fanOptions.length !== 1) return { action: "abort", reason: `astept exact o optiune Fan Courier activa, gasite ${state.fanOptions.length}` }
  const fan = state.fanOptions[0]
  const existing = state.cargusOptions.filter((o) => o.service_zone_id === fan.service_zone_id)
  if (existing.length > 1) return { action: "abort", reason: `exista ${existing.length} optiuni Cargus active in zona; curata manual` }
  if (existing.length === 1) {
    if (existing[0].price_type !== "calculated") return { action: "abort", reason: `optiunea Cargus ${existing[0].id} exista dar nu este calculata` }
    return { action: "noop", optionId: existing[0].id }
  }
  if (!state.zoneLocationIds.length) return { action: "abort", reason: "zona Fan nu are depozit asociat" }
  return {
    action: "create",
    serviceZoneId: fan.service_zone_id,
    shippingProfileId: fan.shipping_profile_id,
    rules: (fan.rules ?? []).map(({ attribute, operator, value }) => ({ attribute, operator, value })),
    linkLocations: state.zoneLocationIds.filter((id) => !state.locationsWithCargus.includes(id)),
  }
}

export default async function setupCargusShippingOption({ container, args }: ExecArgs) {
  const apply = (args ?? []).includes("apply") || process.argv.includes("apply")
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const fulfillment = container.resolve(Modules.FULFILLMENT)
  const log = (m: string) => console.log(`[setup-cargus] ${m}`)

  const providers = await fulfillment.listFulfillmentProviders({ id: [CARGUS_PROVIDER_ID] })
  const providerEnabled = providers.some((p: any) => p.id === CARGUS_PROVIDER_ID && p.is_enabled !== false)

  const { data: options } = await query.graph({
    entity: "shipping_option",
    fields: ["id", "name", "price_type", "provider_id", "service_zone_id", "shipping_profile_id", "rules.attribute", "rules.operator", "rules.value"],
    filters: { provider_id: [FAN_PROVIDER_ID, CARGUS_PROVIDER_ID] },
  })
  const fanOptions = options.filter((o: any) => o.provider_id === FAN_PROVIDER_ID && o.price_type === "calculated")
  const cargusOptions = options.filter((o: any) => o.provider_id === CARGUS_PROVIDER_ID)

  let zoneLocationIds: string[] = []
  let locationsWithCargus: string[] = []
  if (fanOptions.length === 1) {
    const { data: zones } = await query.graph({
      entity: "service_zone",
      fields: ["id", "name", "fulfillment_set.locations.id", "fulfillment_set.locations.name", "fulfillment_set.locations.fulfillment_providers.id"],
      filters: { id: fanOptions[0].service_zone_id },
    })
    const locations = ((zones?.[0] as any)?.fulfillment_set?.locations ?? []).filter(Boolean)
    zoneLocationIds = locations.map((l: any) => l.id)
    locationsWithCargus = locations
      .filter((l: any) => (l.fulfillment_providers ?? []).some((p: any) => p?.id === CARGUS_PROVIDER_ID))
      .map((l: any) => l.id)
    log(`zona ${(zones?.[0] as any)?.name} (${fanOptions[0].service_zone_id}); depozite: ${locations.map((l: any) => `${l.name} ${l.id} [${(l.fulfillment_providers ?? []).filter(Boolean).map((p: any) => p.id).join(",") || "fara provideri"}]`).join("; ")}`)
  }

  const plan = planCargusOption({ fanOptions: fanOptions as any, cargusOptions: cargusOptions as any, providerEnabled, zoneLocationIds, locationsWithCargus })
  log(`mod: ${apply ? "APLICARE" : "pe uscat"}; plan: ${JSON.stringify(plan)}`)
  if (plan.action === "abort") throw new Error(`[setup-cargus] oprit: ${plan.reason}`)
  if (plan.action === "noop") { log(`nimic de facut: optiunea Cargus ${plan.optionId} exista`); return }
  if (!apply) { log("pe uscat: nu s-a scris nimic. Ruleaza cu argumentul apply pentru aplicare."); return }

  for (const locationId of plan.linkLocations) {
    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: locationId },
      [Modules.FULFILLMENT]: { fulfillment_provider_id: CARGUS_PROVIDER_ID },
    })
    log(`legat depozitul ${locationId} de ${CARGUS_PROVIDER_ID}`)
  }

  const { result } = await createShippingOptionsWorkflow(container).run({
    input: [{
      name: "Cargus",
      price_type: "calculated",
      provider_id: CARGUS_PROVIDER_ID,
      data: { id: "cargus-standard" },
      service_zone_id: plan.serviceZoneId,
      shipping_profile_id: plan.shippingProfileId,
      type: { label: "Cargus", description: "Livrare prin curier Cargus", code: "cargus" },
      rules: plan.rules as any,
    }],
  })
  log(`creata optiunea Cargus ${result?.[0]?.id}`)
}
