import Link from "next/link"

export default function BlogArticleNotFound() {
  return (
    <div className="page-inner" style={{ textAlign: "center", paddingTop: "4rem" }}>
      <h1>Articol negasit</h1>
      <p style={{ color: "var(--stone-500)", marginTop: "0.5rem" }}>
        Articolul cautat nu exista sau a fost mutat.
      </p>
      <Link
        href="/blog"
        style={{ display: "inline-block", marginTop: "1.5rem", color: "var(--brand-600)", fontWeight: 500 }}
      >
        ← Inapoi la blog
      </Link>
    </div>
  )
}
