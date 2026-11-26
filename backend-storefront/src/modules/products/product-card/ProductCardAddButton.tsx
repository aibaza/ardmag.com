"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { addToCart } from "@lib/data/cart"
import { trackAddToCart } from "@lib/analytics/track"

interface Props {
  href: string
  defaultVariantId: string | null
  hasMultipleRealVariants: boolean
  countryCode: string
  soldOut?: boolean
  contactToOrder?: boolean
}

export function ProductCardAddButton({
  href,
  defaultVariantId,
  hasMultipleRealVariants,
  countryCode,
  soldOut = false,
  contactToOrder = false,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")

  if (hasMultipleRealVariants) {
    return (
      <a href={href} className="btn primary sm">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M2 4h12M2 10h12"/>
          <circle cx="5" cy="4" r="1.8" fill="currentColor" stroke="none"/>
          <circle cx="11" cy="10" r="1.8" fill="currentColor" stroke="none"/>
        </svg>
        Alege
      </a>
    )
  }

  // Inaintea verificarii de stoc, ca pe PDP: produsul se comanda telefonic
  // indiferent de stoc, iar comanda pleaca din pagina produsului.
  if (contactToOrder) {
    return (
      <a href={href} className="btn primary sm">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" clipRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z"/>
        </svg>
        Comandă telefonic
      </a>
    )
  }

  if (!defaultVariantId) {
    return (
      <button
        type="button"
        className="btn primary sm"
        disabled
        style={{ opacity: 0.6, cursor: "not-allowed" }}
      >
        Indisponibil
      </button>
    )
  }

  if (soldOut) {
    return (
      <button
        type="button"
        className="btn primary sm"
        disabled
        style={{ opacity: 0.6, cursor: "not-allowed" }}
      >
        Stoc epuizat
      </button>
    )
  }

  const handleClick = () => {
    startTransition(async () => {
      try {
        await addToCart({ variantId: defaultVariantId, quantity: 1, countryCode })
        setStatus("success")
        trackAddToCart({ id: defaultVariantId, quantity: 1 })
        window.dispatchEvent(new CustomEvent("cartupdate"))
        window.dispatchEvent(new CustomEvent("cartadded"))
        router.refresh()
        setTimeout(() => setStatus("idle"), 2000)
      } catch {
        setStatus("error")
        setTimeout(() => setStatus("idle"), 3000)
      }
    })
  }

  const label = isPending
    ? "Se adaugă..."
    : status === "success"
      ? "Adăugat"
      : status === "error"
        ? "Eroare - încearcă din nou"
        : "Adaugă"

  return (
    <button
      type="button"
      className="btn primary sm"
      onClick={handleClick}
      disabled={isPending}
      aria-busy={isPending}
      style={isPending ? { opacity: 0.6, cursor: "not-allowed" } : undefined}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M1.5 2h1.8l1.3 8h9l1.4-5.5H5"/>
        <circle cx="5.5" cy="12.5" r="1.2"/>
        <circle cx="11.5" cy="12.5" r="1.2"/>
      </svg>
      {label}
    </button>
  )
}
