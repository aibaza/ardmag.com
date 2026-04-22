import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { listCartShippingMethods } from "@lib/data/fulfillment"
import { listCartPaymentMethods } from "@lib/data/payment"
import { OrderSummary } from "@modules/order/components/OrderSummary"
import { CheckoutAddressForm } from "@modules/checkout/components/CheckoutAddressForm"
import { CheckoutShipping } from "@modules/checkout/components/CheckoutShipping"
import { CheckoutPayment } from "@modules/checkout/components/CheckoutPayment"
import { CheckoutReview } from "@modules/checkout/components/CheckoutReview"
import { redirect } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

type Props = {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ step?: string }>
}

const STEPS = ['address', 'delivery', 'payment', 'review'] as const
type Step = typeof STEPS[number]

function StepIndicator({ current }: { current: Step }) {
  const labels: Record<Step, string> = { address: 'Adresa', delivery: 'Livrare', payment: 'Plata', review: 'Confirmare' }
  const currentIdx = STEPS.indexOf(current)
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32, fontFamily: 'var(--f-sans)', fontSize: 13 }}>
      {STEPS.flatMap((step, i) => {
        const done = i <= currentIdx
        const active = i === currentIdx
        const pill = (
          <span key={step} style={{ whiteSpace: 'nowrap', padding: '4px 12px', borderRadius: 'var(--r-full)', background: done ? 'var(--brand-600)' : 'var(--stone-100)', color: done ? '#fff' : 'var(--fg-muted)', fontWeight: active ? 600 : 400 }}>
            {i + 1}. {labels[step]}
          </span>
        )
        return i < STEPS.length - 1
          ? [pill, <div key={`sep-${i}`} style={{ flex: 1, height: 1, background: 'var(--rule)', minWidth: 8, maxWidth: 32, margin: '0 2px' }} />]
          : [pill]
      })}
    </div>
  )
}

export default async function CheckoutPage({ params, searchParams }: Props) {
  const { countryCode } = await params
  const { step: stepParam } = await searchParams
  const step: Step = (STEPS.includes(stepParam as Step) ? stepParam : 'address') as Step

  const cart = await retrieveCart()

  if (!cart || !cart.items || cart.items.length === 0) {
    redirect(`/cart`)
  }

  const customer = await retrieveCustomer()

  // Step guards -- redirect to earliest incomplete step
  if (step === 'delivery' && !cart.shipping_address?.address_1) {
    redirect(`/checkout?step=address`)
  }
  if (step === 'payment' && !(cart.shipping_methods && cart.shipping_methods.length > 0)) {
    redirect(`/checkout?step=delivery`)
  }
  if (step === 'review' && !(cart.payment_collection?.payment_sessions && cart.payment_collection.payment_sessions.length > 0)) {
    redirect(`/checkout?step=payment`)
  }

  let shippingOptions: HttpTypes.StoreCartShippingOption[] = []
  let paymentProviders: HttpTypes.StorePaymentProvider[] = []

  if (step === 'delivery' && cart.id) {
    shippingOptions = ((await listCartShippingMethods(cart.id)) ?? []) as HttpTypes.StoreCartShippingOption[]
  }
  if (step === 'payment' && cart.region_id) {
    paymentProviders = (await listCartPaymentMethods(cart.region_id)) ?? []
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 40, alignItems: 'flex-start' }}>
      <div>
        <StepIndicator current={step} />

        {step === 'address' && (
          <CheckoutAddressForm
            countryCode={countryCode}
            customerEmail={customer?.email}
          />
        )}

        {step === 'delivery' && (
          <CheckoutShipping
            cartId={cart.id}
            countryCode={countryCode}
            shippingOptions={shippingOptions}
          />
        )}

        {step === 'payment' && (
          <CheckoutPayment
            cart={cart as HttpTypes.StoreCart}
            countryCode={countryCode}
            paymentProviders={paymentProviders}
          />
        )}

        {step === 'review' && (
          <CheckoutReview cartId={cart.id} />
        )}
      </div>

      <div style={{ position: 'sticky', top: 24 }}>
        <OrderSummary
          subtotal={cart.subtotal ?? 0}
          discount_total={cart.discount_total}
          shipping_total={cart.shipping_total}
          tax_total={cart.tax_total}
          total={cart.total ?? 0}
          currency_code={cart.currency_code}
        />
      </div>

      <style>{`@media(max-width:768px){.checkout-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  )
}
