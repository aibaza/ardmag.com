import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

type CatalogEventPayload = {
  id?: string
}

export default async function storefrontRevalidateProducts({
  event,
  container,
}: SubscriberArgs<CatalogEventPayload>) {
  const revalidateUrl = process.env.STOREFRONT_REVALIDATE_URL
  const secret = process.env.REVALIDATE_SECRET

  if (!revalidateUrl || !secret) return

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    const res = await fetch(revalidateUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-secret": secret,
      },
      body: JSON.stringify({
        secret,
        tag: "products",
        source: "medusa",
        event: event.name,
        id: event.data?.id,
      }),
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) {
      logger.warn(
        `[storefront-revalidate] ${event.name} failed with ${res.status}`
      )
      return
    }

    logger.info(`[storefront-revalidate] products tag revalidated for ${event.name}`)
  } catch (err) {
    logger.warn(`[storefront-revalidate] failed for ${event.name}: ${err}`)
  }
}

export const config: SubscriberConfig = {
  event: [
    "product.created",
    "product.updated",
    "product.deleted",
    "product-variant.created",
    "product-variant.updated",
    "product-variant.deleted",
    "price-list.created",
    "price-list.updated",
    "price-list.deleted",
  ],
  context: { subscriberId: "storefront-revalidate-products" },
}
