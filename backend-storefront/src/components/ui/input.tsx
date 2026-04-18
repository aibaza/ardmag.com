import * as React from "react"

// ---------------------------------------------------------------------------
// Field (server-compatible layout wrapper)
// ---------------------------------------------------------------------------

export interface FieldProps {
  label?: string
  hint?: string
  error?: string
  htmlFor?: string
  children: React.ReactNode
  className?: string
}

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
  className = "",
}: FieldProps) {
  return (
    <div className={`flex flex-col gap-[6px] ${className}`}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="font-[family-name:var(--f-mono)] text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--fg-muted)]"
        >
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-[12px] text-[var(--error-fg)]">{error}</p>
      ) : hint ? (
        <p className="text-[12px] text-[var(--fg-muted)]">{hint}</p>
      ) : null}
    </div>
  )
}

// ---------------------------------------------------------------------------
// InputShell (server-compatible border/focus wrapper)
// ---------------------------------------------------------------------------

type InputSize = "sm" | "md" | "lg"

export interface InputShellProps {
  size?: InputSize
  error?: boolean
  disabled?: boolean
  adornLeft?: React.ReactNode
  adornRight?: React.ReactNode
  children: React.ReactNode
  className?: string
}

const shellHeightMap: Record<InputSize, string> = {
  sm: "h-8",
  md: "h-10",
  lg: "h-12",
}

export function InputShell({
  size = "md",
  error = false,
  disabled = false,
  adornLeft,
  adornRight,
  children,
  className = "",
}: InputShellProps) {
  return (
    <div
      className={[
        "flex items-stretch bg-white",
        "border rounded-[var(--r-sm)]",
        "transition-[border-color,box-shadow] duration-[80ms]",
        shellHeightMap[size],
        error
          ? "border-[var(--error)] focus-within:shadow-[0_0_0_3px_oklch(52%_0.20_25_/_0.25)]"
          : [
              "border-[var(--rule-strong)]",
              "hover:border-stone-400",
              "focus-within:border-brand-500 focus-within:shadow-[var(--focus-ring)]",
            ].join(" "),
        disabled
          ? "bg-stone-100 border-[var(--rule)] opacity-75 pointer-events-none"
          : "",
        className,
      ].join(" ")}
    >
      {adornLeft && (
        <div className="flex items-center px-[10px] border-r border-[var(--rule)] bg-stone-50 font-[family-name:var(--f-mono)] text-[12px] text-[var(--fg-muted)] shrink-0">
          {adornLeft}
        </div>
      )}
      {children}
      {adornRight && (
        <div className="flex items-center px-[10px] border-l border-[var(--rule)] bg-stone-50 font-[family-name:var(--f-mono)] text-[12px] text-[var(--fg-muted)] shrink-0">
          {adornRight}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// TextInput
// ---------------------------------------------------------------------------

export interface TextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  mono?: boolean
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ mono = false, className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={[
          "flex-1 min-w-0 bg-transparent border-none outline-none px-3",
          "text-[14px] text-[var(--fg)] placeholder:text-[var(--fg-muted)]",
          mono
            ? "font-[family-name:var(--f-mono)]"
            : "font-[family-name:var(--f-sans)]",
          className,
        ].join(" ")}
        {...props}
      />
    )
  }
)

TextInput.displayName = "TextInput"

// ---------------------------------------------------------------------------
// SelectInput
// ---------------------------------------------------------------------------

const chevronSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2378716c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`

export interface SelectInputProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  mono?: boolean
}

export const SelectInput = React.forwardRef<
  HTMLSelectElement,
  SelectInputProps
>(({ mono = false, className = "", style, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={[
        "flex-1 min-w-0 bg-transparent border-none outline-none px-3",
        "text-[14px] text-[var(--fg)] appearance-none cursor-pointer",
        mono
          ? "font-[family-name:var(--f-mono)]"
          : "font-[family-name:var(--f-sans)]",
        className,
      ].join(" ")}
      style={{
        backgroundImage: chevronSvg,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 10px center",
        paddingRight: "32px",
        ...style,
      }}
      {...props}
    />
  )
})

SelectInput.displayName = "SelectInput"

