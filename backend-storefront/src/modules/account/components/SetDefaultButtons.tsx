"use client"
import { useTransition } from "react"
import { setDefaultAddress } from "@lib/data/customer"

interface Props {
  addressId: string
  isDefaultShipping: boolean
  isDefaultBilling: boolean
}

export function SetDefaultButtons({ addressId, isDefaultShipping, isDefaultBilling }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleSet(type: "shipping" | "billing") {
    startTransition(async () => {
      await setDefaultAddress(addressId, type)
    })
  }

  if (isDefaultShipping && isDefaultBilling) return null

  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
      {!isDefaultShipping && (
        <button type="button" className="btn secondary sm" onClick={() => handleSet("shipping")} disabled={isPending}>
          Seteaza livrare implicita
        </button>
      )}
      {!isDefaultBilling && (
        <button type="button" className="btn secondary sm" onClick={() => handleSet("billing")} disabled={isPending}>
          Seteaza facturare implicita
        </button>
      )}
    </div>
  )
}
