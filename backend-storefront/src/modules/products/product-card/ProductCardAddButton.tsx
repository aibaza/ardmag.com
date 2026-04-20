"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { addToCart } from "@lib/data/cart"

interface Props {
  href: string
  defaultVariantId: string | null
  hasMultipleRealVariants: boolean
  countryCode: string
}

export function ProductCardAddButton({
  href,
  defaultVariantId,
  hasMultipleRealVariants,
  countryCode,
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

  const handleClick = () => {
    startTransition(async () => {
      try {
        await addToCart({ variantId: defaultVariantId, quantity: 1, countryCode })
        setStatus("success")
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
