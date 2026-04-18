"use client"

import { useState, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

interface MobileDrawerProps {
  categories: ReadonlyArray<{ handle: string; name: string }>
}

export default function MobileDrawer({ categories }: MobileDrawerProps) {
  const [open, setOpen] = useState(false)

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <>
      <style>{`
        .drawer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 100;
          animation: fadeIn 0.15s ease;
        }
        .drawer-panel {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 300px;
          background: var(--surface);
          z-index: 101;
          display: flex;
          flex-direction: column;
          animation: slideIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .drawer-nav-link {
          display: block;
          padding: 12px 24px;
          font-size: 14px;
          font-weight: 500;
          color: var(--stone-800);
          text-decoration: none;
          border-bottom: 1px solid var(--rule);
        }
        .drawer-nav-link:hover {
          background: var(--stone-50);
          color: var(--brand-700);
        }
        .drawer-all-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          font-size: 14px;
          font-weight: 600;
          color: #ffffff;
          background: var(--stone-900);
          text-decoration: none;
          border-bottom: 1px solid var(--stone-800);
        }
      `}</style>

      {/* Hamburger trigger */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Deschide meniu"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "8px",
          display: "flex",
          flexDirection: "column",
          gap: "5px",
          color: "var(--stone-800)",
        }}
      >
        <span style={{ display: "block", width: "22px", height: "2px", background: "currentColor" }} />
        <span style={{ display: "block", width: "22px", height: "2px", background: "currentColor" }} />
        <span style={{ display: "block", width: "22px", height: "2px", background: "currentColor" }} />
      </button>

      {/* Drawer overlay + panel */}
      {open && (
        <>
          {/* Overlay */}
          <div
            className="drawer-overlay"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <div className="drawer-panel" role="dialog" aria-label="Navigare">
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 24px",
                borderBottom: "1px solid var(--rule)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "32px",
                    height: "32px",
                    background: "var(--stone-900)",
                    borderRadius: "var(--r-sm)",
                    fontFamily: "var(--f-mono)",
                    fontWeight: 600,
                    fontSize: "14px",
                    color: "var(--brand-400)",
                    letterSpacing: "-0.02em",
                    flexShrink: 0,
                  }}
                >
                  am
                </span>
                <span>
                  <span
                    style={{
                      display: "block",
                      fontSize: "18px",
                      fontWeight: 600,
                      letterSpacing: "-0.025em",
                      color: "var(--stone-900)",
                    }}
                  >
                    ardmag
                  </span>
                </span>
              </div>

              <button
                onClick={() => setOpen(false)}
                aria-label="Inchide meniu"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  color: "var(--stone-600)",
                  fontSize: "20px",
                  lineHeight: 1,
                }}
              >
                &times;
              </button>
            </div>

            {/* Nav links */}
            <nav style={{ flex: 1, overflowY: "auto" }}>
              <LocalizedClientLink
                href="/store"
                className="drawer-all-link"
                onClick={() => setOpen(false)}
              >
                Toate produsele
              </LocalizedClientLink>
              {categories.map((cat) => (
                <LocalizedClientLink
                  key={cat.handle}
                  href={`/categories/${cat.handle}`}
                  className="drawer-nav-link"
                  onClick={() => setOpen(false)}
                >
                  {cat.name}
                </LocalizedClientLink>
              ))}
            </nav>

            {/* Drawer footer */}
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid var(--rule)",
                fontFamily: "var(--f-mono)",
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--stone-500)",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <span>Lun - Vin: 8:00 - 17:00</span>
              <a
                href="tel:+40722155441"
                style={{ color: "var(--stone-500)", textDecoration: "none" }}
              >
                +40 722 155 441
              </a>
            </div>
          </div>
        </>
      )}
    </>
  )
}
