"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import MobileDrawer from "@modules/layout/components/mobile-drawer"
import { CATEGORIES } from "@constants/categories"

interface MainBarProps {
  /** CartButton (server component) passed down from the Nav server component */
  cartButton: React.ReactNode
}

export default function MainBar({ cartButton }: MainBarProps) {
  const [query, setQuery] = useState("")
  const router = useRouter()
  const { countryCode } = useParams<{ countryCode: string }>()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/${countryCode}/store?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <div style={{ background: "var(--surface)" }}>
      <style>{`
        .main-bar-account {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: 8px 12px;
          min-width: 56px;
          text-decoration: none;
          border-radius: var(--r-sm);
          color: var(--stone-800);
        }
        .main-bar-account:hover {
          background: var(--stone-50);
        }
        .search-btn {
          background: var(--brand-500);
          padding: 0 22px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          font-size: 14px;
          color: var(--stone-50);
          border: none;
          cursor: pointer;
          border-radius: 0 var(--r-sm) var(--r-sm) 0;
          font-family: var(--f-sans);
          white-space: nowrap;
          height: 100%;
        }
        .search-btn:hover {
          background: var(--brand-600);
        }
        .search-input {
          flex: 1;
          padding: 0 16px;
          background: transparent;
          border: none;
          outline: none;
          font-family: var(--f-sans);
          font-size: 14px;
          color: var(--fg);
          min-width: 0;
        }
        .search-input::placeholder {
          color: var(--stone-400);
        }
        .search-form {
          display: flex;
          height: 44px;
          border-radius: var(--r-sm);
          border: 1.5px solid var(--stone-300);
          overflow: hidden;
          transition: border-color 0.15s, box-shadow 0.15s;
          width: 100%;
          max-width: 700px;
        }
        .search-form:focus-within {
          border-color: var(--brand-500);
          box-shadow: var(--focus-ring);
        }
      `}</style>

      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "16px 24px",
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          gap: "32px",
          alignItems: "center",
        }}
      >
        {/* LOGO */}
        <LocalizedClientLink
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              background: "var(--stone-900)",
              borderRadius: "var(--r-sm)",
              fontFamily: "var(--f-mono)",
              fontWeight: 600,
              fontSize: "16px",
              letterSpacing: "-0.02em",
              color: "var(--brand-400)",
              flexShrink: 0,
            }}
          >
            am
          </span>
          <span>
            <span
              style={{
                display: "block",
                fontSize: "20px",
                fontWeight: 600,
                letterSpacing: "-0.025em",
                color: "var(--stone-900)",
                lineHeight: 1.1,
              }}
            >
              ardmag
            </span>
            <span
              style={{
                display: "block",
                fontFamily: "var(--f-mono)",
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--fg-muted)",
                marginTop: "2px",
              }}
            >
              PRECIZIE SOLIDĂ
            </span>
          </span>
        </LocalizedClientLink>

        {/* SEARCH */}
        <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="search"
              className="search-input"
              placeholder="Cauta scule, discuri, adezivi..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="search-btn" aria-label="Cauta">
              {/* Search icon */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Cauta
            </button>
          </form>
        </div>

        {/* ACTIONS */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {/* Mobile drawer trigger — hidden on sm+ */}
          {/* DESIGN PENDING: mobile header layout — revisit after Track B delivers breakpoint specs */}
          <div className="sm:hidden">
            <MobileDrawer categories={CATEGORIES} />
          </div>

          {/* Account */}
          <LocalizedClientLink href="/account" className="main-bar-account">
            {/* Person icon */}
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="11" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M4 19c0-3.866 3.134-7 7-7h0c3.866 0 7 3.134 7 7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span
              style={{
                fontFamily: "var(--f-mono)",
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "var(--stone-600)",
              }}
            >
              Cont
            </span>
          </LocalizedClientLink>

          {/* Cart — server component passed as prop from Nav */}
          {cartButton}
        </div>
      </div>
    </div>
  )
}
