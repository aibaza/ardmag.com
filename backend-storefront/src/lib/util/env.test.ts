import { afterEach, describe, expect, it, vi } from "vitest"
import { getBaseURL, getPublicShareURL } from "./env"

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("public URL helpers", () => {
  it("normalizes legacy public base host to ardmag.ro", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_URL", "https://ardmag.surcod.ro")

    expect(getBaseURL()).toBe("https://ardmag.ro")
  })

  it("keeps local development base URL", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_URL", "http://localhost:8000")

    expect(getBaseURL()).toBe("http://localhost:8000")
  })

  it("prefers the preview base URL on validation deployments", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_URL", "https://ardmag.ro")
    vi.stubEnv("NEXT_PUBLIC_PREVIEW_BASE_URL", "https://preview.ardmag.ro")

    expect(getBaseURL()).toBe("https://preview.ardmag.ro")
  })

  it("falls back to the canonical base URL when no preview base is set", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_URL", "https://ardmag.ro")
    vi.stubEnv("NEXT_PUBLIC_PREVIEW_BASE_URL", "")

    expect(getBaseURL()).toBe("https://ardmag.ro")
  })

  it("rewrites legacy share host and keeps path, query, and hash", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_URL", "https://ardmag.ro")

    expect(getPublicShareURL("https://ardmag.surcod.ro/ro/blog/test?utm=x#top")).toBe(
      "https://ardmag.ro/ro/blog/test?utm=x#top"
    )
  })
})
