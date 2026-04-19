"use client"

import { useState } from 'react'

interface QuantityStepperProps {
  defaultValue?: number
  min?: number
  max?: number
  onChange?: (value: number) => void
}

export function QuantityStepper({ defaultValue = 1, min = 1, max = 999, onChange }: QuantityStepperProps) {
  const [value, setValue] = useState(defaultValue)

  function update(next: number) {
    const clamped = Math.max(min, Math.min(max, next))
    setValue(clamped)
    onChange?.(clamped)
  }

  return (
    <div className="qty-stepper">
      <button
        type="button"
        className="minus"
        aria-label="Scade cantitatea"
        onClick={() => update(value - 1)}
        disabled={value <= min}
      >−</button>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10)
          if (!isNaN(n)) update(n)
        }}
        aria-label="Cantitate"
        style={{ MozAppearance: 'textfield' } as React.CSSProperties}
      />
      <button
        type="button"
        className="plus"
        aria-label="Crește cantitatea"
        onClick={() => update(value + 1)}
        disabled={value >= max}
      >+</button>
    </div>
  )
}
