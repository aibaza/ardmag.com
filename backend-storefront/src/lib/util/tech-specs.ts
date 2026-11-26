/**
 * Scoate din descrierea produsului lista „CARACTERISTICI TEHNICE” (titlu + <ul> de „cheie: valoare”)
 * ca s-o afisam ca tabel langa descriere. Lucreaza numai fara pierderi: daca un singur rand nu e
 * text simplu „cheie: valoare”, intoarce null si descrierea ramane neatinsa.
 */
export interface TechSpecsSplit {
  heading: string
  rows: Array<[string, string]>
  rest: string
}

const SECTION =
  /<p>\s*<strong>\s*(CARACTERISTICI TEHNICE)\s*<\/strong>\s*<\/p>\s*<ul>([\s\S]*?)<\/ul>/i

const ENTITIES: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
}

function decode(text: string): string | null {
  const out = text.replace(/&[#a-z0-9]+;/gi, (m) => (m in ENTITIES ? ENTITIES[m] : "\u0000"))
  return out.includes("\u0000") ? null : out
}

export function splitTechSpecs(html: string | null | undefined): TechSpecsSplit | null {
  if (!html) return null
  const m = SECTION.exec(html)
  if (!m) return null

  const inner = m[2]
  // Intre <li>-uri nu are voie sa fie altceva decat spatii; altfel am pierde continut.
  if (inner.replace(/<li>[\s\S]*?<\/li>/g, "").trim() !== "") return null

  const items = Array.from(inner.matchAll(/<li>([\s\S]*?)<\/li>/g), (x) => x[1])
  if (items.length === 0) return null

  const rows: Array<[string, string]> = []
  for (const raw of items) {
    if (raw.includes("<")) return null
    const text = decode(raw.replace(/\s+/g, " ").trim())
    if (text === null) return null
    const parts = text.split(": ")
    if (parts.length !== 2) return null
    const [key, value] = [parts[0].trim(), parts[1].trim()]
    if (!key || !value || key.length > 60) return null
    rows.push([key, value])
  }

  const heading = m[1].charAt(0) + m[1].slice(1).toLowerCase()
  const rest = (html.slice(0, m.index) + html.slice(m.index + m[0].length)).trim()
  return { heading, rows, rest }
}
