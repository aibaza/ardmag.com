"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { FILTER_PREFIX } from "@lib/util/filter-options"

interface FilterGroupProps {
  title: string
  optKey: string
  values: string[]
  selected: string[]
  open?: boolean
}

export default function FilterGroup({
  title,
  optKey,
  values,
  selected,
}: FilterGroupProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const toggle = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      const paramKey = FILTER_PREFIX + optKey
      const current = params.get(paramKey)?.split(",").filter(Boolean) ?? []

      let next: string[]
      if (current.includes(value)) {
        next = current.filter((v) => v !== value)
      } else {
        next = [...current, value]
      }

      if (next.length === 0) {
        params.delete(paramKey)
      } else {
        params.set(paramKey, next.join(","))
      }

      // reset to page 1 when filter changes
      params.delete("page")

      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [router, pathname, searchParams, optKey]
  )

  const clearGroup = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(FILTER_PREFIX + optKey)
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [router, pathname, searchParams, optKey])

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: "8px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--f-mono)",
            fontSize: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: 600,
            color: "var(--stone-700)",
          }}
        >
          {title}
        </span>
        {selected.length > 0 && (
          <button
            onClick={clearGroup}
            style={{
              fontFamily: "var(--f-mono)",
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "var(--brand-600)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            Sterge
          </button>
        )}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
        {values.map((val) => {
          const active = selected.includes(val)
          return (
            <button
              key={val}
              onClick={() => toggle(val)}
              style={{
                fontFamily: "var(--f-mono)",
                fontSize: "11px",
                padding: "3px 8px",
                borderRadius: "2px",
                border: active
                  ? "1px solid var(--brand-500)"
                  : "1px solid var(--stone-300)",
                background: active ? "var(--brand-500)" : "var(--surface)",
                color: active ? "var(--stone-50)" : "var(--stone-700)",
                cursor: "pointer",
                transition: "border-color 0.1s, background 0.1s, color 0.1s",
              }}
            >
              {val}
            </button>
          )
        })}
      </div>
    </div>
  )
}
