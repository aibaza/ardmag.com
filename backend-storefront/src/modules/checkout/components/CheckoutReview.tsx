"use client"
import { useTransition } from "react"
import { placeOrder } from "@lib/data/cart"

interface Props {
  cartId: string
}

export function CheckoutReview({ cartId }: Props) {
  const [isPending, startTransition] = useTransition()

  function handlePlace() {
    startTransition(() => placeOrder(cartId))
  }

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--f-sans)', fontWeight: 600, marginBottom: 16 }}>Revizuieste si plaseaza comanda</h3>
      <p style={{ color: 'var(--fg-muted)', marginBottom: 24, fontFamily: 'var(--f-sans)', fontSize: 14 }}>
        Verifica detaliile comenzii tale in panoul din dreapta. Apasa &quot;Plaseaza comanda&quot; pentru a finaliza.
      </p>
      <button
        type="button"
        className="btn primary lg"
        style={{ width: '100%' }}
        onClick={handlePlace}
        disabled={isPending}
      >
        {isPending ? 'Se plaseaza comanda...' : 'Plaseaza comanda'}
      </button>
    </div>
  )
}
