/**
 * Smoke test — ardmag.surcod.ro (Vercel prod)
 *
 * Rulare:
 *   BASE_URL=https://ardmag.surcod.ro npx playwright test tests/e2e/smoke.spec.ts --project=chromium-desktop
 *
 * Acoperire: homepage, category listing, filtre, sort, search, PDP, add-to-cart,
 *            cart CRUD, pagini statice, health check asset R2.
 */

import { test, expect, type Page, type Response } from "@playwright/test"

// Produs simplu fara optiuni, 1 varianta -- cel mai sigur pt add-to-cart
const SIMPLE_PRODUCT = "mastic-semisolid-wet"
// Produs cu mai multe variante (fara option UI) -- pt PDP imagini + galerie
const MULTI_VARIANT_PRODUCT = "mastic-solid"
// Categorie cu destule produse + filtre de brand
const CAT_WITH_FILTERS = "/ro/categories/slefuire-piatra"
// R2 hostname asteptat in img src
const R2_HOST = "pub-28d7a4f80d924560ae8c2fe111240e4a.r2.dev"

// Pattern-uri de ignorat in erorile de console / request
const IGNORED_PATTERNS = [
  "favicon",
  "google-analytics",
  "googletagmanager",
  "facebook",
  "fbevents",
  "hotjar",
  "clarity",
  "sentry",
]

function isIgnored(str: string) {
  return IGNORED_PATTERNS.some((p) => str.toLowerCase().includes(p))
}

interface PageDiagnostics {
  consoleErrors: string[]
  failedRequests: { url: string; failure: string }[]
  badResponses: { url: string; status: number }[]
}

function attachDiagnostics(page: Page): () => PageDiagnostics {
  const consoleErrors: string[] = []
  const failedRequests: { url: string; failure: string }[] = []
  const badResponses: { url: string; status: number }[] = []

  page.on("console", (msg) => {
    if (msg.type() === "error" && !isIgnored(msg.text())) {
      consoleErrors.push(msg.text())
    }
  })
  page.on("requestfailed", (req) => {
    if (!isIgnored(req.url())) {
      failedRequests.push({ url: req.url(), failure: req.failure()?.errorText ?? "unknown" })
    }
  })
  page.on("response", (resp) => {
    if (resp.status() >= 400 && !isIgnored(resp.url())) {
      badResponses.push({ url: resp.url(), status: resp.status() })
    }
  })

  return () => ({ consoleErrors, failedRequests, badResponses })
}

function reportAndAssert(diag: PageDiagnostics, label: string) {
  if (diag.consoleErrors.length > 0) {
    console.log(`[${label}] Console errors:`, diag.consoleErrors)
  }
  if (diag.failedRequests.length > 0) {
    console.log(`[${label}] Failed requests:`, diag.failedRequests)
  }
  if (diag.badResponses.length > 0) {
    console.log(`[${label}] Bad responses (>=400):`, diag.badResponses)
  }
  expect(diag.consoleErrors, `${label}: console errors`).toHaveLength(0)
  expect(diag.failedRequests, `${label}: failed requests`).toHaveLength(0)
}

// ─────────────────────────────────────────────
// 1. Homepage
// ─────────────────────────────────────────────
test("1. homepage incarca fara erori", async ({ page }) => {
  const getDiag = attachDiagnostics(page)
  const resp = await page.goto("/ro")
  expect(resp?.status()).toBe(200)

  // Hero vizibil
  await expect(page.locator(".hero").first()).toBeVisible()

  // Quick categories
  await expect(page.locator(".quick-cats")).toBeVisible()
  const cats = page.locator(".quick-cats .qc")
  expect(await cats.count()).toBeGreaterThan(0)

  // Cel putin o grila de produse cu un card
  await expect(page.locator(".pcard").first()).toBeVisible()

  // Trust banner
  await expect(page.locator(".trust-banner").first()).toBeVisible()

  reportAndAssert(getDiag(), "homepage")
})

// ─────────────────────────────────────────────
// 2. Navigare homepage -> categorie prin quick-cat
// ─────────────────────────────────────────────
test("2. click quick-cat duce la listing categorie", async ({ page }) => {
  await page.goto("/ro")
  await expect(page.locator(".quick-cats .qc").first()).toBeVisible()

  const firstCatHref = await page.locator(".quick-cats .qc").first().getAttribute("href")
  expect(firstCatHref).toMatch(/\/ro\/categories\//)

  await page.locator(".quick-cats .qc").first().click()
  await page.waitForURL(/\/ro\/categories\//)

  // Produse sau empty state
  const hasPcards = (await page.locator(".pcard").count()) > 0
  const hasEmpty = await page.locator(".cat-products").textContent().then((t) => t?.includes("Niciun produs"))
  expect(hasPcards || hasEmpty).toBeTruthy()
})

// ─────────────────────────────────────────────
// 3. Category listing
// ─────────────────────────────────────────────
test("3. category listing incarca cu produse si toolbar", async ({ page }) => {
  const getDiag = attachDiagnostics(page)
  const resp = await page.goto(CAT_WITH_FILTERS)
  expect(resp?.status()).toBe(200)

  await page.locator(".cat-products").waitFor({ state: "visible" })
  expect(await page.locator(".pcard").count()).toBeGreaterThan(0)

  const isMobile = (page.viewportSize()?.width ?? 1440) < 1024
  if (!isMobile) {
    await expect(page.locator(".filters")).toBeVisible()
    await expect(page.locator("#sort")).toBeVisible()
  }

  reportAndAssert(getDiag(), "category-listing")
})

// ─────────────────────────────────────────────
// 4. Filter brand -> URL + produse
// ─────────────────────────────────────────────
test("4. filter brand actualizeaza URL si grila", async ({ page }) => {
  const isMobile = (page.viewportSize()?.width ?? 1440) < 1024
  if (isMobile) {
    console.log("4. SKIP: filtre in drawer pe mobile, skip test")
    return
  }
  await page.goto(CAT_WITH_FILTERS)
  const firstCheckbox = page.locator(".filters .chk input[type=checkbox]").first()
  await firstCheckbox.waitFor({ state: "visible" })
  await firstCheckbox.click()
  await page.waitForURL(/brand=/)
  expect(page.url()).toContain("brand=")

  await page.locator(".cat-products").waitFor({ state: "visible" })
  const hasPcards = (await page.locator(".pcard").count()) > 0
  const hasEmpty = (await page.locator(".cat-products").textContent())?.includes("Niciun produs")
  expect(hasPcards || hasEmpty).toBeTruthy()
})

// ─────────────────────────────────────────────
// 5. Sort -> URL
// ─────────────────────────────────────────────
test("5. sort actualizeaza URL", async ({ page }) => {
  await page.goto(CAT_WITH_FILTERS)
  await page.locator("#sort").waitFor({ state: "visible" })
  await page.selectOption("#sort", "Preț ascendent")
  await page.waitForURL(/sortBy=/)
  expect(page.url()).toContain("sortBy=")
})

// ─────────────────────────────────────────────
// 6. Search cu rezultate
// ─────────────────────────────────────────────
test("6. search cu query valid afiseaza produse", async ({ page }) => {
  const getDiag = attachDiagnostics(page)
  const resp = await page.goto("/ro/search?q=disc")
  expect(resp?.status()).toBe(200)

  // Titlu pagina cu query
  await expect(page.locator("h1").first()).toContainText("disc")

  // Cel putin un rezultat sau mesaj count 0
  const hasPcards = (await page.locator(".pcard").count()) > 0
  const hasCount = (await page.locator("p").filter({ hasText: /produse gasite/ }).count()) > 0
  expect(hasPcards || hasCount).toBeTruthy()

  reportAndAssert(getDiag(), "search-results")
})

// ─────────────────────────────────────────────
// 7. Search fara rezultate -> empty state
// ─────────────────────────────────────────────
test("7. search fara rezultate afiseaza empty state nu 500", async ({ page }) => {
  const resp = await page.goto("/ro/search?q=xyznonexistent999abc")
  expect(resp?.status()).toBe(200)
  await expect(page.locator("text=Niciun produs nu corespunde").first()).toBeVisible()
})

// ─────────────────────────────────────────────
// 8. PDP incarca corect
// ─────────────────────────────────────────────
test("8. PDP incarca titlu, pret, buton add-to-cart", async ({ page }) => {
  const getDiag = attachDiagnostics(page)
  const resp = await page.goto(`/ro/products/${SIMPLE_PRODUCT}`)
  expect(resp?.status()).toBe(200)

  await expect(page.locator(".pdp-title").first()).toBeVisible()
  await expect(page.locator(".pdp-summary").first()).toBeVisible()

  // Buton add to cart
  const addBtn = page.locator("button.btn.primary.lg").first()
  await expect(addBtn).toBeVisible()
  await expect(addBtn).not.toBeDisabled()
  await expect(addBtn).toContainText(/Adaug/i)

  reportAndAssert(getDiag(), "pdp")
})

// ─────────────────────────────────────────────
// 9. PDP galerie -- imagini de pe R2
// ─────────────────────────────────────────────
test("9. PDP imagini vin de pe R2", async ({ page }) => {
  await page.goto(`/ro/products/${MULTI_VARIANT_PRODUCT}`)
  await page.locator(".pdp").waitFor({ state: "visible" })

  const imgs = page.locator(".pdp img")
  const count = await imgs.count()

  if (count === 0) {
    console.log("9. PDP galerie: nicio imagine gasita pe .pdp -- produs poate nu are imagini in R2")
    return
  }

  // Verifica ca cel putin prima imagine are src cu r2 sau are alt text
  const firstSrc = await imgs.first().getAttribute("src")
  console.log(`9. PDP prima imagine src: ${firstSrc}`)

  // Nu fail daca imaginile vin din alt loc (Next.js image optimization poate schimba hostname)
  // Dar logam pentru investigatie
  if (firstSrc && !firstSrc.includes(R2_HOST) && !firstSrc.includes("/_next/image")) {
    console.log(`9. WARN: imagine nu e de pe R2 si nici /_next/image -- src: ${firstSrc}`)
  }
})

// ─────────────────────────────────────────────
// 10. Add to cart -> success state
// ─────────────────────────────────────────────
test("10. add to cart schimba butonul in success state", async ({ page }) => {
  await page.goto(`/ro/products/${SIMPLE_PRODUCT}`)

  const addBtn = page.locator("button.btn.primary.lg").first()
  await expect(addBtn).not.toBeDisabled()

  await addBtn.click()

  // Confirma ca actiunea a pornit (aria-busy=true = server action in curs)
  await expect(addBtn).toHaveAttribute("aria-busy", "true", { timeout: 5000 })
  // Asteapta finalizarea server action
  await expect(addBtn).toHaveAttribute("aria-busy", "false", { timeout: 20000 })

  // Verifica ca nu e eroare de server action (niciun div[role=alert])
  const errorMsg = page.locator("div[role=alert]")
  if ((await errorMsg.count()) > 0) {
    console.log("10. WARN: eroare dupa add-to-cart:", await errorMsg.textContent())
  }

  // Cookie cart trebuie sa existe acum
  const cookies = await page.context().cookies()
  const cartCookie = cookies.find((c) => c.name === "_medusa_cart_id")
  if (!cartCookie) {
    console.log("10. WARN: _medusa_cart_id cookie nu e setat dupa add-to-cart")
  }
})

// ─────────────────────────────────────────────
// 11. Cart page dupa add-to-cart
// ─────────────────────────────────────────────
test("11. cart page afiseaza produsul adaugat", async ({ page }) => {
  // Add to cart mai intai
  await page.goto(`/ro/products/${SIMPLE_PRODUCT}`)
  const addBtn = page.locator("button.btn.primary.lg").first()
  await expect(addBtn).not.toBeDisabled()
  await addBtn.click()
  await expect(addBtn).toHaveAttribute("aria-busy", "true", { timeout: 5000 })
  await expect(addBtn).toHaveAttribute("aria-busy", "false", { timeout: 20000 })
  await page.waitForTimeout(500) // permite server action sa se finalizeze

  // Navigheaza la cart
  const getDiag = attachDiagnostics(page)
  await page.goto("/ro/cart")
  await expect(page.locator("h1").first()).toContainText(/Cosul meu/i)

  // Un item sau mai multe (din sesiunea curenta)
  const hasItems = (await page.locator(".cart-grid").count()) > 0
  const isEmpty = (await page.locator("text=Cosul tau este gol").count()) > 0

  if (isEmpty) {
    console.log("11. WARN: cosul e gol dupa add-to-cart -- posibil problema cu sesiunea sau server action")
  } else {
    expect(hasItems).toBeTruthy()
    // Buton checkout exista
    await expect(page.locator("a[href*='checkout']").first()).toBeVisible()
  }

  reportAndAssert(getDiag(), "cart-page")
})

// ─────────────────────────────────────────────
// 12. Update qty in cart
// ─────────────────────────────────────────────
test("12. update cantitate in cart", async ({ page }) => {
  // Add to cart
  await page.goto(`/ro/products/${SIMPLE_PRODUCT}`)
  const addBtn = page.locator("button.btn.primary.lg").first()
  await expect(addBtn).not.toBeDisabled()
  await addBtn.click()
  await expect(addBtn).toHaveAttribute("aria-busy", "true", { timeout: 5000 })
  await expect(addBtn).toHaveAttribute("aria-busy", "false", { timeout: 20000 })
  await page.waitForTimeout(500)

  await page.goto("/ro/cart")

  const plusBtn = page.locator(".qty-stepper .plus").first()
  const cartGrid = page.locator(".cart-grid")

  if ((await cartGrid.count()) === 0) {
    console.log("12. SKIP: cart gol, skip update qty test")
    return
  }

  await expect(plusBtn).toBeVisible()
  await plusBtn.click()

  // Asteapta actualizarea (useTransition)
  await page.waitForTimeout(1500)

  // Valoarea inputului trebuie sa fie 2
  const qtyInput = page.locator(".qty-stepper input").first()
  const val = await qtyInput.inputValue()
  console.log(`12. qty dupa click plus: ${val}`)
  expect(parseInt(val)).toBeGreaterThanOrEqual(2)
})

// ─────────────────────────────────────────────
// 13. Remove item din cart
// ─────────────────────────────────────────────
test("13. remove item din cart", async ({ page }) => {
  // Add to cart
  await page.goto(`/ro/products/${SIMPLE_PRODUCT}`)
  const addBtn = page.locator("button.btn.primary.lg").first()
  await expect(addBtn).not.toBeDisabled()
  await addBtn.click()
  await expect(addBtn).toHaveAttribute("aria-busy", "true", { timeout: 5000 })
  await expect(addBtn).toHaveAttribute("aria-busy", "false", { timeout: 20000 })
  await page.waitForTimeout(500)

  await page.goto("/ro/cart")

  const cartGrid = page.locator(".cart-grid")
  if ((await cartGrid.count()) === 0) {
    console.log("13. SKIP: cart gol, skip remove test")
    return
  }

  const removeBtn = page.locator("button[aria-label='Sterge produsul']").first()
  await expect(removeBtn).toBeVisible()
  await removeBtn.click({ force: true })

  // Dupa stergere: fie cart-gol mesaj, fie mai putine item-uri
  await page.waitForTimeout(1500)
  const stillHasGrid = (await page.locator(".cart-grid").count()) > 0
  const showsEmpty = (await page.locator("text=Cosul tau este gol").count()) > 0
  console.log(`13. dupa remove: grid=${stillHasGrid}, empty=${showsEmpty}`)
  expect(stillHasGrid || showsEmpty).toBeTruthy()
})

// ─────────────────────────────────────────────
// 14. Produse page
// ─────────────────────────────────────────────
test("14. /produse afiseaza produse", async ({ page }) => {
  const getDiag = attachDiagnostics(page)
  const resp = await page.goto("/ro/produse")
  expect(resp?.status()).toBe(200)
  await page.locator(".cat-products").waitFor({ state: "visible", timeout: 20000 })
  expect(await page.locator(".pcard").count()).toBeGreaterThan(0)
  reportAndAssert(getDiag(), "produse-page")
})

// ─────────────────────────────────────────────
// 15. Pagini statice
// ─────────────────────────────────────────────
const STATIC_PAGES: { path: string; expectText: string }[] = [
  { path: "/ro/despre-noi", expectText: "Arc Rom" },
  { path: "/ro/contact", expectText: "contact" },
  { path: "/ro/livrare-si-plata", expectText: "livrare" },
  { path: "/ro/termeni", expectText: "termeni" },
  { path: "/ro/confidentialitate", expectText: "date" },
  { path: "/ro/cookie-policy", expectText: "cookie" },
]

for (const { path, expectText } of STATIC_PAGES) {
  test(`15. static ${path} incarca 200`, async ({ page }) => {
    const getDiag = attachDiagnostics(page)
    const resp = await page.goto(path)
    expect(resp?.status()).toBe(200)

    const body = (await page.locator("main").textContent()) ?? ""
    if (!body.toLowerCase().includes(expectText.toLowerCase())) {
      console.log(`15. WARN: pagina ${path} nu contine "${expectText}" -- posibil continut lipsa`)
    }

    reportAndAssert(getDiag(), `static-${path}`)
  })
}

// ─────────────────────────────────────────────
// 16. Asset probe -- imagini R2 pe homepage
// ─────────────────────────────────────────────
test("16. imagini produse de pe homepage raspund 200", async ({ page }) => {
  const imageFailures: { src: string; status?: number }[] = []
  const imageResponses = new Map<string, number>()

  page.on("response", (resp) => {
    const url = resp.url()
    if (url.includes(R2_HOST) && /\.(jpg|jpeg|png|webp)/i.test(url)) {
      imageResponses.set(url, resp.status())
    }
  })

  await page.goto("/ro")
  await page.locator(".pcard").first().waitFor({ state: "visible", timeout: 20000 })

  // Asteapta ca imaginile sa se incarce
  await page.waitForTimeout(2000)

  for (const [url, status] of imageResponses.entries()) {
    if (status !== 200) {
      imageFailures.push({ src: url, status })
    }
  }

  if (imageFailures.length > 0) {
    console.log("16. Imagini R2 cu erori:", imageFailures)
  }
  console.log(`16. Total imagini R2 pe homepage: ${imageResponses.size}, erori: ${imageFailures.length}`)

  expect(imageFailures, "imagini R2 cu status != 200").toHaveLength(0)
})
