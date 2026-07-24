import { describe, it, expect, vi, beforeEach } from "vitest"

// Regresie incident #32: sitemap fara articole de blog, livrat tacut.
// Contract: (1) toate articolele publicabile din content/blog intra in sitemap;
// (2) generarea e fail-closed - liste goale sau erori arunca, nu livreaza gol.

const { listArticlesMock, listProductsMock, listCategoriesMock } = vi.hoisted(() => ({
  listArticlesMock: vi.fn(),
  listProductsMock: vi.fn(),
  listCategoriesMock: vi.fn(),
}))

vi.mock("@lib/blog", () => ({ listArticles: listArticlesMock }))
vi.mock("@lib/data/products", () => ({ listProducts: listProductsMock }))
vi.mock("@lib/data/categories", () => ({ listCategories: listCategoriesMock }))
vi.mock("@lib/util/env", () => ({ getBaseURL: () => "https://ardmag.ro" }))

import sitemap from "../sitemap"

function stubCatalog() {
  listCategoriesMock.mockResolvedValue([{ handle: "mastici-tenax" }])
  listProductsMock.mockResolvedValue({
    response: {
      products: [{ handle: "mastic-lichid", updated_at: "2026-06-09T00:00:00Z" }],
      count: 1,
    },
    nextPage: null,
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  stubCatalog()
})

describe("sitemap", () => {
  it("contine toate articolele publicabile, dar nu un articol cu data viitoare", async () => {
    const { listArticles } = await vi.importActual<typeof import("@lib/blog")>("@lib/blog")
    listArticlesMock.mockImplementation(listArticles)
    const publishable = await listArticles()

    const entries = await sitemap()
    const urls = entries.map((e) => e.url)

    expect(publishable.length).toBeGreaterThan(0)
    for (const article of publishable) {
      expect(urls).toContain(`https://ardmag.ro/blog/${article.slug}`)
    }
    expect(urls).not.toContain("https://ardmag.ro/blog/reumplerea-porilor-travertin-doua-treceri-rasina")
    expect(urls).toContain("https://ardmag.ro/products/mastic-lichid")
    expect(urls).toContain("https://ardmag.ro/categories/mastici-tenax")
  })

  it("este fail-closed: 0 articole de blog => generarea arunca (nu sitemap gol)", async () => {
    listArticlesMock.mockResolvedValue([])
    await expect(sitemap()).rejects.toThrow(/articole de blog/)
  })

  it("este fail-closed: eroarea din listProducts se propaga (fara .catch fail-open)", async () => {
    listArticlesMock.mockResolvedValue([
      { slug: "x", publishedAt: "2026-01-01", title: "x", description: "x" },
    ])
    listProductsMock.mockRejectedValue(new Error("Medusa API down"))
    await expect(sitemap()).rejects.toThrow(/Medusa API down/)
  })

  it("este fail-closed: 0 produse sau 0 categorii => generarea arunca", async () => {
    listArticlesMock.mockResolvedValue([
      { slug: "x", publishedAt: "2026-01-01", title: "x", description: "x" },
    ])
    listProductsMock.mockResolvedValue({
      response: { products: [], count: 0 },
      nextPage: null,
    })
    await expect(sitemap()).rejects.toThrow(/produse/)
  })
})
