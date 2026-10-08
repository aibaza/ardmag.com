import { beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"
import { createHmac } from "node:crypto"
const guard = vi.hoisted(() => vi.fn())
vi.mock("@lib/contact/rate-limit", () => ({ admitContact: guard }))
const valid = {
  name: "Review",
  email: "review@example.invalid",
  message: "Test",
}
const requestId = "c6a34f4c-3d50-4d5e-9db1-df65bf399471"
function request(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest("https://test.ardmag.ro/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  })
}
describe("contact endpoint", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.resetAllMocks()
    vi.stubEnv("SMTP2GO_API_KEY", "mock-only")
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: { succeeded: 1 } }),
      })
    )
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
    expect(guard).not.toHaveBeenCalled()
    expect(fetch).not.toHaveBeenCalled()
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
    expect((await POST(request({ ...valid, website: "spam" }))).status).toBe(
      200
    )
    expect(guard).not.toHaveBeenCalled()
    expect(fetch).not.toHaveBeenCalled()
  })
  it("sends consented Worker submissions with a namespaced stable id and exact-body HMAC", async () => {
    vi.stubEnv("CONTACT_WORKER_ENABLED", "1")
    vi.stubEnv("VERCEL", "1")
    vi.stubEnv("LEADS_WORKER_URL", "https://leads.example.test")
    vi.stubEnv("SITE_KEY_ARDMAG", "test-site-key")
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          ok: true,
          submission_id: `ardmag-contact-${requestId}`,
        }),
      })
    )
    const { POST } = await import("../../app/api/contact/route")
    expect(
      (
        await POST(
          request(
            {
              ...valid,
              consent: true,
              request_id: requestId,
              source_client_ip: "203.0.113.99",
            },
            { "x-forwarded-for": "198.51.100.42, 10.0.0.1" }
          )
        )
      ).status
    ).toBe(200)
    expect(fetch).toHaveBeenCalledOnce()
    const [url, options] = vi.mocked(fetch).mock.calls[0]
    expect(String(url)).toBe("https://leads.example.test/submit")
    const text = options!.body as string
    const payload = JSON.parse(text)
    expect(payload).toMatchObject({
      client_code: "ardmag",
      form_type: "contact",
      submission_id: `ardmag-contact-${requestId}`,
      gdpr: true,
      source_client_ip: "198.51.100.42",
      email: valid.email,
    })
    expect(options!.headers).toMatchObject({
      "X-Site-Sig": createHmac("sha256", "test-site-key")
        .update(text, "utf8")
        .digest("hex"),
    })
    expect(options!.redirect).toBe("error")
    expect(options!.signal).toBeDefined()
  })
  it.each([
    { consent: false, request_id: requestId },
    { consent: true, request_id: "not-a-uuid" },
  ])(
    "rejects Worker requests without actual consent and UUID identity",
    async (workerFields) => {
      vi.stubEnv("CONTACT_WORKER_ENABLED", "1")
      vi.stubEnv("LEADS_WORKER_URL", "https://leads.example.test")
      vi.stubEnv("SITE_KEY_ARDMAG", "test-site-key")
      const { POST } = await import("../../app/api/contact/route")
      expect((await POST(request({ ...valid, ...workerFields }))).status).toBe(
        400
      )
      expect(fetch).not.toHaveBeenCalled()
      expect(guard).not.toHaveBeenCalled()
    }
  )
  it("fails closed on Worker errors without falling back to SMTP", async () => {
    vi.stubEnv("CONTACT_WORKER_ENABLED", "1")
    vi.stubEnv("LEADS_WORKER_URL", "https://leads.example.test")
    vi.stubEnv("SITE_KEY_ARDMAG", "test-site-key")
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("uncertain response"))
    )
    const { POST } = await import("../../app/api/contact/route")
    expect(
      (await POST(request({ ...valid, consent: true, request_id: requestId })))
        .status
    ).toBe(502)
    expect(fetch).toHaveBeenCalledOnce()
    expect(vi.mocked(fetch).mock.calls[0][0]).toBeInstanceOf(URL)
  })
  it("does not call SMTP when Worker configuration is incomplete", async () => {
    vi.stubEnv("CONTACT_WORKER_ENABLED", "1")
    vi.stubEnv("LEADS_WORKER_URL", "")
    vi.stubEnv("SITE_KEY_ARDMAG", "test-site-key")
    const { POST } = await import("../../app/api/contact/route")
    expect(
      (await POST(request({ ...valid, consent: true, request_id: requestId })))
        .status
    ).toBe(503)
    expect(fetch).not.toHaveBeenCalled()
  })
})
