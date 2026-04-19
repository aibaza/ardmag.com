"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { addToCart } from "@lib/data/cart"

interface Props {
  variantId: string | null
  countryCode: string
  label: string
}

export function PDPAddToCartButton({ variantId, countryCode, label }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [error, setError] = useState<string | null>(null)

  const disabled = !variantId || isPending

  const handleClick = () => {
    if (!variantId) return
    setError(null)
    setStatus("idle")
    startTransition(async () => {
      try {
        await addToCart({ variantId, quantity: 1, countryCode })
        setStatus("success")
        router.refresh()
        // Reset success label after 2s so user can add again with normal label
        setTimeout(() => setStatus("idle"), 2000)
      } catch (e: any) {
        setStatus("error")
        setError(e?.message ?? "Eroare la adăugarea în coș")
      }
    })
  }

  const buttonLabel = isPending
    ? "Se adaugă..."
    : status === "success"
      ? "Adăugat în coș"
      : label

  return (
    <>
      <button
        type="button"
        className="btn primary lg"
        onClick={handleClick}
        disabled={disabled}
        aria-busy={isPending}
        style={disabled ? { opacity: 0.6, cursor: "not-allowed" } : undefined}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M2 3h2l1 9h10l1-6H5"/>
          <circle cx="7" cy="15" r="1.3"/>
          <circle cx="14" cy="15" r="1.3"/>
        </svg>
        {buttonLabel}
      </button>
      {error && (
        <div role="alert" style={{ color: "var(--danger-600, #b91c1c)", fontSize: 13, marginTop: 8 }}>
          {error}
        </div>
      )}
    </>
  )
}
