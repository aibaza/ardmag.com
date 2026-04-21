import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function setupRoPayment({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const paymentModuleService = container.resolve(Modules.PAYMENT)
  const regionModuleService = container.resolve(Modules.REGION)

  logger.info("setup-ro-payment: start")

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "payment_providers.id"],
  })

  const roRegion = regions.find((r: { name: string }) => r.name === "Romania")
  if (!roRegion) {
    logger.error("setup-ro-payment: Romania region not found — run setup-ro-shipping first")
    return
  }

  logger.info(`setup-ro-payment: Romania region id = ${roRegion.id}`)

  const availableProviders = await paymentModuleService.listPaymentProviders({}, { take: 50 })
  logger.info(`setup-ro-payment: available providers: ${availableProviders.map((p: { id: string }) => p.id).join(", ")}`)

  const stripeProvider = availableProviders.find((p: { id: string }) => p.id.includes("stripe"))
  const rambursProvider = availableProviders.find((p: { id: string }) => p.id.includes("pp_system_default") || p.id.includes("manual"))

  const currentProviderIds: string[] = (roRegion.payment_providers || []).map((p: { id: string }) => p.id)
  logger.info(`setup-ro-payment: current providers on Romania: ${currentProviderIds.join(", ") || "none"}`)

  const providersToAdd: string[] = []

  if (rambursProvider && !currentProviderIds.includes(rambursProvider.id)) {
    providersToAdd.push(rambursProvider.id)
    logger.info(`setup-ro-payment: will add ramburs provider: ${rambursProvider.id}`)
  }

  if (stripeProvider && !currentProviderIds.includes(stripeProvider.id)) {
    providersToAdd.push(stripeProvider.id)
    logger.info(`setup-ro-payment: will add stripe provider: ${stripeProvider.id}`)
  } else if (!stripeProvider) {
    logger.warn("setup-ro-payment: Stripe provider not found — set STRIPE_API_KEY and restart backend, then re-run this script")
  }

  if (providersToAdd.length === 0) {
    logger.info("setup-ro-payment: nothing to add, all providers already linked")
    return
  }

  await regionModuleService.updateRegions([{
    id: roRegion.id,
    payment_providers: [...currentProviderIds, ...providersToAdd].map((id) => ({ id })),
  }])

  logger.info(`setup-ro-payment: linked [${providersToAdd.join(", ")}] to Romania region`)
  logger.info("setup-ro-payment: done")
}
