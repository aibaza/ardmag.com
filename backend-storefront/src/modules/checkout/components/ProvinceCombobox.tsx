"use client"
import { useState, useRef, useEffect } from "react"
import { JUDETE_RO } from "@lib/data/romania"

interface Props {
  name: string
  defaultValue?: string
}

export function ProvinceCombobox({ name, defaultValue = "" }: Props) {
  const [selected, setSelected] = useState(defaultValue)
  const [query, setQuery] = useState(defaultValue)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = query
    ? JUDETE_RO.filter((j) => j.toLowerCase().startsWith(query.toLowerCase()))
        .concat(JUDETE_RO.filter((j) => j.toLowerCase().includes(query.toLowerCase()) && !j.toLowerCase().startsWith(query.toLowerCase())))
    : JUDETE_RO

  function handleSelect(j: string) {
    setSelected(j)
    setQuery(j)
    setOpen(false)
  }

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery(selected)
      }
    }
    document.addEventListener("mousedown", onMouseDown)
    return () => document.removeEventListener("mousedown", onMouseDown)
  }, [selected])

  return (
    <div className="field" ref={containerRef} style={{ position: "relative" }}>
      <label>Judet *</label>
      <input type="hidden" name={name} value={selected} />
      <div className="input-shell md" style={{ cursor: "text" }}>
        <input
          type="text"
          value={query}
          autoComplete="address-level1"
          placeholder="Cauta judetul..."
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") { setOpen(false); setQuery(selected) }
            if (e.key === "Enter" && filtered.length > 0) { e.preventDefault(); handleSelect(filtered[0]) }
          }}
        />
      </div>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 2px)", left: 0, right: 0, zIndex: 200,
          background: "var(--surface)", border: "1px solid var(--rule-strong)",
          borderRadius: "var(--r-sm)", boxShadow: "0 4px 16px rgb(0 0 0 / 0.10)",
          maxHeight: 220, overflowY: "auto",
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "10px 12px", fontSize: 13, color: "var(--fg-muted)" }}>
              Niciun judet gasit
            </div>
          ) : filtered.map((j) => (
            <div
              key={j}
              onMouseDown={() => handleSelect(j)}
              style={{
                padding: "8px 12px", cursor: "pointer", fontSize: 14,
                background: j === selected ? "var(--stone-100)" : "transparent",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--stone-50)" }}
              onMouseLeave={(e) => { e.currentTarget.style.background = j === selected ? "var(--stone-100)" : "transparent" }}
            >
              {j}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
