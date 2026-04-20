import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { deleteShippingOptionsWorkflow } from "@medusajs/medusa/core-flows";

export default async function cleanupShippingDupes({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const { data: allOptions } = await query.graph({
    entity: "shipping_option",
    fields: ["id", "type.code", "created_at"],
    filters: {},
  });

  const byCode: Record<string, { id: string; created_at: string }[]> = {};
  for (const opt of allOptions ?? []) {
    const code = (opt as { type?: { code?: string }; id: string; created_at: string }).type?.code ?? "unknown";
    byCode[code] ??= [];
    byCode[code].push({ id: opt.id, created_at: (opt as { created_at: string }).created_at });
  }

  const toDelete: string[] = [];
  for (const [code, opts] of Object.entries(byCode)) {
    if (opts.length <= 1) continue;
    opts.sort((a, b) => (a.created_at > b.created_at ? -1 : 1));
    const dupes = opts.slice(1).map((o) => o.id);
    logger.info(`Cleanup: ${code} — keeping ${opts[0].id}, deleting ${dupes.length} dupes`);
    toDelete.push(...dupes);
  }

  if (!toDelete.length) {
    logger.info("Cleanup: no duplicates found.");
    return;
  }

  await deleteShippingOptionsWorkflow(container).run({ input: { ids: toDelete } });
  logger.info(`Cleanup: deleted ${toDelete.length} duplicate shipping options. Done.`);
}
