import { ModuleProvider, Modules } from "@medusajs/framework/utils";
import { CargusProviderService } from "./service";

export default ModuleProvider(Modules.FULFILLMENT, {
  services: [CargusProviderService],
});
