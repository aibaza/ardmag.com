import { describe, expect, it } from "vitest"
import {
  EDGE_LANDING_EVENT,
  SITE_KEY,
  buildEdgeLandingEvent,
  detectLandingMarker,
  isCountableLanding,
} from "../edge-landing"

const url = (u: string) => new URL(u)

describe("detectLandingMarker", () => {
  it("prinde fbclid chiar si fara utm-uri pe reclama", () => {
    expect(detectLandingMarker(url("https://ardmag.ro/promotii?fbclid=ABC123"))).toBe("fbclid")
  })

  it("prinde utm_source cand reclama nu poarta fbclid", () => {
    expect(
      detectLandingMarker(url("https://ardmag.ro/promotii?utm_source=facebook&utm_medium=paid"))
    ).toBe("utm")
  })

  it("da prioritate lui fbclid fata de utm", () => {
    expect(
      detectLandingMarker(url("https://ardmag.ro/?fbclid=ABC&utm_source=newsletter"))
    ).toBe("fbclid")
  })

  it("nu numara traficul direct sau organic", () => {
    expect(detectLandingMarker(url("https://ardmag.ro/promotii"))).toBeNull()
    expect(detectLandingMarker(url("https://ardmag.ro/?q=tenax"))).toBeNull()
  })

  it("ignora parametrii goi sau numai spatii", () => {
    expect(detectLandingMarker(url("https://ardmag.ro/?fbclid=&utm_source=%20"))).toBeNull()
  })
})

describe("isCountableLanding", () => {
  const base = { method: "GET", userAgent: "Mozilla/5.0 (iPhone)", isPrefetch: false }

  it("numara o aterizare GET umana", () => {
    expect(isCountableLanding(base)).toBe(true)
  })

  it("nu numara prefetch-urile Next: nu sunt aterizari", () => {
    expect(isCountableLanding({ ...base, isPrefetch: true })).toBe(false)
  })

  it("nu numara cererile non-GET", () => {
    expect(isCountableLanding({ ...base, method: "POST" })).toBe(false)
  })

  it("nu numara crawlerul care randeaza preview-ul reclamei", () => {
    expect(
      isCountableLanding({ ...base, userAgent: "facebookexternalhit/1.1" })
    ).toBe(false)
  })

  it("nu numara boti generici", () => {
    expect(isCountableLanding({ ...base, userAgent: "Googlebot/2.1" })).toBe(false)
    expect(isCountableLanding({ ...base, userAgent: "curl/8.5.0" })).toBe(false)
  })

  it("numara si cand user-agent lipseste: fail-open spre a numara", () => {
    expect(isCountableLanding({ ...base, userAgent: null })).toBe(true)
  })
})

describe("buildEdgeLandingEvent", () => {
  it("nu scurge fbclid nicaieri in payload", () => {
    const event = buildEdgeLandingEvent({
      url: url("https://ardmag.ro/promotii?fbclid=SECRET_CLICK_ID&utm_source=facebook"),
      marker: "fbclid",
      referrer: "https://m.facebook.com/",
      country: "RO",
    })

    expect(JSON.stringify(event)).not.toContain("SECRET_CLICK_ID")
    expect(JSON.stringify(event)).not.toContain("fbclid=")
  })

  it("pastreaza doar path-ul, fara query string", () => {
    const event = buildEdgeLandingEvent({
      url: url("https://ardmag.ro/promotii?fbclid=ABC"),
      marker: "fbclid",
    })
    expect(event.path).toBe("/promotii")
  })

  it("trimite campania si markerul, pe site-ul asteptat", () => {
    const event = buildEdgeLandingEvent({
      url: url(
        "https://ardmag.ro/?utm_source=facebook&utm_medium=paid&utm_campaign=tenax-30&utm_content=v2"
      ),
      marker: "utm",
      referrer: "https://m.facebook.com/",
      country: "RO",
    })

    expect(event.site).toBe(SITE_KEY)
    expect(event.event).toBe(EDGE_LANDING_EVENT)
    expect(event.utm_source).toBe("facebook")
    expect(event.utm_medium).toBe("paid")
    expect(event.utm_campaign).toBe("tenax-30")
    expect(event.utm_content).toBe("v2")
    expect(event.resolved_via).toBe("edge_middleware")
    expect(event.extra).toEqual({ marker: "utm", country: "RO" })
  })

  it("reduce referrer-ul la domeniu, fara path sau query", () => {
    const event = buildEdgeLandingEvent({
      url: url("https://ardmag.ro/?fbclid=ABC"),
      marker: "fbclid",
      referrer: "https://m.facebook.com/story.php?id=123&user=ion",
    })
    expect(event.ref).toBe("m.facebook.com")
  })

  // Browserul in-app Facebook pe Android trimite referrer android-app://<pachet>.
  // E un URL valid, iar hostname-ul e chiar pachetul aplicatiei: semnal util
  // (aterizare din aplicatia FB), nu identificator de persoana.
  it("recunoaste aterizarea din browserul in-app Facebook", () => {
    const event = buildEdgeLandingEvent({
      url: url("https://ardmag.ro/?fbclid=ABC"),
      marker: "fbclid",
      referrer: "android-app://com.facebook.katana",
    })
    expect(event.ref).toBe("com.facebook.katana")
  })

  it("nu crapa pe referrer care nu e URL", () => {
    const event = buildEdgeLandingEvent({
      url: url("https://ardmag.ro/?fbclid=ABC"),
      marker: "fbclid",
      referrer: "not a url",
    })
    expect(event.ref).toBe("")
  })

  it("omite tara cand edge-ul nu o cunoaste", () => {
    const event = buildEdgeLandingEvent({
      url: url("https://ardmag.ro/?fbclid=ABC"),
      marker: "fbclid",
      country: null,
    })
    expect(event.extra).toEqual({ marker: "fbclid" })
  })
})
