import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SUPPLIERS: Array<{ name: string; tagline: string }> = [
  { name: "TENAX",          tagline: "Adezivi si chimie pentru piatra" },
  { name: "SAIT",           tagline: "Discuri si abrazive" },
  { name: "WOOSUK",         tagline: "Discuri diamantate" },
  { name: "DIATEX",         tagline: "Scule diamantate" },
  { name: "FOX IRONSTONE",  tagline: "Sisteme de prelucrare" },
  { name: "VBT",            tagline: "Abrazive industriale" },
  { name: "DELTA RESEARCH", tagline: "Solutii chimice" },
]

export default function SupplierStrip() {
  return (
    <section className="py-12 bg-stone-50 border-t border-stone-200">
      <div className="max-w-[1280px] mx-auto px-4">
        <div className="flex items-baseline justify-between mb-[18px] flex-wrap gap-3">
          <h3 className="font-mono text-[12px] uppercase tracking-[0.08em] font-medium m-0 text-stone-500">
            Furnizori parteneri
          </h3>
          <LocalizedClientLink
            href="/store"
            className="font-mono text-[11px] uppercase tracking-[0.05em] text-stone-700 no-underline hover:text-stone-900 transition-colors duration-150"
          >
            Catalog complet
          </LocalizedClientLink>
        </div>

        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))" }}
        >
          {SUPPLIERS.map((supplier) => (
            <div
              key={supplier.name}
              className="flex flex-col items-center justify-center p-4 rounded-[var(--r-sm)] border border-stone-200 bg-white"
              style={{ aspectRatio: "3/2" }}
            >
              <span className="font-mono text-[14px] font-semibold tracking-[0.02em] text-stone-900 text-center">
                {supplier.name}
              </span>
              <span className="text-[11px] text-stone-500 text-center mt-1 leading-[1.3]">
                {supplier.tagline}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
