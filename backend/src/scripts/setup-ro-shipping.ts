import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import {
  createRegionsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";

const FREE_SHIPPING_THRESHOLD = 50000; // 500 RON in bani

const CARRIERS = [
  {
    name: "Fan Courier",
    code: "fan-courier",
    amount: 1999, // 19.99 RON in bani
    description: "Livrare 1-2 zile lucratoare",
  },
  {
    name: "Sameday",
    code: "sameday",
    amount: 2199,
    description: "Livrare 1-2 zile lucratoare",
  },
  {
    name: "Cargus",
    code: "cargus",
    amount: 2299,
    description: "Livrare 2-3 zile lucratoare",
  },
  {
    name: "Posta Romana",
    code: "posta-romana",
    amount: 1499,
    description: "Livrare 3-5 zile lucratoare",
  },
  {
    name: "Ridicare Cluj",
    code: "pickup-cluj",
    amount: 0,
    description: "Ridicare din depozit Cluj-Napoca, Calea Baciului 1-3",
  },
];

export default async function setupRoShipping({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService = container.resolve(Modules.STORE);

  logger.info("Setup RO shipping: start");

  // --- Magazin si canal de vanzare ---
  const [store] = await storeModuleService.listStores();
  const [defaultSalesChannel] =
    await salesChannelModuleService.listSalesChannels({
      name: "Default Sales Channel",
    });

  // --- Adauga RON la store currencies ---
  // listStores() nu populeaza supported_currencies; setam lista completa explicit.
  // EUR ramane default (setat de seed-ul initial).
  logger.info("Setup RO shipping: adding RON currency...");
  const storeWithCurrencies = await storeModuleService.retrieveStore(store.id, {
    relations: ["supported_currencies"],
  });
  const hasCurrency = (code: string) =>
    storeWithCurrencies.supported_currencies?.some(
      (c: { currency_code: string }) => c.currency_code === code
    ) ?? false;

  if (!hasCurrency("ron")) {
    const existingWithDefault =
      storeWithCurrencies.supported_currencies?.map(
        (c: { currency_code: string; is_default?: boolean }) => ({
          currency_code: c.currency_code,
          is_default: c.is_default ?? c.currency_code === "eur",
        })
      ) ?? [{ currency_code: "eur", is_default: true }];

    await updateStoresWorkflow(container).run({
      input: {
        selector: { id: store.id },
        update: {
          supported_currencies: [
            ...existingWithDefault,
            { currency_code: "ron", is_default: false },
          ],
        },
      },
    });
    logger.info("Setup RO shipping: RON added.");
  } else {
    logger.info("Setup RO shipping: RON already present, skipped.");
  }

  // --- Regiune Romania ---
  logger.info("Setup RO shipping: creating region...");
  const { data: existingRegions } = await query.graph({
    entity: "region",
    fields: ["id", "name"],
    filters: { name: "Romania" },
  });

  let region = existingRegions?.[0];
  if (!region) {
    const { result: regionResult } = await createRegionsWorkflow(container).run(
      {
        input: {
          regions: [
            {
              name: "Romania",
              currency_code: "ron",
              countries: ["ro"],
              payment_providers: ["pp_system_default"],
            },
          ],
        },
      }
    );
    region = regionResult[0];
    logger.info("Setup RO shipping: region Romania created.");
  } else {
    logger.info("Setup RO shipping: region Romania exists, skipped.");
  }

  // --- Tax region RO (TVA 19%) ---
  logger.info("Setup RO shipping: creating tax region...");
  const { data: existingTaxRegions } = await query.graph({
    entity: "tax_region",
    fields: ["id", "country_code"],
    filters: { country_code: "ro" },
  });

  if (!existingTaxRegions?.length) {
    await createTaxRegionsWorkflow(container).run({
      input: [
        {
          country_code: "ro",
          provider_id: "tp_system",
          default_tax_rate: {
            rate: 21,
            name: "TVA standard",
          },
        },
      ],
    });
    logger.info("Setup RO shipping: tax region RO created.");
  } else {
    logger.info("Setup RO shipping: tax region RO exists, skipped.");
  }

  // --- Stock location Depozit Cluj ---
  logger.info("Setup RO shipping: creating stock location...");
  const { data: existingLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
    filters: { name: "Depozit Cluj" },
  });

  let stockLocation = existingLocations?.[0];
  if (!stockLocation) {
    const { result: locationResult } = await createStockLocationsWorkflow(
      container
    ).run({
      input: {
        locations: [
          {
            name: "Depozit Cluj",
            address: {
              city: "Cluj-Napoca",
              country_code: "RO",
              address_1: "Calea Baciului 1-3",
              postal_code: "400230",
            },
          },
        ],
      },
    });
    stockLocation = locationResult[0];
    logger.info("Setup RO shipping: Depozit Cluj created.");
  } else {
    logger.info("Setup RO shipping: Depozit Cluj exists, skipped.");
  }

  // --- Seteaza depozitul Cluj ca default pt magazin ---
  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: { default_location_id: stockLocation.id },
    },
  });

  // --- Link stock location <-> fulfillment provider manual ---
  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  // --- Link sales channel <-> stock location ---
  if (defaultSalesChannel) {
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: {
        id: stockLocation.id,
        add: [defaultSalesChannel.id],
      },
    });
  }

  // --- Shipping profile default ---
  logger.info("Setup RO shipping: resolving shipping profile...");
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });
  let shippingProfile = shippingProfiles[0] ?? null;

  if (!shippingProfile) {
    const { result: profileResult } = await createShippingProfilesWorkflow(
      container
    ).run({
      input: {
        data: [{ name: "Default Shipping Profile", type: "default" }],
      },
    });
    shippingProfile = profileResult[0];
  }

  // --- Fulfillment set + service zone Romania ---
  logger.info("Setup RO shipping: creating fulfillment set...");
  const existingSets =
    await fulfillmentModuleService.listFulfillmentSets({
      name: "Livrare Romania",
    });

  let serviceZoneId: string;
  if (!existingSets.length) {
    const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets(
      {
        name: "Livrare Romania",
        type: "shipping",
        service_zones: [
          {
            name: "Romania",
            geo_zones: [{ country_code: "ro", type: "country" }],
          },
        ],
      }
    );

    await link.create({
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stockLocation.id,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_set_id: fulfillmentSet.id,
      },
    });

    serviceZoneId = fulfillmentSet.service_zones[0].id;
    logger.info("Setup RO shipping: fulfillment set created.");
  } else {
    const zones = await fulfillmentModuleService.listServiceZones({
      fulfillment_set_id: existingSets[0].id,
    });
    serviceZoneId = zones[0].id;
    logger.info("Setup RO shipping: fulfillment set exists, skipped.");
  }

  // --- Shipping options (5 curieri + prag free shipping) ---
  logger.info("Setup RO shipping: creating shipping options...");
  const { data: existingOptions } = await query.graph({
    entity: "shipping_option",
    fields: ["id", "type.code"],
    filters: { service_zone_id: serviceZoneId },
  });
  const existingOptionCodes = new Set(
    (existingOptions ?? []).map(
      (o: { type?: { code?: string } }) => o.type?.code
    )
  );

  const optionsToCreate = CARRIERS.filter((c) => !existingOptionCodes.has(c.code));

  if (optionsToCreate.length) {
    await createShippingOptionsWorkflow(container).run({
      input: optionsToCreate.map((carrier) => ({
        name: carrier.name,
        price_type: "flat" as const,
        provider_id: "manual_manual",
        service_zone_id: serviceZoneId,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: carrier.name,
          description: carrier.description,
          code: carrier.code,
        },
        prices:
          carrier.amount === 0
            ? [{ currency_code: "ron", amount: 0 }]
            : [
                { currency_code: "ron", amount: carrier.amount },
                {
                  currency_code: "ron",
                  amount: 0,
                  rules: [
                    {
                      attribute: "item_total",
                      operator: "gte",
                      value: FREE_SHIPPING_THRESHOLD,
                    },
                  ],
                },
              ],
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      })),
    });
    logger.info(
      `Setup RO shipping: created ${optionsToCreate.length} shipping options.`
    );
  } else {
    logger.info("Setup RO shipping: all options exist, skipped.");
  }

  logger.info("Setup RO shipping: done.");
}
