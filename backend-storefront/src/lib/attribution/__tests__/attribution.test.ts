import { describe, expect, it } from "vitest"
import {
  classifyAttributionTouch,
  resolveAttributionSnapshot,
  updateAttributionCookie,
} from "../attribution"

const NOW = new Date("2026-07-04T12:00:00.000Z")

describe("attribution rules", () => {
  it("does not let direct overwrite first or last touch", () => {
    const first = updateAttributionCookie({
      url: "https://ardmag.ro/?fbclid=fb123&utm_campaign=summer",
      now: NOW,
    })

    const next = updateAttributionCookie({
      current: first,
      url: "https://ardmag.ro/",
      now: new Date("2026-07-05T12:00:00.000Z"),
    })

    expect(next.first_touch).toEqual(first.first_touch)
    expect(next.last_touch).toEqual(first.last_touch)
    expect(resolveAttributionSnapshot({ cookie: next }).resolved_source).toBe("facebook")
  })

  it("treats empty utm_source as missing and falls back to direct", () => {
    const touch = classifyAttributionTouch({
      url: "https://ardmag.ro/?utm_source=&utm_medium=cpc",
      now: NOW,
    })

    expect(touch).toBeNull()
  })

  it("treats self-referral as direct", () => {
    const touch = classifyAttributionTouch({
      url: "https://ardmag.ro/discuri",
      referrer: "https://www.ardmag.ro/blog",
      now: NOW,
    })

    expect(touch).toBeNull()
  })

  it("treats legacy ardmag.com self-referral as direct", () => {
    const touch = classifyAttributionTouch({
      url: "https://ardmag.ro/discuri",
      referrer: "https://www.ardmag.com/blog",
      now: NOW,
    })

    expect(touch).toBeNull()
  })

  it("moves last touch only on the latest non-direct visit", () => {
    const first = updateAttributionCookie({
      url: "https://ardmag.ro/?utm_source=newsletter&utm_medium=email&utm_campaign=june",
      now: NOW,
    })
    const second = updateAttributionCookie({
      current: first,
      url: "https://ardmag.ro/?gclid=g123&utm_campaign=shopping",
      now: new Date("2026-07-06T12:00:00.000Z"),
    })

    expect(second.first_touch?.source).toBe("newsletter")
    expect(second.last_touch?.source).toBe("google")
    expect(second.last_touch?.via).toBe("gclid")

    const snapshot = resolveAttributionSnapshot({ cookie: second })
    expect(snapshot).toMatchObject({
      resolved_source: "google",
      resolved_medium: "cpc",
      resolved_campaign: "shopping",
      resolved_via: "gclid",
    })
  })

  it("applies attribution expiry to the resolved last touch", () => {
    const first = updateAttributionCookie({
      url: "https://ardmag.ro/?utm_source=newsletter&utm_medium=email&utm_campaign=old",
      now: new Date("2026-03-26T12:00:00.000Z"),
    })
    const second = updateAttributionCookie({
      current: first,
      url: "https://ardmag.ro/?fbclid=fb123&utm_campaign=summer",
      now: new Date("2026-07-02T12:00:00.000Z"),
    })

    const snapshot = resolveAttributionSnapshot({ cookie: second, now: NOW })

    expect(snapshot).toMatchObject({
      resolved_source: "facebook",
      resolved_medium: "cpc",
      resolved_campaign: "summer",
      resolved_via: "fbclid",
    })
  })
})
