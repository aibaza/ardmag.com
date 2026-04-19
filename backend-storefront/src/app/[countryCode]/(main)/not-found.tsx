import { Metadata } from "next"

export const metadata: Metadata = {
  title: "404",
  description: "A apărut o eroare",
}

export default function NotFound() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 64px)" }}>
      <h1>Pagina nu a fost găsită</h1>
      <p>Pagina pe care ai încercat să o accesezi nu există.</p>
      <a href="/">Înapoi la pagina principală</a>
    </div>
  )
}
