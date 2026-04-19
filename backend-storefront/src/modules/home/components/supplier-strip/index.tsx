import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SUPPLIERS: Array<{ name: string; logo: string }> = [
  { name: "Tenax",          logo: "/images/suppliers/tenax.webp" },
  { name: "SAIT",           logo: "/images/suppliers/sait.webp" },
  { name: "Woosuk",         logo: "/images/suppliers/woosuk.webp" },
  { name: "Diatex",         logo: "/images/suppliers/diatex.webp" },
  { name: "Fox Ironstone",  logo: "/images/suppliers/fox-ironstone.webp" },
  { name: "VBT",            logo: "/images/suppliers/vbt.webp" },
  { name: "Delta Research", logo: "/images/suppliers/delta-research.webp" },
  { name: "Super Selva",    logo: "/images/suppliers/super-selva.webp" },
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
              className="relative flex items-center justify-center p-4 rounded-[var(--r-sm)] border border-stone-200 bg-white"
              style={{ aspectRatio: "3/2" }}
            >
              <Image
                src={supplier.logo}
                alt={supplier.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1280px) 14vw, 180px"
                className="object-contain p-3"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
