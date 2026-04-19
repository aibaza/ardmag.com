"use client"

import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { login, signup } from "@lib/data/customer"
import { useState } from "react"

interface AuthFormProps {
  countryCode: string
}

export function AuthForm({ countryCode }: AuthFormProps) {
  const router = useRouter()
  const [tab, setTab] = useState<"login" | "register">("login")

  async function handleLogin(prevState: string | null, formData: FormData) {
    const result = await login(prevState, formData)
    if (!result) {
      router.push(`/${countryCode}/account`)
      return null
    }
    return result
  }

  async function handleSignup(prevState: string | null, formData: FormData) {
    const result = await signup(prevState, formData)
    if (!result) {
      router.push(`/${countryCode}/account`)
      return null
    }
    return result as string
  }

  const [loginError, loginAction] = useActionState(handleLogin, null)
  const [signupError, signupAction] = useActionState(handleSignup, null)

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid var(--rule)",
    borderRadius: "var(--r-md)",
    fontFamily: "var(--f-sans)",
    fontSize: 14,
    boxSizing: "border-box",
  }

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 6,
    color: "var(--fg-muted)",
    fontFamily: "var(--f-sans)",
  }

  const fieldStyle: React.CSSProperties = { marginBottom: 16 }

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "center", gap: 8, paddingBottom: 16 }}>
        <button
          type="button"
          className={tab === "login" ? "btn secondary md" : "btn ghost md"}
          onClick={() => setTab("login")}
        >
          Autentificare
        </button>
        <button
          type="button"
          className={tab === "register" ? "btn secondary md" : "btn ghost md"}
          onClick={() => setTab("register")}
        >
          Cont nou
        </button>
      </div>

      {tab === "login" && (
        <div className="panel plain">
          <form action={loginAction}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Email</label>
              <input type="email" name="email" required style={inputStyle} />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Parola</label>
              <input type="password" name="password" required style={inputStyle} />
            </div>
            {loginError && (
              <p style={{ color: "var(--brand-600)", fontSize: 13, marginBottom: 12 }}>
                {loginError}
              </p>
            )}
            <button type="submit" className="btn primary lg" style={{ width: "100%" }}>
              Autentificare
            </button>
          </form>
        </div>
      )}

      {tab === "register" && (
        <div className="panel plain">
          <form action={signupAction}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ ...fieldStyle, flex: 1 }}>
                <label style={labelStyle}>Prenume</label>
                <input type="text" name="first_name" required style={inputStyle} />
              </div>
              <div style={{ ...fieldStyle, flex: 1 }}>
                <label style={labelStyle}>Nume</label>
                <input type="text" name="last_name" required style={inputStyle} />
              </div>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Email</label>
              <input type="email" name="email" required style={inputStyle} />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Telefon</label>
              <input type="tel" name="phone" style={inputStyle} />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Parola</label>
              <input type="password" name="password" required style={inputStyle} />
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 16 }}>
              <input
                type="checkbox"
                name="terms"
                id="terms"
                required
                style={{ marginTop: 2, flexShrink: 0 }}
              />
              <label htmlFor="terms" style={{ ...labelStyle, marginBottom: 0, cursor: "pointer" }}>
                Sunt de acord cu{" "}
                <a href={`/${countryCode}/termeni-si-conditii`} style={{ color: "var(--brand-500)" }}>
                  Termenii si Conditiile
                </a>{" "}
                si{" "}
                <a href={`/${countryCode}/politica-confidentialitate`} style={{ color: "var(--brand-500)" }}>
                  Politica de Confidentialitate
                </a>
              </label>
            </div>
            {signupError && (
              <p style={{ color: "var(--brand-600)", fontSize: 13, marginBottom: 12 }}>
                {signupError}
              </p>
            )}
            <button type="submit" className="btn primary lg" style={{ width: "100%" }}>
              Creeaza cont
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
