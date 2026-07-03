"use client"
import { useState, useTransition } from "react"
import { placeOrder } from "@lib/data/cart"

interface Props {
  cartId: string
}

export function PlaceOrderButton({ cartId }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handlePlace() {
    setError(null)
    startTransition(async () => {
      const result = await placeOrder(cartId)
      if (typeof result === "string") {
        setError(result)
      }
    })
  }

  return (
    <>
      {error && (
        <p style={{ color: "var(--brand-600)", fontSize: 13, marginBottom: 12, fontFamily: "var(--f-sans)" }}>
          {error}
        </p>
      )}
      <button
        type="button"
        className="btn primary lg"
        style={{ width: "100%" }}
        onClick={handlePlace}
        disabled={isPending}
      >
        {isPending ? "Se proceseaza..." : "Plaseaza comanda"}
      </button>
    </>
  )
}
