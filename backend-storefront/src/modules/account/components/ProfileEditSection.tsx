"use client"
import { useState, useActionState } from "react"
import { updateCustomer } from "@lib/data/customer"
import { HttpTypes } from "@medusajs/types"

interface Props {
  label: string
  currentValue: string
  fieldName: keyof HttpTypes.StoreUpdateCustomer
  type?: "text" | "email" | "tel"
}

type State = { error: string | null; success: boolean }
const initial: State = { error: null, success: false }

export function ProfileEditSection({ label, currentValue, fieldName, type = "text" }: Props) {
  const [editing, setEditing] = useState(false)
  const [displayValue, setDisplayValue] = useState(currentValue)

  const [state, formAction, isPending] = useActionState(
    async (_prev: State, formData: FormData): Promise<State> => {
      try {
        const newVal = formData.get(fieldName) as string
        await updateCustomer({ [fieldName]: newVal } as HttpTypes.StoreUpdateCustomer)
        setDisplayValue(newVal)
        setEditing(false)
        return { error: null, success: true }
      } catch (e) {
        return { error: e instanceof Error ? e.message : "A aparut o eroare.", success: false }
      }
    },
    initial
  )

  return (
    <div data-testid={`profile-row-${fieldName}`} style={{ padding: "16px 20px", borderTop: "1px solid var(--rule)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div className="field" style={{ flex: 1, minWidth: 0 }}>
          <label htmlFor={`profile-${fieldName}`}>{label}</label>
          {!editing ? (
            <div style={{ fontSize: 14, color: displayValue ? "var(--fg)" : "var(--fg-muted)", paddingTop: 2 }}>
              {displayValue || "Necompletat"}
              {state.success && (
                <span className="badge stock-in" style={{ marginLeft: 8, verticalAlign: "middle" }}>Salvat</span>
              )}
            </div>
          ) : (
            <form action={formAction} style={{ marginTop: 2 }}>
              <div className={`input-shell md${state.error ? " is-error" : ""}`}>
                <input
                  id={`profile-${fieldName}`}
                  type={type}
                  name={fieldName as string}
                  defaultValue={displayValue}
                  required
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus
                />
              </div>
              {state.error && (
                <p className="hint error" style={{ marginTop: 4 }}>{state.error}</p>
              )}
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
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
