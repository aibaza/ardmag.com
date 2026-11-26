"use client"

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react"

/** O eticheta de pe cardul de produs; `values` = valorile afisate in tooltip, cate una pe rand. */
export interface ProductCardSpec {
  label: string
  values?: string[]
}

export interface ProductCardSpecTagProps {
  label: string
  values?: string[]
}

const MAX_ROWS = 8

export function ProductCardSpecTag({ label, values }: ProductCardSpecTagProps) {
  const tipId = useId()
  const wrapRef = useRef<HTMLSpanElement>(null)
  const tipRef = useRef<HTMLSpanElement>(null)
  const [open, setOpen] = useState(false)
  const [alignEnd, setAlignEnd] = useState(false)

  // Inchide la tap/click in afara si la Escape.
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    document.addEventListener("pointerdown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  // Daca tooltipul ar iesi din ecran in dreapta, il aliniaza la marginea dreapta a etichetei.
  const measure = () => {
    const tip = tipRef.current
    const wrap = wrapRef.current
    if (!tip || !wrap) return
    const wrapLeft = wrap.getBoundingClientRect().left
    setAlignEnd(wrapLeft + tip.offsetWidth > document.documentElement.clientWidth - 8)
  }
  useLayoutEffect(() => { if (open) measure() }, [open])

  if (!values || values.length === 0) {
    return <span className="spec-tag">{label}</span>
  }

  const shown = values.slice(0, MAX_ROWS)
  const rest = values.length - shown.length

  return (
    <span
      ref={wrapRef}
      className={`spec-tip${open ? " is-open" : ""}${alignEnd ? " align-end" : ""}`}
      onMouseEnter={measure}
      onKeyDown={(e) => { if (e.key === "Escape" && open) { e.stopPropagation(); setOpen(false) } }}
    >
      <button
        type="button"
        className="spec-tag spec-tag--btn"
        aria-describedby={tipId}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onFocus={measure}
        onBlur={(e) => { if (!wrapRef.current?.contains(e.relatedTarget as Node)) setOpen(false) }}
      >
        {label}
      </button>
      <span ref={tipRef} id={tipId} role="tooltip" className="spec-tip__bubble">
        {shown.map((v, i) => (
          <span key={v} className="spec-tip__row">{v}{(i < shown.length - 1 || rest > 0) && <span className="spec-tip__sep">, </span>}</span>
        ))}
        {rest > 0 && <span className="spec-tip__row spec-tip__more">+ încă {rest}</span>}
      </span>
    </span>
  )
}
