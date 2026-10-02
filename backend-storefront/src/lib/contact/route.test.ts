import { beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"
const guard = vi.hoisted(() => vi.fn())
vi.mock("@lib/contact/rate-limit", () => ({ admitContact: guard }))
const valid = { name: "Review", email: "review@example.invalid", message: "Test" }
function request(body: unknown) { return new NextRequest("https://test.ardmag.ro/api/contact", {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }) }
describe("contact endpoint", () => {
  beforeEach(() => {
    vi.resetModules(); vi.resetAllMocks()
    vi.stubEnv("SMTP2GO_API_KEY", "mock-only")
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: { succeeded: 1 } }) }))
    guard.mockResolvedValue(true)
  })
  it("sends only to the administrator, never to arbitrary visitors", async () => {
    const { POST } = await import("../../app/api/contact/route")
    expect((await POST(request(valid))).status).toBe(200)
    expect(fetch).toHaveBeenCalledOnce()
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string)
    expect(body.to).not.toContain(valid.email)
  })
  it("rejects malformed fields before invoking guard or email", async () => {
    const { POST } = await import("../../app/api/contact/route")
    expect((await POST(request({ ...valid, email: [] }))).status).toBe(400)
    expect(guard).not.toHaveBeenCalled(); expect(fetch).not.toHaveBeenCalled()
  })
  it("blocks excess messages before email delivery", async () => {
    guard.mockResolvedValue(false)
    const { POST } = await import("../../app/api/contact/route")
    expect((await POST(request(valid))).status).toBe(429)
    expect(fetch).not.toHaveBeenCalled()
  })
  it("fails closed if the shared limiter is unavailable", async () => {
    guard.mockRejectedValue(new Error("Unavailable"))
    const { POST } = await import("../../app/api/contact/route")
    expect((await POST(request(valid))).status).toBe(503)
    expect(fetch).not.toHaveBeenCalled()
  })
  it("handles provider errors", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("provider"))
    const { POST } = await import("../../app/api/contact/route")
    expect((await POST(request(valid))).status).toBe(502)
  })
  it("drops honeypot submissions", async () => {
    const { POST } = await import("../../app/api/contact/route")
    expect((await POST(request({ ...valid, website: "spam" }))).status).toBe(200)
    expect(guard).not.toHaveBeenCalled(); expect(fetch).not.toHaveBeenCalled()
  })
})
