import type { Metadata } from "next"
import Link from "next/link"
import { SiteHeaderShell } from "@modules/layout/site-header"
import { SiteFooter } from "@modules/layout/site-footer"
import { listArticles, formatDate } from "@lib/blog"

export const metadata: Metadata = {
  title: "Blog | Ardmag",
  description: "Ghiduri tehnice si articole despre prelucrarea pietrei naturale, scule diamantate si abrazive profesionale.",
}

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const articles = await listArticles()

  return (
    <>
      <SiteHeaderShell countryCode={countryCode} />

      <header className="blog-head">
        <div className="wrap">
          <h1>Blog</h1>
          <p>Ghiduri tehnice pentru prelucrarea pietrei naturale.</p>
        </div>
      </header>

      <div className="blog-listing">
        {articles.length === 0 ? (
          <p style={{ color: "var(--fg-muted)" }}>Nu exista articole publicate inca.</p>
        ) : (
          <div className="blog-grid">
            {articles.map((article) => (
              <Link key={article.slug} href={`/blog/${article.slug}`} className="acard">
                {article.heroImage ? (
                  <img src={article.heroImage} alt={article.title} className="a-img" style={{ objectFit: "cover" }} />
                ) : (
                  <div className="a-img" />
                )}
                <div className="a-meta">
                  <span className="cat">{article.kicker?.split("·")[0].trim() ?? "Blog"}</span>
                  <span>· {formatDate(article.publishedAt)}</span>
                </div>
                <h2 className="a-title">{article.title}</h2>
                <p className="a-deck">{article.description}</p>
                {article.author && (
                  <div style={{ marginTop: "auto", paddingTop: "12px", fontFamily: "var(--f-mono)", fontSize: "11px", color: "var(--fg-muted)" }}>
                    {article.author}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      <SiteFooter countryCode={countryCode} />
    </>
  )
}
