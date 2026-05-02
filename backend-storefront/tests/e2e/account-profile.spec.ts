import { test, expect } from "@playwright/test"
import { BASE, createTestCustomer, setAuthCookie, dismissCookieBanner } from "./helpers/auth"

test.describe("Account profile", () => {
  test.setTimeout(90000)

  test("Afisare initiala: nume complet, email read-only, telefon", async ({ page, request }) => {
    const { token } = await createTestCustomer(request)
    await setAuthCookie(page, token)
    await page.goto(`${BASE}/account/profile`, { waitUntil: "domcontentloaded", timeout: 30000 })
    await dismissCookieBanner(page)

    await expect(page.getByRole("heading", { name: /profilul meu/i })).toBeVisible({ timeout: 10000 })

    // Randul Nume complet -- arata "Test E2E" (valori create de createTestCustomer)
    const nameRow = page.locator('[data-testid="profile-name-row"]')
    await expect(nameRow).toContainText("Test E2E")
    await expect(nameRow.getByRole("button", { name: "Editeaza" })).toBeVisible()

    // Email read-only -- nu are buton Editeaza, are badge "citire-doar"
    const emailRow = page.locator('[data-testid="profile-row-email"]')
    await expect(page.getByText("citire-doar")).toBeVisible()
    await expect(emailRow.getByRole("button", { name: "Editeaza" })).not.toBeVisible()

    // Randul Telefon
    const phoneRow = page.locator('[data-testid="profile-row-phone"]')
    await expect(phoneRow.getByRole("button", { name: "Editeaza" })).toBeVisible()
  })

  test("Golden path: editeaza nume complet (Prenume + Nume)", async ({ page, request }) => {
    const { token } = await createTestCustomer(request)
    await setAuthCookie(page, token)
    await page.goto(`${BASE}/account/profile`, { waitUntil: "domcontentloaded", timeout: 30000 })
    await dismissCookieBanner(page)

    const nameRow = page.locator('[data-testid="profile-name-row"]')
    await expect(nameRow).toBeVisible({ timeout: 10000 })

    // Deschide edit
    await nameRow.getByRole("button", { name: "Editeaza" }).click()
    await expect(nameRow.getByLabel("Prenume")).toBeVisible()
    await expect(nameRow.getByLabel("Nume", { exact: true })).toBeVisible()

    // Modifica valorile
    await nameRow.getByLabel("Prenume").fill("Maria")
    await nameRow.getByLabel("Nume", { exact: true }).fill("Ionescu")

    // Salveaza
    await nameRow.getByRole("button", { name: "Salveaza" }).click()
    await expect(nameRow.getByRole("button", { name: "Editeaza" })).toBeVisible({ timeout: 10000 })

    // Display actualizat + badge Salvat
    await expect(nameRow).toContainText("Maria Ionescu")
    await expect(nameRow.locator(".badge.stock-in")).toBeVisible()
  })

  test("Golden path: editeaza telefon", async ({ page, request }) => {
    const { token } = await createTestCustomer(request)
    await setAuthCookie(page, token)
    await page.goto(`${BASE}/account/profile`, { waitUntil: "domcontentloaded", timeout: 30000 })
    await dismissCookieBanner(page)

    const phoneRow = page.locator('[data-testid="profile-row-phone"]')
    await expect(phoneRow).toBeVisible({ timeout: 10000 })

    await phoneRow.getByRole("button", { name: "Editeaza" }).click()
    await expect(page.getByLabel("Telefon")).toBeVisible()

    await page.getByLabel("Telefon").fill("+40721999888")

    await phoneRow.getByRole("button", { name: "Salveaza" }).click()
    await expect(phoneRow.getByRole("button", { name: "Editeaza" })).toBeVisible({ timeout: 10000 })

    await expect(phoneRow).toContainText("+40721999888")
    await expect(phoneRow.locator(".badge.stock-in")).toBeVisible()
  })

  test("Cancel restore: modificare anulata nu persista", async ({ page, request }) => {
    const { token } = await createTestCustomer(request)
    await setAuthCookie(page, token)
    await page.goto(`${BASE}/account/profile`, { waitUntil: "domcontentloaded", timeout: 30000 })
    await dismissCookieBanner(page)

    const phoneRow = page.locator('[data-testid="profile-row-phone"]')
    await expect(phoneRow).toBeVisible({ timeout: 10000 })

    await phoneRow.getByRole("button", { name: "Editeaza" }).click()

    const input = page.getByLabel("Telefon")
    await expect(input).toBeVisible()
    const originalValue = await input.inputValue()

    await input.fill("0999000000")
    await phoneRow.getByRole("button", { name: "Anuleaza" }).click()

    // Form inchis, valoarea originala restaurata
    await expect(input).not.toBeVisible()
    if (originalValue) {
      await expect(phoneRow).toContainText(originalValue)
    } else {
      await expect(phoneRow).toContainText("Necompletat")
    }
  })

  test("Email row: nu are buton Editeaza si afiseaza badge citire-doar", async ({ page, request }) => {
    const { token } = await createTestCustomer(request)
    await setAuthCookie(page, token)
    await page.goto(`${BASE}/account/profile`, { waitUntil: "domcontentloaded", timeout: 30000 })
    await dismissCookieBanner(page)
    await expect(page.getByText("citire-doar")).toBeVisible({ timeout: 10000 })

    // Randul email nu are buton Editeaza
    const emailSection = page.locator('[data-testid="profile-row-email"]')
    await expect(emailSection.getByRole("button", { name: "Editeaza" })).not.toBeVisible()
  })
})
