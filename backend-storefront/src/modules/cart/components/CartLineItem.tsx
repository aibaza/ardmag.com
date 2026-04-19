"use client"

import { useTransition } from "react"
import { updateLineItem, deleteLineItem } from "@lib/data/cart"
import { QuantityStepper } from "@modules/@shared/components/quantity-stepper/QuantityStepper"
import { HttpTypes } from "@medusajs/types"

interface CartLineItemProps {
  item: HttpTypes.StoreCartLineItem
  currencyCode?: string
}

export function CartLineItem({ item, currencyCode }: CartLineItemProps) {
  const [isPending, startTransition] = useTransition()

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "16px 0",
        borderBottom: "1px solid var(--rule)",
        opacity: isPending ? 0.5 : 1,
        transition: "opacity 0.15s",
      }}
    >
      {item.thumbnail && (
        <img
          src={item.thumbnail}
          alt={item.title ?? ""}
          style={{
            width: 64,
            height: 64,
            objectFit: "cover",
            borderRadius: "var(--r-md)",
            flexShrink: 0,
          }}
        />
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--f-sans)", fontWeight: 500, fontSize: 14 }}>
          {item.product_title}
        </div>
        {item.variant?.title && item.variant.title !== "Default" && (
          <div style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 2 }}>
            {item.variant.title}
          </div>
        )}
      </div>

      <QuantityStepper
        defaultValue={item.quantity}
        min={1}
        max={99}
        onChange={(qty) => {
          startTransition(() => {
            updateLineItem({ lineId: item.id, quantity: qty })
          })
        }}
      />

      <div
        style={{
          fontFamily: "var(--f-sans)",
          fontWeight: 600,
          minWidth: 80,
          textAlign: "right",
        }}
      >
        {((item.unit_price * item.quantity) / 100).toFixed(2)} {currencyCode ?? "RON"}
      </div>

      <button
        type="button"
        aria-label="Sterge produsul"
        onClick={() => {
          startTransition(() => {
            deleteLineItem(item.id)
          })
        }}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--fg-muted)",
          fontSize: 18,
          padding: 4,
          flexShrink: 0,
        }}
      >
        &times;
      </button>
    </div>
  )
}
