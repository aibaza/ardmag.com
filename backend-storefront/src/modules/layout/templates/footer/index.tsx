import { listCategories } from "@lib/data/categories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function Footer() {
  const categories = await listCategories()
  const topLevel = categories.filter((c) => !c.parent_category)

  return (
    <footer style={{ background: "var(--stone-900)", color: "var(--stone-200)" }}>
      <style>{`
        .footer-link {
          color: var(--stone-200);
          text-decoration: none;
          font-size: 14px;
          line-height: 1.5;
        }
        .footer-link:hover { color: var(--brand-300); }
        .footer-contact-link {
          color: var(--stone-300);
          text-decoration: none;
          font-size: 14px;
        }
        .footer-contact-link:hover { color: #ffffff; }
        .footer-legal-link {
          color: var(--stone-600);
          text-decoration: none;
          font-size: 12px;
        }
        .footer-legal-link:hover { color: var(--stone-400); }
        .footer-col-h5 {
          font-family: var(--f-mono);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--stone-500);
          font-weight: 500;
          margin-bottom: 14px;
        }
      `}</style>

      {/* Footer top */}
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "56px 24px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1.3fr",
            gap: "48px",
          }}
        >
          {/* Col 1 — Brand */}
          <div>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "36px",
                  height: "36px",
                  background: "var(--stone-800)",
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
                    color: "#ffffff",
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
                    color: "var(--stone-500)",
                    marginTop: "2px",
                  }}
                >
                  PRECIZIE SOLIDA
                </span>
              </span>
            </div>

            <p
              style={{
                color: "var(--stone-400)",
                fontSize: "14px",
                lineHeight: 1.6,
                maxWidth: "280px",
                margin: "0 0 20px 0",
              }}
            >
              Distribuitor autorizat Tenax si furnizor de scule pentru prelucrarea pietrei naturale din 2001.
            </p>

            <div
              style={{
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
              <span>Calea Baciului 1-3, Cluj-Napoca 400230</span>
              <span>+40 722 155 441</span>
            </div>
          </div>

          {/* Col 2 — Produse */}
          <div>
            <h5 className="footer-col-h5">Produse</h5>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
              {topLevel.map((cat) => (
                <li key={cat.id}>
                  <LocalizedClientLink
                    href={`/categories/${cat.handle}`}
                    className="footer-link"
                  >
                    {cat.name}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Informatii */}
          <div>
            <h5 className="footer-col-h5">Informatii</h5>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
              {["Despre noi", "Contact", "Transport si livrare", "Returnari", "Garantie"].map((item) => (
                <li key={item}>
                  <span style={{ color: "var(--stone-200)", fontSize: "14px" }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Cont */}
          <div>
            <h5 className="footer-col-h5">Cont</h5>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>
                <LocalizedClientLink href="/account" className="footer-link">
                  Contul meu
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/account" className="footer-link">
                  Adrese
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/account/orders" className="footer-link">
                  Comenzile mele
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/cart" className="footer-link">
                  Cos de cumparaturi
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          {/* Col 5 — Contact */}
          <div>
            <h5 className="footer-col-h5">Contact</h5>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ color: "var(--stone-400)", fontSize: "14px" }}>
                Lun - Vin: 8:00 - 17:00
              </span>
              <a href="tel:+40722155441" className="footer-contact-link">
                +40 722 155 441
              </a>
              <a href="mailto:office@arcromdiamonds.ro" className="footer-contact-link">
                office@arcromdiamonds.ro
              </a>

              <div style={{ marginTop: "8px" }}>
                <span
                  style={{
                    display: "block",
                    fontFamily: "var(--f-mono)",
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--stone-600)",
                    marginBottom: "4px",
                  }}
                >
                  Distribuitor autorizat
                </span>
                <span style={{ fontSize: "16px", fontWeight: 600, color: "#ffffff" }}>
                  TENAX
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer bottom */}
      <div
        style={{
          background: "var(--stone-950)",
          borderTop: "1px solid var(--stone-800)",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "18px 24px",
            display: "flex",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontFamily: "var(--f-mono)",
              fontSize: "11px",
              color: "var(--stone-500)",
            }}
          >
            &copy; 2025 Arcrom Diamonds SRL. Toate drepturile rezervate.
          </span>
          <div className="ml-auto flex gap-5">
            {["GDPR", "Termeni si conditii", "Politica de confidentialitate"].map(
              (item) => (
                <a key={item} href="#" className="footer-legal-link">
                  {item}
                </a>
              )
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
