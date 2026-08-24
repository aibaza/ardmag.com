import type { MedusaRequest } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  DeliveryDescriptor,
  validateDeliveryPaymentPair,
} from "../../lib/checkout/delivery-payment-policy";

type PolicyState = {
  delivery: DeliveryDescriptor;
  paymentProviderId?: string | null;
};

async function getShippingOption(
  req: MedusaRequest,
  shippingOptionId?: string | null
) {
  if (!shippingOptionId) return null;
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { data } = await query.graph({
    entity: "shipping_option",
    fields: ["id", "name", "provider_id", "type.code"],
    filters: { id: shippingOptionId },
  });
  return data?.[0] ?? null;
}

export async function getCartPolicyState(
  req: MedusaRequest,
  cartId: string
): Promise<PolicyState> {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { data } = await query.graph({
    entity: "cart",
    fields: [
      "id",
      "shipping_methods.shipping_option_id",
      "payment_collection.payment_sessions.provider_id",
      "payment_collection.payment_sessions.status",
    ],
    filters: { id: cartId },
  });
  const cart = data?.[0] as any;
  const shippingMethod = cart?.shipping_methods?.[0];
  const option = await getShippingOption(
    req,
    shippingMethod?.shipping_option_id
  );
  const sessions = cart?.payment_collection?.payment_sessions ?? [];
  const session =
    sessions.find((item: any) => item.status !== "canceled") ?? sessions[0];

  return {
    delivery: {
      code: option?.type?.code,
      providerId: option?.provider_id,
      name: option?.name,
    },
    paymentProviderId: session?.provider_id,
  };
}

export async function getCartIdForPaymentCollection(
  req: MedusaRequest,
  paymentCollectionId: string
): Promise<string | null> {
  const remoteQuery = req.scope.resolve(ContainerRegistrationKeys.REMOTE_QUERY);
  const [relation] = await remoteQuery({
    entryPoint: "cart_payment_collection",
    variables: { filters: { payment_collection_id: paymentCollectionId } },
    fields: ["cart.id"],
  });
  return relation?.cart?.id ?? relation?.cart_id ?? null;
}

export function policyError(
  state: PolicyState,
  providerId?: string | null
): string | null {
  const result = validateDeliveryPaymentPair(
    state.delivery,
    providerId ?? state.paymentProviderId
  );
  return result.valid ? null : result.message;
}
