import { describe, expect, it } from "vitest"
import { isPublishableArticle } from "./blog"

const now = new Date("2026-07-24T12:00:00Z")
const published = {
  title: "Titlu",
  description: "Descriere",
  status: "published",
  review: "PASS",
  publishedAt: "2026-07-24T11:59:59Z",
}

describe("isPublishableArticle", () => {
  it("permite numai un articol publicat, ajuns la data publicării și cu review PASS", () => {
    expect(isPublishableArticle(published, now)).toBe(true)
  })

  it.each([
    [{ ...published, status: "draft" }, "draft"],
    [{ ...published, publishedAt: "2026-07-24T12:00:01Z" }, "future"],
    [{ ...published, review: "BLOCK" }, "review diferit de PASS"],
    [{ ...published, review: undefined }, "review lipsă"],
  ])("respinge %s (%s)", (article) => {
    expect(isPublishableArticle(article, now)).toBe(false)
  })
})
