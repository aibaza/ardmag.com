import fs from "node:fs/promises"
import path from "node:path"
import matter from "gray-matter"
import { remark } from "remark"
import remarkGfm from "remark-gfm"
import remarkHtml from "remark-html"

const BLOG_DIR = path.join(process.cwd(), "content", "blog")

export type BlogFrontmatter = {
  title: string
  description: string
  kicker?: string
  publishedAt: string
  updatedAt?: string
  author?: string
  tags?: string[]
  heroImage?: string
}

export type BlogListItem = BlogFrontmatter & { slug: string }
export type BlogArticle = BlogListItem & { html: string; readingTime: number }
export type TocItem = { id: string; text: string; level: 2 | 3 }

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function addHeadingIds(html: string): string {
  return html.replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (_, level, attrs, inner) => {
      const text = inner.replace(/<[^>]+>/g, "").trim()
      const id = slugify(text)
      return `<h${level}${attrs} id="${id}">${inner}</h${level}>`
    }
  )
}

export function extractToc(html: string): TocItem[] {
  const items: TocItem[] = []
  const regex = /<h([23])[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h[23]>/gi
  let match
  while ((match = regex.exec(html)) !== null) {
    items.push({
      level: parseInt(match[1]) as 2 | 3,
      id: match[2],
      text: match[3].replace(/<[^>]+>/g, "").trim(),
    })
  }
  return items
}

export function readingTime(html: string): number {
  const words = html.replace(/<[^>]+>/g, "").split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

async function parseFile(filename: string): Promise<BlogListItem | null> {
  if (!filename.endsWith(".md")) return null
  const slug = filename.replace(/\.md$/, "")
  try {
    const raw = await fs.readFile(path.join(BLOG_DIR, filename), "utf-8")
    const { data } = matter(raw)
    return { slug, ...(data as BlogFrontmatter) }
  } catch {
    return null
  }
}

export async function listArticles(): Promise<BlogListItem[]> {
  let files: string[]
  try {
    files = await fs.readdir(BLOG_DIR)
  } catch {
    return []
  }
  const items = await Promise.all(files.map(parseFile))
  return items
    .filter((x): x is BlogListItem => x !== null)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}

export async function getArticle(slug: string): Promise<BlogArticle | null> {
  const filePath = path.join(BLOG_DIR, `${slug}.md`)
  let raw: string
  try {
    raw = await fs.readFile(filePath, "utf-8")
  } catch {
    return null
  }
  const { data, content } = matter(raw)
  const processed = await remark().use(remarkGfm).use(remarkHtml).process(content)
  const html = addHeadingIds(processed.toString())
  return {
    slug,
    ...(data as BlogFrontmatter),
    html,
    readingTime: readingTime(html),
  }
}

export async function getPrevNext(currentSlug: string): Promise<{
  prev: BlogListItem | null
  next: BlogListItem | null
}> {
  const articles = await listArticles()
  const idx = articles.findIndex((a) => a.slug === currentSlug)
  return {
    prev: idx > 0 ? articles[idx - 1] : null,
    next: idx < articles.length - 1 ? articles[idx + 1] : null,
  }
}

export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("ro-RO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function formatDateShort(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}
