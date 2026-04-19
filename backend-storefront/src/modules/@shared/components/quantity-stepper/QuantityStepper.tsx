interface QuantityStepperProps {
  defaultValue?: number
  min?: number
}

export function QuantityStepper({ defaultValue = 1, min = 1 }: QuantityStepperProps) {
  return (
    <div className="qty-stepper">
      <button className="minus" aria-label="Scade cantitatea">−</button>
      <input type="number" defaultValue={defaultValue} min={min} />
      <button className="plus" aria-label="Crește cantitatea">+</button>
    </div>
  )
}
