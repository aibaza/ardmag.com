"use client"
import { useRef, useState, useTransition } from "react"

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()
  const requestId = useRef<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    const form = e.currentTarget
    const data = new FormData(form)
    requestId.current ??= crypto.randomUUID()

    startTransition(async () => {
      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.get("name"),
            website: data.get("website"),
            email: data.get("email"),
            phone: data.get("phone"),
            message: data.get("message"),
            consent: data.get("consent") === "on",
            request_id: requestId.current,
          }),
        })
        if (res.ok) {
          setSubmitted(true)
        } else {
          setError(
            "A aparut o eroare. Va rugam sa ne contactati direct la +40 722 155 441."
          )
        }
      } catch {
        setError(
          "A aparut o eroare. Va rugam sa ne contactati direct la +40 722 155 441."
        )
      }
    })
  }

  if (submitted) {
    return (
      <div
        style={{
          padding: "24px",
          background: "var(--surface-raised)",
          borderRadius: "var(--r-md)",
          textAlign: "center",
        }}
      >
        <p style={{ fontWeight: 600, marginBottom: 8 }}>Mesaj trimis!</p>
        <p style={{ color: "var(--fg-muted)", fontSize: 14 }}>
          Va raspundem in cel mai scurt timp, in program L-V 08-16.
        </p>
      </div>
    )
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid var(--rule)",
    borderRadius: "var(--r-sm)",
    fontFamily: "var(--f-sans)",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  }

  return (
    <section>
      <h2
        style={{
          fontFamily: "var(--f-sans)",
          fontWeight: 600,
          fontSize: 18,
          marginBottom: 16,
        }}
      >
        Trimite un mesaj
      </h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        <input
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ display: "none" }}
        />
        <input
          name="name"
          maxLength={120}
          type="text"
          placeholder="Nume si prenume"
          required
          style={inputStyle}
        />
        <input
          name="email"
          maxLength={254}
          type="email"
          placeholder="Email"
          required
          style={inputStyle}
        />
        <input
          name="phone"
          maxLength={40}
          type="tel"
          placeholder="Telefon (optional)"
          style={inputStyle}
        />
        <textarea
          name="message"
          maxLength={5000}
          placeholder="Mesajul tau..."
          required
          rows={5}
          style={{ ...inputStyle, resize: "vertical" }}
        />
        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 9,
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          <input
            name="consent"
            type="checkbox"
            required
            style={{ marginTop: 3, accentColor: "var(--brand-600)" }}
          />
          <span>
            Sunt de acord ca datele trimise să fie folosite pentru a răspunde
            solicitării mele. Am citit{" "}
            <a href="/confidentialitate" style={{ color: "var(--brand-600)" }}>
              Politica de confidențialitate
            </a>
            .
          </span>
        </label>
        {error && (
          <p style={{ color: "var(--error)", fontSize: 13, margin: 0 }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          className="btn primary"
          disabled={isPending}
          style={{ alignSelf: "flex-start", minWidth: 140 }}
        >
          {isPending ? "Se trimite..." : "Trimite mesaj"}
        </button>
      </form>
    </section>
  )
}
