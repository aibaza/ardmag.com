// DESIGN PENDING: cover image reala (21:9) per articol — R2 upload pattern
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { SiteHeaderShell } from "@modules/layout/site-header"
import { SiteFooter } from "@modules/layout/site-footer"
import { ArticleTocObserver } from "@modules/blog/ArticleTocObserver"
import { ShareCopyButton } from "@modules/blog/ShareCopyButton"
import {
  getArticle,
  listArticles,
  getPrevNext,
  extractToc,
  formatDate,
  formatDateShort,
} from "@lib/blog"

type Props = {
  params: Promise<{ slug: string; countryCode: string }>
}

export async function generateStaticParams() {
  const articles = await listArticles()
  return articles.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) return {}
  const ogImage = article.ogImage ?? article.heroImage ?? "/opengraph-image.jpg"
  const ogImageSize = article.ogImage
    ? { width: 1200, height: 630 }
    : {
        width: article.heroImageWidth ?? 1376,
        height: article.heroImageHeight ?? 768,
      }
  const articleUrl = `/blog/${slug}`
  return {
    title: { absolute: article.title },
    description: article.description,
    alternates: { canonical: articleUrl },
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      url: articleUrl,
      siteName: "ARDMAG",
      locale: "ro_RO",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt ?? article.publishedAt,
      images: [
        {
          url: ogImage,
          width: ogImageSize.width,
          height: ogImageSize.height,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      images: [ogImage],
    },
  }
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug, countryCode } = await params
  const [article, { prev, next }, allArticles] = await Promise.all([
    getArticle(slug),
    getPrevNext(slug),
    listArticles(),
  ])
  if (!article) notFound()

  const toc = extractToc(article.html)
  const articleTags = new Set(article.tags ?? [])
  const related = allArticles
    .filter((a) => a.slug !== slug)
    .map((candidate) => ({
      candidate,
      sharedTags: (candidate.tags ?? []).filter((tag) => articleTags.has(tag)).length,
      sameTopic:
        candidate.kicker?.split("·")[0].trim() === article.kicker?.split("·")[0].trim()
          ? 1
          : 0,
    }))
    .filter(({ sharedTags, sameTopic }) => sharedTags > 0 || sameTopic > 0)
    .sort(
      (a, b) =>
        b.sharedTags - a.sharedTags ||
        b.sameTopic - a.sameTopic ||
        b.candidate.publishedAt.localeCompare(a.candidate.publishedAt)
    )
    .slice(0, 3)
    .map(({ candidate }) => candidate)
  const authorInitials = (article.author ?? "Echipa ardmag")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <>
      <SiteHeaderShell countryCode={countryCode} />

      {/* ── ARTICLE HEAD ── */}
      <header className={`article-head${article.heroImage ? " article-head--hero" : ""}`}>
        {article.heroImage && (
          <>
            <img className="hero-bg" src={article.heroImage} alt="" aria-hidden="true" />
            <div className="hero-overlay" aria-hidden="true" />
          </>
        )}
        <div className="wrap">
          <nav className="article-crumbs" aria-label="breadcrumb">
            <Link href="/">Acasa</Link>
            <span className="sep">/</span>
            <Link href="/blog">Blog</Link>
            {article.kicker && (
              <>
                <span className="sep">/</span>
                <span className="cur">{article.kicker.split("·")[0].trim()}</span>
              </>
            )}
          </nav>

          <div className="inner">
            {article.kicker && (
              <span className="article-eyebrow">
                {article.kicker} · {article.readingTime} min citire
              </span>
            )}
            <h1 className="article-title">{article.title}</h1>
            <p className="article-deck">{article.description}</p>

            <div className="article-meta">
              <div className="author">
                <div className="avatar">{authorInitials}</div>
                <div className="author-text">
                  <strong>{article.author ?? "Echipa ardmag"}</strong>
                  <span>Catalog &amp; suport tehnic</span>
                </div>
              </div>
              <div className="meta-sep" />
              <div className="meta-item">
                <span className="lbl">Publicat</span>
                <span className="val">{formatDateShort(article.publishedAt)}</span>
              </div>
              {article.updatedAt && article.updatedAt !== article.publishedAt && (
                <>
                  <div className="meta-sep" />
                  <div className="meta-item">
                    <span className="lbl">Actualizat</span>
                    <span className="val">{formatDateShort(article.updatedAt)}</span>
                  </div>
                </>
              )}
              <div className="actions-right">
                <ShareCopyButton variant="icon" />
                <a
                  href={`mailto:?subject=${encodeURIComponent(article.title)}`}
                  className="icon-btn"
                  aria-label="trimite pe email"
                >
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="4" width="16" height="13" rx="1" />
                    <path d="m2 4 8 8 8-8" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>


      {/* ── ARTICLE BODY + ASIDE ── */}
      <div className="article-wrap">
        <article
          className="prose-article"
          dangerouslySetInnerHTML={{ __html: article.html }}
        />

        {toc.length > 0 && (
          <aside className="article-aside" aria-label="Cuprins">
            <nav className="toc">
              <h6>Cuprins</h6>
              <ol>
                {toc.map((item) => (
                  <li
                    key={item.id}
                    data-id={item.id}
                    className={item.level === 3 ? "sub" : ""}
                  >
                    <a href={`#${item.id}`}>{item.text}</a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="aside-card aside-share">
              <h6>Distribuie</h6>
              <ShareCopyButton variant="full" />
            </div>

            {article.tags && article.tags.length > 0 && (
              <div className="aside-card">
                <h6>Etichete</h6>
                <div className="tag-list">
                  {article.tags.map((tag) => (
                    <a key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`}>
                      {tag}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* ── ARTICLE FOOT ── */}
      <div className="article-foot">
        <div className="article-foot-inner">
          {article.tags && article.tags.length > 0 && (
            <div className="article-tags">
              <span className="lbl">Etichete</span>
              {article.tags.map((tag) => (
                <a key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`}>
                  {tag}
                </a>
              ))}
            </div>
          )}

          <div className="author-bio">
            <div className="avatar-lg">{authorInitials}</div>
            <div>
              <h4 className="b-name">{article.author ?? "Echipa ardmag"}</h4>
              <div className="b-role">Catalog &amp; suport tehnic · Cluj-Napoca</div>
              <p className="b-text">
                Publicăm ghiduri despre produsele din catalogul nostru și despre utilizările confirmate în documentația tehnică a producătorilor.
              </p>
              <div className="b-links">
                <Link href="/blog">Toate articolele →</Link>
                <Link href="/contact">Întreabă-ne</Link>
              </div>
            </div>
          </div>

          {(prev || next) && (
            <nav className="article-nav" aria-label="navigare articole">
              {prev ? (
                <Link href={`/blog/${prev.slug}`} className="prev">
                  <span className="an-lbl">← Articolul anterior</span>
                  <span className="an-ttl">{prev.title}</span>
                </Link>
              ) : (
                <div />
              )}
              {next && (
                <Link href={`/blog/${next.slug}`} className="next">
                  <span className="an-lbl">Articolul urmator →</span>
                  <span className="an-ttl">{next.title}</span>
                </Link>
              )}
            </nav>
          )}
        </div>
      </div>

      {/* Articole editoriale conexe, separate de recomandările comerciale din articol. */}
      {related.length >= 2 && (
        <section className="related-articles">
          <div className="sec-head">
            <h3>Articole conexe</h3>
            <Link href="/blog" className="see-all">Toate articolele →</Link>
          </div>
          <div className="article-grid">
            {related.map((a) => (
              <Link key={a.slug} href={`/blog/${a.slug}`} className="acard">
                <div className="a-img-wrap">
                  {a.heroImage ? (
                    <img src={a.heroImage} alt="" loading="lazy" />
                  ) : (
                    <div className="a-img-phld" aria-hidden="true" />
                  )}
                </div>
                <div className="a-meta">
                  <span className="cat">{a.kicker?.split("·")[0].trim() ?? "Blog"}</span>
                  <span>· {formatDate(a.publishedAt)}</span>
                </div>
                <h4 className="a-title">{a.title}</h4>
                <p className="a-deck">{a.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <SiteFooter countryCode={countryCode} />

      <ArticleTocObserver headingIds={toc.map((t) => t.id)} />
    </>
  )
}
