// Creates a Medusa Price List (type=sale) for all variants in the mastici-tenax category.
// Prices are set to 70% of the current price (30% discount).
// Idempotent: deletes any existing price list with the same title before creating.
//
// Usage: cd scripts && npx ts-node create-tenax-promo.ts

const BACKEND_URL = "http://localhost:9000"
const ADMIN_EMAIL = "admin@ardmag.com"
const ADMIN_PASSWORD = "Admin1234!"
const CATEGORY_HANDLE = "mastici-tenax"
const PRICE_LIST_TITLE = "Mastici Tenax -30% (aprilie 2026)"
const DISCOUNT_FACTOR = 0.7
const ENDS_AT = "2026-04-30T23:59:59.000Z"
const STARTS_AT = "2026-04-19T00:00:00.000Z"

let authToken = ""

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    headers: { Authorization: `Bearer ${authToken}` },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`GET ${path} → ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`POST ${path} → ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

async function apiDelete(path: string): Promise<void> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${authToken}` },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`DELETE ${path} → ${res.status}: ${text}`)
  }
}

async function authenticate(): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/auth/user/emailpass`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  })
  if (!res.ok) throw new Error(`Auth failed: ${res.status}`)
  const data = (await res.json()) as { token: string }
  authToken = data.token
  console.log("✓ Autentificat")
}

async function getRomaniaRegionId(): Promise<string> {
  const data = await apiGet<{ regions: Array<{ id: string; name: string }> }>(
    "/admin/regions?limit=50"
  )
  const romania = data.regions.find((r) => r.name === "Romania")
  if (!romania) throw new Error("Regiunea Romania nu exista in Medusa. Ruleaza import-wix-catalog.ts intai.")
  console.log(`✓ Regiune Romania: ${romania.id}`)
  return romania.id
}

async function getCategoryId(): Promise<string> {
  const data = await apiGet<{
    product_categories: Array<{ id: string; handle: string; name: string }>
  }>(`/admin/product-categories?handle=${CATEGORY_HANDLE}&limit=1`)
  const cat = data.product_categories[0]
  if (!cat) throw new Error(`Categoria "${CATEGORY_HANDLE}" nu a fost gasita.`)
  console.log(`✓ Categorie: ${cat.name} (${cat.id})`)
  return cat.id
}

interface VariantPrice {
  id: string
  amount: number
  currency_code: string
}

interface AdminVariant {
  id: string
  sku: string | null
  prices: VariantPrice[]
}

interface AdminProduct {
  id: string
  title: string
  handle: string
  variants: AdminVariant[]
}

async function getProductsInCategory(categoryId: string): Promise<AdminProduct[]> {
  const data = await apiGet<{
    products: AdminProduct[]
    count: number
  }>(
    `/admin/products?category_id[]=${categoryId}&fields=id,title,handle,*variants,*variants.prices&limit=200`
  )
  console.log(`✓ Produse gasite in categorie: ${data.products.length}`)
  return data.products
}

interface PriceListEntry {
  variant_id: string
  amount: number
  currency_code: string
  rules: { region_id: string }
}

async function deleteExistingPriceList(): Promise<void> {
  const data = await apiGet<{
    price_lists: Array<{ id: string; title: string }>
  }>(`/admin/price-lists?limit=50`)

  const existing = data.price_lists.find((pl) => pl.title === PRICE_LIST_TITLE)
  if (!existing) {
    console.log("  Niciun price list existent cu acelasi titlu.")
    return
  }
  await apiDelete(`/admin/price-lists/${existing.id}`)
  console.log(`✓ Price list existent sters: ${existing.id}`)
}

async function main() {
  await authenticate()

  const [regionId, categoryId] = await Promise.all([
    getRomaniaRegionId(),
    getCategoryId(),
  ])

  const products = await getProductsInCategory(categoryId)

  const prices: PriceListEntry[] = []
  let skippedVariants = 0

  for (const product of products) {
    console.log(`\n  Produs: ${product.title}`)
    for (const variant of product.variants ?? []) {
      const ronPrice = (variant.prices ?? []).find(
        (p) => p.currency_code === "ron"
      )
      if (!ronPrice) {
        console.log(`    ⚠ Varianta ${variant.sku ?? variant.id}: fara pret RON, ignorata`)
        skippedVariants++
        continue
      }
      const discountedAmount = Math.round(ronPrice.amount * DISCOUNT_FACTOR)
      prices.push({
        variant_id: variant.id,
        amount: discountedAmount,
        currency_code: "ron",
        rules: { region_id: regionId },
      })
      console.log(
        `    ✓ ${variant.sku ?? variant.id}: ${ronPrice.amount / 100} RON → ${discountedAmount / 100} RON`
      )
    }
  }

  if (prices.length === 0) {
    throw new Error("Nu s-au gasit variante cu pret RON. Verifica importul catalogului.")
  }

  console.log(`\n→ Stergere price list existent (daca exista)...`)
  await deleteExistingPriceList()

  console.log(`\n→ Creare Price List cu ${prices.length} variante...`)
  const result = await apiPost<{ price_list: { id: string } }>("/admin/price-lists", {
    title: PRICE_LIST_TITLE,
    description: "Reducere de sezon pentru toate masticile Tenax",
    type: "sale",
    status: "active",
    starts_at: STARTS_AT,
    ends_at: ENDS_AT,
    prices,
  })

  console.log(`\n✅ Price List creat: ${result.price_list.id}`)
  console.log(`   Variante discountate: ${prices.length}`)
  if (skippedVariants > 0) {
    console.log(`   Variante ignorate (fara pret RON): ${skippedVariants}`)
  }
  console.log(`\n   Verifica: curl "http://localhost:9000/store/products?handle=${products[0]?.handle}&fields=*variants.calculated_price" \\`)
  console.log(`     -H "x-publishable-api-key: <PUB_KEY>"`)
}

main().catch((err) => {
  console.error("\n❌ Eroare:", err.message)
  process.exit(1)
})
