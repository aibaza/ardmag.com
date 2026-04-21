// @ts-nocheck
import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows";

export default async function fixProductShippingProfiles({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  logger.info("Fix product shipping profiles: start");

  const [defaultProfile] = await fulfillmentModuleService.listShippingProfiles({ type: "default" });
  if (!defaultProfile) {
    logger.error("No default shipping profile found. Run setup-ro-shipping.ts first.");
    return;
  }

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "shipping_profile.id"],
    filters: {},
  });

  const unlinked = (products ?? []).filter(
    (p: { id: string; shipping_profile?: { id: string } }) => !p.shipping_profile?.id
  );

  if (!unlinked.length) {
    logger.info("Fix product shipping profiles: all products already have a profile. Done.");
    return;
  }

  logger.info(`Fix product shipping profiles: linking ${unlinked.length} products to '${defaultProfile.name}'...`);

  const CHUNK = 25;
  for (let i = 0; i < unlinked.length; i += CHUNK) {
    const chunk = unlinked.slice(i, i + CHUNK)
    await updateProductsWorkflow(container).run({
      input: {
        products: chunk.map((p: { id: string }) => ({
          id: p.id,
          shipping_profile_id: defaultProfile.id,
        })),
      },
    })
    logger.info(`Fix product shipping profiles: ${Math.min(i + CHUNK, unlinked.length)}/${unlinked.length} done...`)
  }

  logger.info("Fix product shipping profiles: done.");
}
