type ShippingOptionLike = {
  id: string
  name?: string | null
  provider_id?: string | null
  type?: { code?: string | null } | null
}

function haystack(option: ShippingOptionLike): string {
  return [option.name, option.provider_id, option.type?.code]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase())
    .join(" ")
}

export function isPickupShippingOption(option: ShippingOptionLike): boolean {
  const text = haystack(option)
  return text.includes("ridicare") || text.includes("pickup")
}

function isFanCourierOption(option: ShippingOptionLike): boolean {
  const text = haystack(option)
  return text.includes("fan-courier") || text.includes("fan courier")
}

// Preselectia din checkout: pastreaza alegerea deja salvata pe cos; altfel curier
// (Fan Courier intai), nu ridicarea personala, ca o comanda din alt oras sa nu
// plece din greseala cu ridicare de la sediu.
export function pickDefaultShippingOptionId(
  options: ShippingOptionLike[],
  currentOptionId?: string | null
): string | null {
  if (currentOptionId && options.some((o) => o.id === currentOptionId)) {
    return currentOptionId
  }
  const fan = options.find(isFanCourierOption)
  if (fan) return fan.id
  const courier = options.find((o) => !isPickupShippingOption(o))
  if (courier) return courier.id
  return options[0]?.id ?? null
}
