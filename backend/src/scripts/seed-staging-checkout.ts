// @ts-nocheck
import type { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules, ProductStatus } from "@medusajs/framework/utils"
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createSalesChannelsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  updateProductsWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"

const HANDLE = "staging-checkout-test-100"

export default async function seedStagingCheckout({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const salesChannelService = container.resolve(Modules.SALES_CHANNEL)
  const storeService = container.resolve(Modules.STORE)
  const fulfillmentService = container.resolve(Modules.FULFILLMENT)

  const [store] = await storeService.listStores()
  let [salesChannel] = await salesChannelService.listSalesChannels({
    name: "Default Sales Channel",
  })
  if (!salesChannel) {
    const { result } = await createSalesChannelsWorkflow(container).run({
      input: { salesChannelsData: [{ name: "Default Sales Channel" }] },
    })
    salesChannel = result[0]
    logger.info("seed-staging-checkout: created Default Sales Channel")
  }
  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: { default_sales_channel_id: salesChannel.id },
    },
  })

  const { data: keys } = await query.graph({
    entity: "api_key",
    fields: ["id", "token"],
    filters: { type: "publishable" },
  })
  let publishableKey = keys?.[0]
  if (!publishableKey) {
    const { result } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [{
          title: "Staging storefront",
          type: "publishable",
          created_by: "",
        }],
      },
    })
    publishableKey = result[0]
    logger.info("seed-staging-checkout: created publishable API key")
  }
  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: { id: publishableKey.id, add: [salesChannel.id] },
  })

  const [shippingProfile] = await fulfillmentService.listShippingProfiles({ type: "default" })
  const { data: locations } = await query.graph({
    entity: "stock_location",
    fields: ["id"],
    filters: { name: "Depozit Cluj" },
  })
  if (!shippingProfile || !locations?.[0]) {
    logger.info("seed-staging-checkout: foundation ready; run setup-ro-shipping, then run this script again")
    return
  }

  const { data: existingCategories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name"],
    filters: { name: "Test staging" },
  })
  let category = existingCategories?.[0]
  if (!category) {
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: { product_categories: [{ name: "Test staging", is_active: true }] },
    })
    category = result[0]
    logger.info("seed-staging-checkout: created test category")
  }

  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["id", "categories.id"],
    filters: { handle: HANDLE },
  })
  if (!existingProducts?.length) {
    await createProductsWorkflow(container).run({
      input: {
        products: [{
          title: "Produs test checkout staging",
          handle: HANDLE,
          description: "Produs exclusiv pentru verificarea checkout-ului de staging.",
          weight: 1000,
          status: ProductStatus.PUBLISHED,
          category_ids: [category.id],
          shipping_profile_id: shippingProfile.id,
          options: [{ title: "Varianta", values: ["Standard"] }],
          variants: [{
            title: "Standard",
            sku: "STAGING-CHECKOUT-100",
            options: { Varianta: "Standard" },
            prices: [{ currency_code: "ron", amount: 100 }],
          }],
          sales_channels: [{ id: salesChannel.id }],
        }],
      },
    })
    logger.info("seed-staging-checkout: created weighted test product")
  } else if (!(existingProducts[0].categories || []).some((item) => item.id === category.id)) {
    await updateProductsWorkflow(container).run({
      input: { products: [{ id: existingProducts[0].id, category_ids: [category.id] }] },
    })
    logger.info("seed-staging-checkout: linked test product to category")
  }

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["variants.inventory_items.inventory_item_id"],
    filters: { handle: HANDLE },
  })
  const itemIds = (products?.[0]?.variants || [])
    .flatMap((variant) => variant.inventory_items || [])
    .map((item) => item.inventory_item_id)
    .filter(Boolean)
  const levels: CreateInventoryLevelInput[] = []
  for (const inventoryItemId of itemIds) {
    const { data: existingLevels } = await query.graph({
      entity: "inventory_level",
      fields: ["id"],
      filters: { inventory_item_id: inventoryItemId, location_id: locations[0].id },
    })
    if (!existingLevels?.length) {
      levels.push({
        inventory_item_id: inventoryItemId,
        location_id: locations[0].id,
        stocked_quantity: 100,
      })
    }
  }
  if (levels.length) {
    await createInventoryLevelsWorkflow(container).run({
      input: { inventory_levels: levels },
    })
    logger.info(`seed-staging-checkout: created ${levels.length} inventory level(s)`)
  }
  logger.info(`seed-staging-checkout: publishable key = ${publishableKey.token}`)
  logger.info("seed-staging-checkout: done")
}
