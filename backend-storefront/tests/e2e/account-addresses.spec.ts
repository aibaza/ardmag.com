import { test, expect } from "@playwright/test"
import { BASE, createTestCustomer, setAuthCookie, dismissCookieBanner } from "./helpers/auth"

// Helper: cardul adresei care contine un text specific
function addressPanel(page: any, text: string) {
  return page.locator(".panel", { has: page.locator(`.panel-body:has-text("${text}")`) })
}

test("Account addresses: CRUD complet + default flags", async ({ page, request }) => {
  test.setTimeout(120000)
  const { token } = await createTestCustomer(request)
  await setAuthCookie(page, token)

  await page.goto(`${BASE}/account/addresses`, { waitUntil: "domcontentloaded", timeout: 30000 })
  await dismissCookieBanner(page)
  await expect(page.locator("h2", { hasText: /adresele mele/i })).toBeVisible({ timeout: 10000 })
  await expect(page.locator("text=Nu ai adrese salvate inca")).toBeVisible()

  // ── Adauga prima adresa ───────────────────────────────────────────────────────
  await page.locator("button", { hasText: /adauga adresa/i }).click()
  await expect(page.locator("h3", { hasText: /adresa noua/i })).toBeVisible()

  await page.fill('[name="address_name"]', "Acasa")
  await page.fill('[name="first_name"]', "Ion")
  await page.fill('[name="last_name"]', "Pop")
  await page.fill('[name="phone"]', "0722000000")
  await page.fill('[name="address_1"]', "Str. Florilor 1")
  await page.fill('[name="city"]', "Cluj-Napoca")
  await page.fill('[name="postal_code"]', "400001")
  await page.selectOption('[name="province"]', "Cluj")
  // check-row: click pe label in loc de input ascuns
  await page.locator("label.check-row", { hasText: /livrare implicita/i }).click()
  await page.locator("label.check-row", { hasText: /facturare implicita/i }).click()
  await page.locator("button", { hasText: /salveaza adresa/i }).click()

  await expect(page.locator("h3", { hasText: /adresa noua/i })).not.toBeVisible({ timeout: 10000 })
  await expect(page.locator("text=Str. Florilor 1")).toBeVisible({ timeout: 10000 })
  await expect(page.locator(".badge.stock-in", { hasText: /livrare implicita/i })).toBeVisible()

  // ── Adauga a doua adresa ──────────────────────────────────────────────────────
  await page.locator("button", { hasText: /adauga adresa/i }).click()
  await expect(page.locator("h3", { hasText: /adresa noua/i })).toBeVisible()

  await page.fill('[name="address_name"]', "Birou")
  await page.fill('[name="first_name"]', "Maria")
  await page.fill('[name="last_name"]', "Pop")
  await page.fill('[name="phone"]', "0722111111")
  await page.fill('[name="address_1"]', "Str. Muncii 5")
  await page.fill('[name="city"]', "Cluj-Napoca")
  await page.fill('[name="postal_code"]', "400002")
  await page.selectOption('[name="province"]', "Cluj")
  await page.locator("button", { hasText: /salveaza adresa/i }).click()

  await expect(page.locator("h3", { hasText: /adresa noua/i })).not.toBeVisible({ timeout: 10000 })
  await expect(page.locator("text=Str. Muncii 5")).toBeVisible({ timeout: 10000 })

  // ── Editeaza prima adresa ─────────────────────────────────────────────────────
  const acasaCard = addressPanel(page, "Str. Florilor 1")
  await acasaCard.locator("button", { hasText: /editeaza/i }).click()
  await expect(page.locator("h3", { hasText: /editeaza adresa/i })).toBeVisible()
  await page.locator('[name="phone"]').fill("0733999999")
  await page.locator("button", { hasText: /^salveaza$/i }).click()
  await expect(page.locator("h3", { hasText: /editeaza adresa/i })).not.toBeVisible({ timeout: 10000 })
  await expect(page.locator("text=0733999999")).toBeVisible()

  // ── Seteaza "Birou" ca livrare implicita ──────────────────────────────────────
  const birouCard = addressPanel(page, "Str. Muncii 5")
  await expect(birouCard.locator("button", { hasText: /seteaza livrare/i })).toBeVisible()
  await birouCard.locator("button", { hasText: /seteaza livrare/i }).click()
  await expect(birouCard.locator(".badge.stock-in", { hasText: /livrare implicita/i })).toBeVisible({ timeout: 10000 })

  // ── Sterge adresa "Birou" ─────────────────────────────────────────────────────
  page.on("dialog", (d) => d.accept())
  await birouCard.locator("button", { hasText: /sterge/i }).click()
  await expect(page.locator("text=Str. Muncii 5")).not.toBeVisible({ timeout: 10000 })
  await expect(page.locator("text=Str. Florilor 1")).toBeVisible()
})
