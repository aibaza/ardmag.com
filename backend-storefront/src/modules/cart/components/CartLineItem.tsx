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
      className="cart-line-item"
      style={{
        padding: "16px 20px",
        borderBottom: "1px solid var(--rule)",
        opacity: isPending ? 0.5 : 1,
        transition: "opacity 0.15s",
      }}
    >
      <div className="cli-grid">
        {/* Thumb */}
        {item.thumbnail ? (
          <img
            className="cli-thumb"
            src={item.thumbnail}
            alt={item.title ?? ""}
          />
        ) : (
          <div className="cli-thumb cli-thumb-placeholder" />
        )}

        {/* Title + variant */}
        <div className="cli-info">
          <div style={{ fontWeight: 500, fontSize: 14, lineHeight: 1.3 }}>
            {item.product_title}
          </div>
          {item.variant?.title && item.variant.title !== "Default Title" && (
            <div
              style={{
                fontFamily: "var(--f-mono)",
                fontSize: 11,
                color: "var(--fg-muted)",
                marginTop: 4,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {item.variant.title}
            </div>
          )}
        </div>

        {/* Quantity */}
        <div className="cli-qty">
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
        </div>

        {/* Price */}
        <div className="cli-price">
          {((item.unit_price * item.quantity) / 100).toFixed(2).replace(".", ",")} {currencyCode?.toUpperCase() ?? "RON"}
        </div>

        {/* Remove */}
        <button
          type="button"
          className="btn ghost sm icon-only cli-remove"
          aria-label="Sterge produsul"
          onClick={() => {
            startTransition(() => {
              deleteLineItem(item.id)
            })
          }}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 4h12M6 4V2h4v2M5 4l1 9h4l1-9" />
          </svg>
        </button>
      </div>

      <style>{`
        .cart-line-item .cli-grid {
          display: grid;
          grid-template-columns: 64px 1fr auto auto auto;
          grid-template-areas: "thumb info qty price remove";
          align-items: center;
          gap: 16px;
        }
        .cart-line-item .cli-thumb {
          grid-area: thumb;
          width: 64px;
          height: 64px;
          object-fit: cover;
          border-radius: var(--r-sm);
          flex-shrink: 0;
        }
        .cart-line-item .cli-thumb-placeholder {
          background: var(--stone-100);
          border: 1px solid var(--rule);
        }
        .cart-line-item .cli-info { grid-area: info; min-width: 0; }
        .cart-line-item .cli-qty { grid-area: qty; }
        .cart-line-item .cli-price {
          grid-area: price;
          font-family: var(--f-mono);
          font-weight: 600;
          font-size: 13px;
          font-variant-numeric: tabular-nums;
          min-width: 90px;
          text-align: right;
        }
        .cart-line-item .cli-remove { grid-area: remove; }

        @media (max-width: 640px) {
          .cart-line-item .cli-grid {
            grid-template-columns: 56px 1fr auto;
            grid-template-areas:
              "thumb info remove"
              "qty   qty  price";
            gap: 10px 14px;
          }
          .cart-line-item .cli-thumb { width: 56px; height: 56px; }
          .cart-line-item .cli-qty { justify-self: start; }
          .cart-line-item .cli-price { align-self: center; }
        }
      `}</style>
    </div>
  )
}
