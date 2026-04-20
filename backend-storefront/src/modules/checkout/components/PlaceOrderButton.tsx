"use client"
import { useTransition } from "react"
import { placeOrder } from "@lib/data/cart"

interface Props {
  cartId: string
}

export function PlaceOrderButton({ cartId }: Props) {
  const [isPending, startTransition] = useTransition()

  function handlePlace() {
    startTransition(async () => {
      await placeOrder(cartId)
    })
  }

  return (
    <button
      type="button"
      className="btn primary lg"
      style={{ width: "100%" }}
      onClick={handlePlace}
      disabled={isPending}
    >
      {isPending ? "Se proceseaza..." : "Plaseaza comanda"}
    </button>
  )
}
