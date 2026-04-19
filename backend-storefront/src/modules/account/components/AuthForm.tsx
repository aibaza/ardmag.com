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
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 8, paddingBottom: 16 }}>
        <button
          type="button"
          className={tab === "login" ? "btn secondary" : "btn ghost"}
          onClick={() => setTab("login")}
        >
          Autentificare
        </button>
        <button
          type="button"
          className={tab === "register" ? "btn secondary" : "btn ghost"}
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
            <button type="submit" className="btn primary" style={{ width: "100%" }}>
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
            {signupError && (
              <p style={{ color: "var(--brand-600)", fontSize: 13, marginBottom: 12 }}>
                {signupError}
              </p>
            )}
            <button type="submit" className="btn primary" style={{ width: "100%" }}>
              Creeaza cont
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
