import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import { describe, expect, it } from "vitest"
import {
  isDraftPreviewEnabled,
  isPreviewableDraft,
  isPublishableArticle,
} from "./blog"

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

describe("previzualizarea de draft", () => {
  const draft = { ...published, status: "draft", review: undefined }

  it("e oprita implicit, fara flag", () => {
    expect(isDraftPreviewEnabled({})).toBe(false)
    expect(isPreviewableDraft(draft, {})).toBe(false)
  })

  it("ramane oprita in productie chiar daca flagul e pus din greseala", () => {
    const env = { PREVIEW_INCLUDE_DRAFTS: "1", VERCEL_ENV: "production" }
    expect(isDraftPreviewEnabled(env)).toBe(false)
    expect(isPreviewableDraft(draft, env)).toBe(false)
  })

  it("se deschide doar pe un deployment de preview cu flagul explicit", () => {
    const env = { PREVIEW_INCLUDE_DRAFTS: "1", VERCEL_ENV: "preview" }
    expect(isDraftPreviewEnabled(env)).toBe(true)
    expect(isPreviewableDraft(draft, env)).toBe(true)
  })

  it("accepta si un draft cu data de publicare in viitor", () => {
    const env = { PREVIEW_INCLUDE_DRAFTS: "1", VERCEL_ENV: "preview" }
    expect(
      isPreviewableDraft({ ...draft, publishedAt: "2030-01-01" }, env)
    ).toBe(true)
  })

  it("refuza un draft fara titlu, descriere sau data valida", () => {
    const env = { PREVIEW_INCLUDE_DRAFTS: "1", VERCEL_ENV: "preview" }
    expect(isPreviewableDraft({ ...draft, title: "  " }, env)).toBe(false)
    expect(isPreviewableDraft({ ...draft, description: undefined }, env)).toBe(false)
    expect(isPreviewableDraft({ ...draft, publishedAt: "candva" }, env)).toBe(false)
  })

  it("nu slabeste gate-ul de publicare", () => {
    const env = { PREVIEW_INCLUDE_DRAFTS: "1", VERCEL_ENV: "preview" }
    process.env.PREVIEW_INCLUDE_DRAFTS = "1"
    process.env.VERCEL_ENV = "preview"
    try {
      expect(isPublishableArticle(draft, now)).toBe(false)
    } finally {
      delete process.env.PREVIEW_INCLUDE_DRAFTS
      delete process.env.VERCEL_ENV
    }
    expect(isDraftPreviewEnabled(env)).toBe(true)
  })
})
