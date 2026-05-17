"use client"

import { useEffect, useRef, useState } from "react"
import { formatPrice } from "@lib/util/adapters/format-price"
import { FormattedPrice } from "@modules/@shared/components/formatted-price"

interface CartSnapshot {
  itemCount: number
  totalAmount: number
  currencyCode: string
  lastItem: {
    title: string
    variantTitle: string | null
    thumbnail: string | null
    quantity: number
    subtotal: number
  } | null
}

const AUTO_DISMISS_MS = 5500

export function AddToCartSheet() {
  const [open, setOpen] = useState(false)
  const [snapshot, setSnapshot] = useState<CartSnapshot | null>(null)
  const [dragY, setDragY] = useState(0)
  const [dragging, setDragging] = useState(false)

  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sheetRef = useRef<HTMLDivElement | null>(null)
  const dragStartY = useRef<number | null>(null)

  const close = () => {
    setOpen(false)
    setDragY(0)
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current)
      dismissTimer.current = null
    }
  }

  const scheduleDismiss = () => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current)
    dismissTimer.current = setTimeout(() => close(), AUTO_DISMISS_MS)
  }

  const cancelDismiss = () => {
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current)
      dismissTimer.current = null
    }
  }

  useEffect(() => {
    const handler = async () => {
      try {
        const res = await fetch("/api/cart-snapshot", { cache: "no-store" })
        if (!res.ok) return
        const data: CartSnapshot = await res.json()
        setSnapshot(data)
        setOpen(true)
        scheduleDismiss()
      } catch {
        /* swallow */
      }
    }

    window.addEventListener("cartadded", handler)
    return () => {
      window.removeEventListener("cartadded", handler)
      if (dismissTimer.current) clearTimeout(dismissTimer.current)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  const onTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY
    setDragging(true)
    cancelDismiss()
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (dragStartY.current === null) return
    const delta = e.touches[0].clientY - dragStartY.current
    if (delta > 0) setDragY(delta)
  }

  const onTouchEnd = () => {
    setDragging(false)
    if (dragY > 90) {
      close()
    } else {
      setDragY(0)
      scheduleDismiss()
    }
    dragStartY.current = null
  }

  if (!snapshot && !open) return null

  const item = snapshot?.lastItem
  const hasItem = !!item

  return (
    <>
      <div
        className={`atc-sheet-overlay${open ? " is-open" : ""}`}
        onClick={close}
        aria-hidden={!open}
      />
      <div
        ref={sheetRef}
        className={`atc-sheet${open ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Produs adăugat în coș"
        style={{
          transform: open
            ? `translateY(${dragY}px)`
            : "translateY(100%)",
          transition: dragging ? "none" : undefined,
        }}
        onMouseEnter={cancelDismiss}
        onMouseLeave={open ? scheduleDismiss : undefined}
      >
        <div
          className="atc-sheet-handle"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          aria-hidden="true"
        >
          <span />
        </div>

        <div className="atc-sheet-head">
          <span className="atc-sheet-check" aria-hidden="true">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 10.5l3.5 3.5L15 7" />
            </svg>
          </span>
          <span className="atc-sheet-title">Adăugat în coș</span>
          <button
            type="button"
            className="atc-sheet-close"
            onClick={close}
            aria-label="Închide"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>

        {hasItem && (
          <div className="atc-sheet-item">
            {item.thumbnail ? (
              <img
                className="atc-sheet-thumb"
                src={item.thumbnail}
                alt=""
                width={64}
                height={64}
                loading="lazy"
              />
            ) : (
              <div className="atc-sheet-thumb atc-sheet-thumb-empty" aria-hidden="true" />
            )}
            <div className="atc-sheet-info">
              <div className="atc-sheet-name">{item.title}</div>
              {item.variantTitle && (
                <div className="atc-sheet-variant">{item.variantTitle}</div>
              )}
              <div className="atc-sheet-meta">
                {item.quantity} {item.quantity === 1 ? "buc" : "buc"} ·{" "}
                <strong><FormattedPrice value={formatPrice(item.subtotal, snapshot!.currencyCode)} /></strong>
              </div>
            </div>
          </div>
        )}

        {snapshot && (
          <div className="atc-sheet-total">
            <span>
              Coș: <strong>{snapshot.itemCount}</strong>{" "}
              {snapshot.itemCount === 1 ? "produs" : "produse"}
            </span>
            <span className="atc-sheet-total-amount">
              <FormattedPrice value={formatPrice(snapshot.totalAmount, snapshot.currencyCode)} />
            </span>
          </div>
        )}

        <div className="atc-sheet-actions">
          <button
            type="button"
            className="btn ghost md atc-sheet-btn-continue"
            onClick={close}
          >
            Continuă cumpărăturile
          </button>
          <a href="/cart" className="btn primary md atc-sheet-btn-view" onClick={close}>
            Vezi coșul →
          </a>
        </div>
      </div>
    </>
  )
}
