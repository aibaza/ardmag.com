# 08 - Image Optimization Report

Generated: 2026-04-19
Script: `scripts/optimize-images.sh`
Runtime: 97s (64 parallel jobs)

---

## 1. Statistici globale

| Metric | Valoare |
|--------|---------|
| Imagini originale procesate | 164 |
| Produse acoperite | 90 |
| Variante generate | 2460 |
| Erori | 0 |
| Size total original (`resources/images/`) | 173.4 MB |
| Size total variante optimizate (fara copii originale) | 24.0 MB |
| Reducere globala (variante vs originale) | -86.2% |
| Size total `backend/static/images/` (originale + variante) | 280.6 MB |

**Breakdown surse:**

| Format original | Fisiere | Avg size |
|----------------|---------|----------|
| JPEG | 135 | 1132 KB |
| PNG | 21 | 1097 KB |
| WebP | 8 | 213 KB |

**Imagini cu transparenta reala (alpha pixeli < 1):** 3 fisiere
- `pad-polimaster-hex/db3b5a_82e4936dfc004a1482d995bb6ba272ad.png`
- `disc-de-slefuire-concav/db3b5a_32f30d64ccdf45aea3d08a92aa62afc8.png`
- `discuri-de-taiere-diamantate/db3b5a_d662b0fd18f14b59871fae40de38b324.png`

Acestea genereaza `avif + webp + png` (fara jpg). Restul de 18 PNG-uri cu canal alpha declarat dar fara pixeli transparenti sunt tratate ca opaque si genereaza `avif + webp + jpg`.

---

## 2. Structura de fisiere

### Produs cu 1 imagine: `abrazivi-oala`

```
backend/static/images/abrazivi-oala/
db3b5a_248bd6f216784fc0be96a222fd8a39d0
db3b5a_248bd6f216784fc0be96a222fd8a39d0.jpg

backend/static/images/abrazivi-oala/db3b5a_248bd6f216784fc0be96a222fd8a39d0/
card.avif
card.jpg
card.webp
detail-2x.avif
detail-2x.jpg
detail-2x.webp
detail.avif
detail.jpg
detail.webp
hero.avif
hero.jpg
hero.webp
thumb.avif
thumb.jpg
thumb.webp
```

### Produs cu 11 imagini: `dischete-de-slefuit-diamantate`

```
backend/static/images/dischete-de-slefuit-diamantate/
db3b5a_0ffa3c6dabdc4dab90b4217652b743ba/   db3b5a_0ffa3c6dabdc4dab90b4217652b743ba.jpg
db3b5a_1806485bc0714cb8b56549421fc0c07c/   db3b5a_1806485bc0714cb8b56549421fc0c07c.jpg
db3b5a_4d6209626d8a43939d03eece0f908c16/   db3b5a_4d6209626d8a43939d03eece0f908c16.jpg
db3b5a_9f7598972718488b8b82bf89d49927f1/   db3b5a_9f7598972718488b8b82bf89d49927f1.jpg
db3b5a_ba435cbda731402c93987ab6d5cfdcc7/   db3b5a_ba435cbda731402c93987ab6d5cfdcc7.jpg
db3b5a_cdf3984c4911494c9d16d89b99f2f010/   db3b5a_cdf3984c4911494c9d16d89b99f2f010.jpg
db3b5a_d736b93afa764bdb9d41ff49fa12e606/   db3b5a_d736b93afa764bdb9d41ff49fa12e606.jpg
db3b5a_dad5be80fa07453c87b88fb17849d8f5/   db3b5a_dad5be80fa07453c87b88fb17849d8f5.jpg
db3b5a_dd66e5f4f1d647f8a15d7f404f9d0873/   db3b5a_dd66e5f4f1d647f8a15d7f404f9d0873.jpg
db3b5a_e5549c190a8e4913858f3587841a19c1/   db3b5a_e5549c190a8e4913858f3587841a19c1.jpg
db3b5a_e771503143b340dc9457dab97675c2ed/   db3b5a_e771503143b340dc9457dab97675c2ed.jpg

# Fiecare subfolder contine (exemplu pentru primul):
backend/static/images/dischete-de-slefuit-diamantate/db3b5a_0ffa3c6dabdc4dab90b4217652b743ba/
card.avif    card.jpg    card.webp
detail.avif  detail.jpg  detail.webp
detail-2x.avif  detail-2x.jpg  detail-2x.webp
hero.avif    hero.jpg    hero.webp
thumb.avif   thumb.jpg   thumb.webp
```

---

## 3. Componenta ProductImage

Path: `backend-storefront/src/modules/products/components/product-image/index.tsx`

```tsx
type ProductVariant = "thumb" | "card" | "detail" | "hero"

interface ProductImageProps {
  slug: string
  /** Filename stem -- original filename without extension (e.g. "db3b5a_31c4770e784f40dab2c8aae029b99c86") */
  stem: string
  variant: ProductVariant
  alt: string
  priority?: boolean
  /** Use "png" for the 3 images with real transparency (pad-polimaster-hex, disc-de-slefuire-concav, discuri-de-taiere) */
  fallbackExt?: "jpg" | "png"
  className?: string
}

// Which optimized files to include per variant, in ascending width order
const VARIANT_SRCSET: Record<ProductVariant, Array<{ file: string; width: number }>> = {
  thumb:  [{ file: "thumb",     width: 200  }],
  card:   [{ file: "card",      width: 400  }, { file: "detail",    width: 800  }],
  detail: [{ file: "detail",    width: 800  }, { file: "detail-2x", width: 1600 }],
  hero:   [{ file: "hero",      width: 1200 }, { file: "detail-2x", width: 1600 }],
}

const VARIANT_SIZES: Record<ProductVariant, string> = {
  thumb:  "200px",
  card:   "(max-width: 640px) 50vw, 400px",
  detail: "(max-width: 768px) 100vw, 800px",
  hero:   "(max-width: 1200px) 100vw, 1200px",
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"

function variantUrl(slug: string, stem: string, file: string, fmt: string): string {
  return `${BACKEND_URL}/static/images/${slug}/${stem}/${file}.${fmt}`
}

export default function ProductImage({
  slug,
  stem,
  variant,
  alt,
  priority = false,
  fallbackExt = "jpg",
  className,
}: ProductImageProps) {
  const entries = VARIANT_SRCSET[variant]
  const sizes = VARIANT_SIZES[variant]
  const fallbackSrc = variantUrl(slug, stem, entries[0].file, fallbackExt)

  const buildSrcset = (fmt: string) =>
    entries.map(({ file, width }) => `${variantUrl(slug, stem, file, fmt)} ${width}w`).join(", ")

  return (
    <picture>
      <source type="image/avif" srcSet={buildSrcset("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={buildSrcset("webp")} sizes={sizes} />
      {/* img is the fallback for browsers without AVIF/WebP support */}
      <img
        src={fallbackSrc}
        srcSet={buildSrcset(fallbackExt)}
        sizes={sizes}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        className={className}
      />
    </picture>
  )
}
```

### Exemple de utilizare

**Card in listing grid (opaque):**
```tsx
<ProductImage
  slug="discuri-orizontale-de-marmura-si-andezit"
  stem="db3b5a_31c4770e784f40dab2c8aae029b99c86"
  variant="card"
  alt="Discuri orizontale marmura si andezit"
/>
```

**Imagine principala pe pagina produs, above-the-fold:**
```tsx
<ProductImage
  slug="sabbiatore-axf"
  stem="db3b5a_4bbdb64785de48f58b68a977fe8904a8"
  variant="detail"
  alt="Sabbiatore AXF - aparat sablare piatra naturala"
  priority={true}
/>
```

**Imagine cu transparenta reala (3 produse):**
```tsx
<ProductImage
  slug="pad-polimaster-hex"
  stem="db3b5a_82e4936dfc004a1482d995bb6ba272ad"
  variant="card"
  alt="Pad Polimaster Hex"
  fallbackExt="png"
/>
```

**HTML generat pentru variant="card" (opaque):**
```html
<picture>
  <source
    type="image/avif"
    srcset="http://localhost:9000/static/images/[slug]/[stem]/card.avif 400w,
            http://localhost:9000/static/images/[slug]/[stem]/detail.avif 800w"
    sizes="(max-width: 640px) 50vw, 400px"
  />
  <source
    type="image/webp"
    srcset="http://localhost:9000/static/images/[slug]/[stem]/card.webp 400w,
            http://localhost:9000/static/images/[slug]/[stem]/detail.webp 800w"
    sizes="(max-width: 640px) 50vw, 400px"
  />
  <img
    src="http://localhost:9000/static/images/[slug]/[stem]/card.jpg"
    srcset="http://localhost:9000/static/images/[slug]/[stem]/card.jpg 400w,
            http://localhost:9000/static/images/[slug]/[stem]/detail.jpg 800w"
    sizes="(max-width: 640px) 50vw, 400px"
    alt="..."
    loading="lazy"
    decoding="async"
  />
</picture>
```

---

## 4. Raport compresie per varianta

Valorile sunt medii calculate pe toate fisierele generate. Referinta: avg original = 1082 KB (1,108,860 bytes).

| Varianta | Latime | Format | Avg size | Reducere vs original |
|----------|--------|--------|----------|----------------------|
| thumb | 200w | avif | 3.3 KB | -99.7% |
| thumb | 200w | webp | 2.9 KB | -99.7% |
| thumb | 200w | jpeg | 6.2 KB | -99.4% |
| card | 400w | avif | 9.7 KB | -99.1% |
| card | 400w | webp | 8.9 KB | -99.2% |
| card | 400w | jpeg | 18.5 KB | -98.3% |
| detail | 800w | avif | 28.4 KB | -97.4% |
| detail | 800w | webp | 26.5 KB | -97.6% |
| detail | 800w | jpeg | 58.1 KB | -94.6% |
| detail-2x | 1600w | avif | 63.8 KB | -94.1% |
| detail-2x | 1600w | webp | 60.7 KB | -94.4% |
| detail-2x | 1600w | jpeg | 150.1 KB | -86.1% |
| hero | 1200w | avif | 47.9 KB | -95.6% |
| hero | 1200w | webp | 45.3 KB | -95.8% |
| hero | 1200w | jpeg | 106.3 KB | -90.2% |

**Note:**
- Reducerile mari se explica partial prin faptul ca originalele sunt 3024x4032px (foto mobil) reduse la 200-1600px
- PNG-urile alpha (3 fisiere) nu sunt incluse in medii de mai sus (sample prea mic)
- Setari compresie: AVIF q65, WebP q75, JPEG q82 progressive, PNG compression-level=9

---

## 5. Rute backend

**Originale** (`GET /static/images/:slug/:filename`):
- Fisier: `backend/src/api/static/images/[productSlug]/[filename]/route.ts`
- Serveste din `backend/static/images/[slug]/[stem].[ext]`
- Fallback automat la `resources/images/[slug]/[stem].[ext]` daca optimizarea nu a rulat
- Header: `Cache-Control: public, max-age=31536000, immutable`

**Variante** (`GET /static/images/:slug/:stem/:variant`):
- Fisier: `backend/src/api/static/images/[productSlug]/[stem]/[variant]/route.ts`
- Serveste din `backend/static/images/[slug]/[stem]/[variant].[ext]`
- Header: `Cache-Control: public, max-age=31536000, immutable`

---

## 6. Comanda de regenerare

```bash
# Din radacina repo-ului:
bash scripts/optimize-images.sh

# Forteaza regenerare completa (sterge variantele existente):
rm -rf backend/static/images/*/*/
bash scripts/optimize-images.sh
```

Scriptul este idempotent: rulat fara stergere prealabila, sare fisierele existente mai noi decat sursa.
