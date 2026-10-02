import { afterEach, expect, it, vi } from "vitest"

afterEach(() => { vi.unstubAllEnvs(); vi.resetModules() })

it("keeps production on its configured backend even when preview overrides exist", async () => {
  vi.stubEnv("VERCEL_ENV", "production")
  vi.stubEnv("MEDUSA_BACKEND_URL", "https://api.ardmag.ro")
  vi.stubEnv("NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY", "production-key")
  vi.stubEnv("STAGING_MEDUSA_BACKEND_URL", "https://medusa-staging-a4fc.up.railway.app")
  vi.stubEnv("STAGING_MEDUSA_PUBLISHABLE_KEY", "staging-key")
  const env = await import("./medusa-env")
  expect(env.medusaBackendUrl).toBe("https://api.ardmag.ro")
  expect(env.medusaPublishableKey).toBe("production-key")
})

it("uses the isolated staging backend and key together on a catalog preview", async () => {
  vi.stubEnv("VERCEL_ENV", "preview")
  vi.stubEnv("MEDUSA_BACKEND_URL", "https://api.ardmag.ro")
  vi.stubEnv("NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY", "production-key")
  vi.stubEnv("STAGING_MEDUSA_BACKEND_URL", "https://medusa-staging-a4fc.up.railway.app")
  vi.stubEnv("STAGING_MEDUSA_PUBLISHABLE_KEY", "staging-key")
  const env = await import("./medusa-env")
  expect(env.medusaBackendUrl).toBe("https://medusa-staging-a4fc.up.railway.app")
  expect(env.medusaPublishableKey).toBe("staging-key")
})

it("refuses a preview override pointing at production", async () => {
  vi.stubEnv("VERCEL_ENV", "preview")
  vi.stubEnv("STAGING_MEDUSA_BACKEND_URL", "https://api.ardmag.ro")
  vi.stubEnv("STAGING_MEDUSA_PUBLISHABLE_KEY", "staging-key")
  await expect(import("./medusa-env")).rejects.toThrow("isolated backend")
})
