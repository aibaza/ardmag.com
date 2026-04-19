// Server component — async, fetches categories

import { listCategories } from "@lib/data/categories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function CatNav() {
  const categories = await listCategories()
  const topLevel = categories.filter((c) => !c.parent_category)

  return (
    <nav
      style={{
        borderTop: "1px solid var(--rule)",
        background: "var(--surface)",
      }}
    >
      <style>{`
        .cat-nav-link {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          font-size: 13px;
          color: var(--stone-800);
          text-decoration: none;
          border-bottom: 2px solid transparent;
          white-space: nowrap;
        }
        .cat-nav-link:hover {
          color: var(--brand-700);
          background: var(--stone-50);
        }
        .cat-nav-link--all {
          background: var(--stone-900);
          color: #ffffff;
          margin-right: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 12px 16px;
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          white-space: nowrap;
        }
        .cat-nav-link--all:hover {
          background: var(--stone-800);
          color: #ffffff;
        }
        .cat-nav-link--external {
          color: var(--fg-muted);
          text-decoration: none;
          padding: 12px 16px;
          font-size: 13px;
          white-space: nowrap;
        }
        .cat-nav-link--external:hover {
          color: var(--fg);
        }
      `}</style>
      <div
        className="mx-auto flex items-stretch"
        style={{
          maxWidth: "1400px",
          padding: "0 24px",
          gap: "2px",
          overflowX: "auto",
        }}
      >
        {/* "Toate" — all products link */}
        <LocalizedClientLink href="/store" className="cat-nav-link--all">
          {/* Grid icon (4 squares) */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
          >
            <rect x="0" y="0" width="6" height="6" fill="currentColor" />
            <rect x="8" y="0" width="6" height="6" fill="currentColor" />
            <rect x="0" y="8" width="6" height="6" fill="currentColor" />
            <rect x="8" y="8" width="6" height="6" fill="currentColor" />
          </svg>
          Toate
        </LocalizedClientLink>

        {/* Category links */}
        {topLevel.map((cat) => (
          <LocalizedClientLink
            key={cat.id}
            href={`/categories/${cat.handle}`}
            className="cat-nav-link"
          >
            {cat.name}
          </LocalizedClientLink>
        ))}

        {/* External Tenax link — ml-auto pushes it right */}
        <div className="ml-auto flex items-stretch">
          <a
            href="https://tenax.com"
            target="_blank"
            rel="noreferrer"
            className="cat-nav-link--external"
          >
            &uarr; Tenax Romania
          </a>
        </div>
      </div>
    </nav>
  )
}
