"use client"
import { useState, useActionState, startTransition } from "react"
import { updateCustomer } from "@lib/data/customer"
import { HttpTypes } from "@medusajs/types"

interface Props {
  label: string
  currentValue: string
  fieldName: keyof HttpTypes.StoreUpdateCustomer
  type?: "text" | "email" | "tel"
}

type State = { error: string | null; success: boolean }

const initialState: State = { error: null, success: false }

export function ProfileEditSection({
  label,
  currentValue,
  fieldName,
  type = "text",
}: Props) {
  const [editing, setEditing] = useState(false)
  const [displayValue, setDisplayValue] = useState(currentValue)

  const [state, formAction, isPending] = useActionState(
    async (_prev: State, formData: FormData): Promise<State> => {
      try {
        const newVal = formData.get(fieldName) as string
        await updateCustomer({
          [fieldName]: newVal,
        } as HttpTypes.StoreUpdateCustomer)
        setDisplayValue(newVal)
        setEditing(false)
        return { error: null, success: true }
      } catch (e: unknown) {
        const msg =
          e instanceof Error ? e.message : "A aparut o eroare."
        return { error: msg, success: false }
      }
    },
    initialState
  )

  return (
    <div className="panel" style={{ marginBottom: 12 }}>
      <div
        className="panel-head"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: "var(--f-sans)",
            fontWeight: 500,
            fontSize: 14,
          }}
        >
          {label}
        </span>
        {!editing && (
          <button
            type="button"
            className="btn ghost sm"
            onClick={() => setEditing(true)}
          >
            Editeaza
          </button>
        )}
      </div>
      <div className="panel-body" style={{ padding: "16px 20px" }}>
        {!editing ? (
          <div
            style={{
              fontFamily: "var(--f-sans)",
              color: displayValue ? "var(--fg)" : "var(--fg-muted)",
              fontSize: 14,
            }}
          >
            {displayValue || "Necompletat"}
          </div>
        ) : (
          <form action={formAction}>
            <input
              type={type}
              name={fieldName}
              defaultValue={displayValue}
              required
              style={{
                width: "100%",
                padding: "8px 10px",
                border: "1px solid var(--rule)",
                borderRadius: "var(--r-md)",
                fontFamily: "var(--f-sans)",
                fontSize: 14,
                boxSizing: "border-box",
                marginBottom: 8,
                background: "var(--surface)",
                color: "var(--fg)",
              }}
            />
            {state.error && (
              <p
                style={{
                  color: "var(--brand-500)",
                  fontSize: 12,
                  marginBottom: 8,
                }}
              >
                {state.error}
              </p>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="submit"
                className="btn primary sm"
                disabled={isPending}
              >
                {isPending ? "Se salveaza..." : "Salveaza"}
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
    </div>
  )
}
