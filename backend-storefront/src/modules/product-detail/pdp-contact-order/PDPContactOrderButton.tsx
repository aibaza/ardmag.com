"use client"

import { useState, useEffect } from "react"

interface PDPContactOrderButtonProps {
  productTitle: string
  variantLabel: string
}

export function PDPContactOrderButton({ productTitle, variantLabel }: PDPContactOrderButtonProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    document.addEventListener("keydown", onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  const phoneHref = "tel:+40722155441"
  const phoneLabel = "+40 722 155 441"
  const emailHref = `mailto:office@arcromdiamonds.ro?subject=${encodeURIComponent(`Comanda dimensiune mare: ${productTitle} ${variantLabel}`)}&body=${encodeURIComponent(`Buna ziua,\n\nAs dori sa comand:\n- Produs: ${productTitle}\n- Dimensiune: ${variantLabel}\n- Cantitate: \n\nVa rog sa-mi confirmati disponibilitatea si termenul de livrare.\n\nMultumesc.`)}`
  const emailLabel = "office@arcromdiamonds.ro"

  return (
    <>
      <button
        type="button"
        className="btn primary lg"
        onClick={() => setOpen(true)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3.6 2.5C3 3.7 2.8 4.5 3.5 6.3c1 2.5 2.7 4.2 5.2 5.2 1.8.7 2.6.5 3.8-.1l1.1-.5c.4-.2.5-.7.3-1.1l-1-1.6c-.2-.3-.7-.5-1-.3l-.9.5c-.9-.4-2-1.5-2.4-2.4l.5-.9c.2-.4 0-.8-.3-1l-1.6-1c-.4-.2-.9-.1-1.1.3l-.5 1.1z"/>
        </svg>
        Comandă telefonic
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-order-title"
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            fontFamily: "var(--f-sans)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--surface)",
              borderRadius: "var(--r-md)",
              maxWidth: 460,
              width: "100%",
              padding: "24px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            }}
          >
            <h2 id="contact-order-title" style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 600, color: "var(--fg)" }}>
              Comandă pentru dimensiuni mari
            </h2>
            <p style={{ margin: "0 0 16px", fontSize: 14, color: "var(--fg-muted)", lineHeight: 1.5 }}>
              Discurile peste 600 mm necesită coordonare directă pentru livrare. Contactează-ne pentru confirmare disponibilitate, preț final și termen.
            </p>

            <div style={{
              background: "var(--surface-2, #f4f4f5)",
              border: "1px solid var(--rule)",
              borderRadius: "var(--r-sm)",
              padding: "12px 14px",
              marginBottom: 16,
              fontSize: 13,
            }}>
              <div style={{ color: "var(--fg-muted)", marginBottom: 2 }}>Produs solicitat:</div>
              <div style={{ fontWeight: 600, color: "var(--fg)" }}>{productTitle}</div>
              <div style={{ fontFamily: "var(--f-mono)", color: "var(--fg)", marginTop: 4 }}>Dimensiune: {variantLabel}</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <a
                href={phoneHref}
                className="btn primary"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none", height: 44 }}
              >
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3.6 2.5C3 3.7 2.8 4.5 3.5 6.3c1 2.5 2.7 4.2 5.2 5.2 1.8.7 2.6.5 3.8-.1l1.1-.5c.4-.2.5-.7.3-1.1l-1-1.6c-.2-.3-.7-.5-1-.3l-.9.5c-.9-.4-2-1.5-2.4-2.4l.5-.9c.2-.4 0-.8-.3-1l-1.6-1c-.4-.2-.9-.1-1.1.3l-.5 1.1z"/>
                </svg>
                Sună acum {phoneLabel}
              </a>
              <a
                href={emailHref}
                className="btn ghost"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none", height: 44 }}
              >
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="12" height="10" rx="1"/>
                  <path d="M2 4l6 5 6-5"/>
                </svg>
                Trimite email {emailLabel}
              </a>
              <button
                type="button"
                className="btn ghost"
                onClick={() => setOpen(false)}
                style={{ height: 40, marginTop: 4 }}
              >
                Închide
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
