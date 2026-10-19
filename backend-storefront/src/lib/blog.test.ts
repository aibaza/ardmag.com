import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import { describe, expect, it } from "vitest"
import { isPublishableArticle, renderArticleMarkdown } from "./blog"

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

  it("ține articolul lipirea la 45° privat înainte de publishedAt și îl face publicabil la termen", () => {
    const articlePath = path.join(
      process.cwd(),
      "content/blog/lipirea-la-45-eviti-fisurarea-muchiei.md"
    )
    const { data } = matter(fs.readFileSync(articlePath, "utf8"))

    expect(
      isPublishableArticle(data, new Date("2026-07-29T23:59:59.999Z"))
    ).toBe(false)
    expect(
      isPublishableArticle(data, new Date("2026-07-30T00:00:00.000Z"))
    ).toBe(true)
  })
})


describe("article contact links", () => {
  it("keeps telephone and email links actionable", async () => {
    const html = await renderArticleMarkdown(
      "[+40 722 155 441](tel:+40722155441) [Email](mailto:office@example.com)"
    )
    expect(html).toContain('href="tel:+40722155441"')
    expect(html).toContain('href="mailto:office@example.com"')
  })

  it.each(["javascript:alert(1)", "data:text/html,test", "vbscript:test"])(
    "still removes an unsafe link: %s",
    async (url) => {
      const html = await renderArticleMarkdown(`[unsafe](${url})`)
      expect(html).not.toContain("href=")
    }
  )

  it("still removes raw HTML and preserves normal links and headings", async () => {
    const html = await renderArticleMarkdown(
      '<script>alert(1)</script>\n\n## Contact\n\n[Web](https://example.com) [Local](/contact)'
    )
    expect(html).not.toContain("<script")
    expect(html).toContain('href="https://example.com"')
    expect(html).toContain('href="/contact"')
    expect(html).toContain('<h2 id="contact">Contact</h2>')
  })
})
