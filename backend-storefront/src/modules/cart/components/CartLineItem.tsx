"use client"

import { useTransition } from "react"
import { updateLineItem, deleteLineItem } from "@lib/data/cart"
import { QuantityStepper } from "@modules/@shared/components/quantity-stepper/QuantityStepper"
import { formatPrice } from "@lib/util/adapters/format-price"
import { FormattedPrice } from "@modules/@shared/components/formatted-price"
import { HttpTypes } from "@medusajs/types"

interface CartLineItemProps {
  item: HttpTypes.StoreCartLineItem
  currencyCode?: string
}

export function CartLineItem({ item, currencyCode }: CartLineItemProps) {
  const [isPending, startTransition] = useTransition()

  const productHandle =
    (item as any).product_handle ?? item.variant?.product?.handle ?? null
  const productHref = productHandle ? `/products/${productHandle}` : null

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
        {productHref ? (
          <a href={productHref} className="cli-thumb-link" aria-label={item.product_title ?? "Vezi produs"}>
            {item.thumbnail ? (
              <img className="cli-thumb" src={item.thumbnail} alt={item.title ?? ""} />
            ) : (
              <div className="cli-thumb cli-thumb-placeholder" />
            )}
          </a>
        ) : item.thumbnail ? (
          <img className="cli-thumb" src={item.thumbnail} alt={item.title ?? ""} />
        ) : (
          <div className="cli-thumb cli-thumb-placeholder" />
        )}

        {/* Title + variant */}
        <div className="cli-info">
          <div style={{ fontWeight: 500, fontSize: 14, lineHeight: 1.3 }}>
            {productHref ? (
              <a href={productHref} className="cli-title-link">
                {item.product_title}
              </a>
            ) : (
              item.product_title
            )}
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
          <FormattedPrice value={formatPrice(item.unit_price * item.quantity, currencyCode ?? "ron")} />
        </div>

        {/* Remove */}
        <button
          type="button"
          className="btn ghost sm cli-remove"
          aria-label="Șterge produsul din coș"
          title="Șterge din coș"
          onClick={() => {
            startTransition(() => {
              deleteLineItem(item.id)
            })
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 6h18" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
          <span className="cli-remove-label">Șterge</span>
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
        .cart-line-item .cli-thumb-link {
          grid-area: thumb;
          display: block;
          line-height: 0;
        }
        .cart-line-item .cli-thumb-link:hover .cli-thumb {
          opacity: 0.85;
        }
        .cart-line-item .cli-title-link {
          color: inherit;
          text-decoration: none;
        }
        .cart-line-item .cli-title-link:hover {
          color: var(--brand-700);
          text-decoration: underline;
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
        .cart-line-item .cli-remove {
          grid-area: remove;
          color: var(--fg-muted);
          transition: color 120ms, background-color 120ms;
        }
        .cart-line-item .cli-remove:hover {
          color: var(--error);
          background: var(--error-bg);
        }
        .cart-line-item .cli-remove-label {
          font-size: 13px;
          font-weight: 500;
        }

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
          .cart-line-item .cli-remove {
            width: 36px;
            height: 36px;
            padding: 0;
            border-radius: 50%;
          }
          .cart-line-item .cli-remove-label {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}
