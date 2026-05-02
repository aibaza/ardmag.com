"use client"
import { useState, useActionState } from "react"
import { updateCustomer } from "@lib/data/customer"

interface Props {
  firstName: string
  lastName: string
}

type State = { error: string | null; success: boolean }
const initial: State = { error: null, success: false }

export function NameRow({ firstName, lastName }: Props) {
  const [editing, setEditing] = useState(false)
  const [display, setDisplay] = useState({ first: firstName, last: lastName })

  const [state, formAction, isPending] = useActionState(
    async (_prev: State, formData: FormData): Promise<State> => {
      try {
        const first = formData.get("first_name") as string
        const last = formData.get("last_name") as string
        await updateCustomer({ first_name: first, last_name: last })
        setDisplay({ first, last })
        setEditing(false)
        return { error: null, success: true }
      } catch (e) {
        return { error: e instanceof Error ? e.message : "A aparut o eroare.", success: false }
      }
    },
    initial
  )

  const fullName = [display.first, display.last].filter(Boolean).join(" ")

  return (
    <div data-testid="profile-name-row" style={{ padding: "16px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {!editing ? (
            <div className="field">
              <label>Nume complet</label>
              <div style={{ fontSize: 14, color: fullName ? "var(--fg)" : "var(--fg-muted)", paddingTop: 2 }}>
                {fullName || "Necompletat"}
                {state.success && (
                  <span className="badge stock-in" style={{ marginLeft: 8, verticalAlign: "middle" }}>Salvat</span>
                )}
              </div>
            </div>
          ) : (
            <form action={formAction}>
              <div className="form-row-2" style={{ marginBottom: 8 }}>
                <div className="field">
                  <label htmlFor="profile-first-name">Prenume</label>
                  <div className={`input-shell md${state.error ? " is-error" : ""}`}>
                    <input
                      id="profile-first-name"
                      type="text"
                      name="first_name"
                      defaultValue={display.first}
                      required
                      // eslint-disable-next-line jsx-a11y/no-autofocus
                      autoFocus
                    />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="profile-last-name">Nume</label>
                  <div className={`input-shell md${state.error ? " is-error" : ""}`}>
                    <input
                      id="profile-last-name"
                      type="text"
                      name="last_name"
                      defaultValue={display.last}
                      required
                    />
                  </div>
                </div>
              </div>
              {state.error && (
                <p className="hint error" style={{ marginBottom: 8 }}>{state.error}</p>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" className="btn primary sm" disabled={isPending}>
                  {isPending ? <><span className="spin" />Se salveaza</> : "Salveaza"}
                </button>
                <button
                  type="button"
                  className="btn ghost sm"
                  onClick={() => setEditing(false)}
                  disabled={isPending}
                >
                  Anuleaza
                </button>
              </div>
            </form>
          )}
        </div>
        {!editing && (
          <button
            type="button"
            className="btn ghost sm"
            onClick={() => setEditing(true)}
            style={{ flexShrink: 0, marginTop: 16 }}
          >
            Editeaza
          </button>
        )}
      </div>
    </div>
  )
}
