# ardmag Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the ardmag design system (Variant B palette, tagline #5 "25 DE ANI. LA MILIMETRU.") into the Next.js storefront, replacing all generic Medusa template chrome with production-ready branded components.

**Architecture:** CSS custom properties carry all design tokens; Tailwind config is extended (not replaced) to coexist with `@medusajs/ui-preset`; ardmag components live in their own folders and do not modify existing checkout/account/cart Medusa components.

**Tech Stack:** Next.js 15 (App Router), Tailwind CSS v3 + `@medusajs/ui-preset`, IBM Plex Sans + IBM Plex Mono (Google Fonts via `next/font`), Medusa v2 backend at `http://localhost:9000`, TypeScript strict.

**Design source of truth:** `resources/design/ardmag_com/` - read these 4 HTML files directly when implementing. Do not guess values.

---

## Component inventory (from design system scan)

### DS01 - Tokens
- Palette Variant B: brand (orange, hue 42), stone neutrals (hue 75)
- Typography: IBM Plex Sans Variable (text), IBM Plex Mono (SKU/price/specs/labels)
- Spacing scale: 4/8/12/16/20/24/32/40/48/64/80px (s-1 through s-20)
- Radii: 0/2px/4px/6px/9999px (r-none/sm/md/lg/full)
- Shadows: sh-sm/sh-md/sh-lg (minimal, stone-tinted)
- Focus ring: 0 0 0 3px brand-500@35%
- Tagline #5: "25 DE ANI. LA MILIMETRU."

### DS02 - Base Components
- Button: primary/secondary/ghost/destructive/inv variants; sm/md/lg sizes; icon-only; loading state
- Field+InputShell: label (mono uppercase), input, textarea, select, adorns (left/right)
- Stepper: quantity +/- control
- Checkbox/Radio: custom visual with brand focus ring
- Badge: stock-in/stock-low/stock-out/promo/new/brand/info variants + dot modifier

### DS03 - Commerce Components
- ProductCard (grid): img overlay, body (brand+title+SKU+specs), foot (price+stock+CTA)
- ProductRow (list): 3-column grid layout, thumb 88px, price right, specs below title
- CategoryCard: 1:1 image, overlay title/count/link, hover state
- SpecTable: dense mono table (th uppercase, td alternating rows)
- SupplierStrip: horizontal brand logos scroll, dark section

### DS04 - Chrome & Homepage
- SiteHeader: 3 layers
  - Layer 1 (util-bar): stone-900 bg, promo dot, shipping info, lang switcher
  - Layer 2 (main-bar): logo mark + wordmark + tagline, search combo (cat filter + input + submit), actions (account/cart)
  - Layer 3 (cat-nav): category links, "Toate categoriile" black button, direct CTA right
- SiteFooter: dark (stone-900/950), 5 columns (brand+description, 3 link cols, newsletter), mid bar (certifications/payment icons), bottom bar (copyright)
- MobileDrawer: hamburger triggers slide-in panel, shows search + categories + actions
- Homepage rhythm: dark Hero → light CategoryGrid → dark PromoBand → light ProductGrid → SupplierStrip → dark Footer

---

## Files to create / modify

| File | Action | Responsible task |
|------|---------|-----------------|
| `src/styles/globals.css` | Modify - add `@import "./tokens.css"` | Task 1 |
| `src/styles/tokens.css` | Create - all CSS custom properties | Task 1 |
| `tailwind.config.js` | Modify - add fonts, ardmag colors, extend theme | Task 1 |
| `src/app/layout.tsx` | Modify - add IBM Plex Sans+Mono via next/font | Task 1 |
| `src/components/ui/button.tsx` | Create | Task 2 |
| `src/components/ui/badge.tsx` | Create | Task 3 |
| `src/components/ui/input.tsx` | Create - Field, InputShell, Stepper | Task 4 |
| `src/components/ui/index.ts` | Create - barrel export | Task 4 |
| `src/modules/layout/templates/nav/index.tsx` | Replace - 3-layer SiteHeader | Task 5 |
| `src/modules/layout/components/site-header/util-bar.tsx` | Create | Task 5 |
| `src/modules/layout/components/site-header/main-bar.tsx` | Create | Task 5 |
| `src/modules/layout/components/site-header/cat-nav.tsx` | Create | Task 5 |
| `src/modules/layout/components/mobile-drawer/index.tsx` | Create - client component | Task 6 |
| `src/modules/layout/templates/footer/index.tsx` | Replace - 5-column dark footer | Task 7 |
| `src/modules/products/components/product-card/index.tsx` | Create - grid variant | Task 8 |
| `src/modules/products/components/product-row/index.tsx` | Create - list variant | Task 9 |
| `src/modules/products/components/category-card/index.tsx` | Create | Task 10 |
| `src/modules/products/components/spec-table/index.tsx` | Create | Task 11 |
| `src/modules/home/components/supplier-strip/index.tsx` | Create | Task 12 |
| `src/modules/home/components/hero/index.tsx` | Replace - dark branded hero | Task 13 |
| `src/modules/home/components/category-grid/index.tsx` | Create | Task 13 |
| `src/modules/home/components/promo-band/index.tsx` | Create | Task 13 |
| `src/app/[countryCode]/(main)/page.tsx` | Modify - homepage rhythm | Task 13 |
| `src/modules/categories/templates/index.tsx` | Modify - use ProductCard | Task 14 |
| `src/modules/products/templates/index.tsx` | Modify - use SpecTable, ProductImage | Task 15 |
| `src/modules/store/templates/index.tsx` | Modify - use ProductCard | Task 14 |

---

## Task 1: Design tokens + Tailwind extension + fonts

**Files:**
- Create: `src/styles/tokens.css`
- Modify: `src/styles/globals.css`
- Modify: `tailwind.config.js`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1.1: Create tokens.css**

```css
/* src/styles/tokens.css */
/* Ardmag Design System — Variant B tokens */
@layer base {
  :root {
    /* Brand — Ignition Orange, hue 42 */
    --brand-50:  oklch(97% 0.020 42);
    --brand-100: oklch(93% 0.048 42);
    --brand-200: oklch(86% 0.092 42);
    --brand-300: oklch(77% 0.142 42);
    --brand-400: oklch(70% 0.180 42);
    --brand-500: oklch(64% 0.202 42);
    --brand-600: oklch(56% 0.190 42);
    --brand-700: oklch(48% 0.162 42);
    --brand-800: oklch(39% 0.128 42);
    --brand-900: oklch(30% 0.098 42);
    --brand-950: oklch(22% 0.062 42);

    /* Warm Stone neutrals, hue 75 */
    --stone-50:  oklch(98% 0.003 75);
    --stone-100: oklch(95% 0.005 75);
    --stone-200: oklch(90% 0.006 75);
    --stone-300: oklch(82% 0.006 75);
    --stone-400: oklch(70% 0.006 75);
    --stone-500: oklch(55% 0.006 75);
    --stone-600: oklch(43% 0.006 75);
    --stone-700: oklch(33% 0.006 75);
    --stone-800: oklch(24% 0.006 75);
    --stone-900: oklch(16% 0.006 75);
    --stone-950: oklch(10% 0.006 75);

    /* Semantic */
    --success:    oklch(55% 0.14 145);
    --success-bg: oklch(94% 0.04 145);
    --success-fg: oklch(32% 0.10 145);
    --warning:    oklch(72% 0.16 85);
    --warning-bg: oklch(94% 0.06 85);
    --warning-fg: oklch(34% 0.12 85);
    --error:      oklch(52% 0.20 25);
    --error-bg:   oklch(94% 0.04 25);
    --error-fg:   oklch(36% 0.14 25);
    --info:       oklch(50% 0.14 235);
    --info-bg:    oklch(94% 0.04 235);
    --info-fg:    oklch(32% 0.12 235);

    /* Semantic aliases */
    --bg:         var(--stone-50);
    --surface:    #ffffff;
    --fg:         var(--stone-900);
    --fg-muted:   var(--stone-500);
    --rule:       var(--stone-200);
    --rule-strong: var(--stone-300);

    /* Typography */
    --f-sans: "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif;
    --f-mono: "IBM Plex Mono", ui-monospace, "SF Mono", Menlo, monospace;

    /* Spacing scale */
    --s-1: 4px;  --s-2: 8px;   --s-3: 12px; --s-4: 16px;
    --s-5: 20px; --s-6: 24px;  --s-8: 32px; --s-10: 40px;
    --s-12: 48px; --s-16: 64px; --s-20: 80px;

    /* Radii */
    --r-none: 0;    --r-sm: 2px; --r-md: 4px;
    --r-lg: 6px;    --r-full: 9999px;

    /* Shadows */
    --sh-sm: 0 1px 2px oklch(16% 0.006 75 / 0.06);
    --sh-md: 0 2px 6px oklch(16% 0.006 75 / 0.08), 0 1px 2px oklch(16% 0.006 75 / 0.04);
    --sh-lg: 0 8px 24px oklch(16% 0.006 75 / 0.12), 0 2px 6px oklch(16% 0.006 75 / 0.06);

    /* Focus ring */
    --focus-ring: 0 0 0 3px oklch(64% 0.202 42 / 0.35);
  }
}
```

- [ ] **Step 1.2: Import tokens.css in globals.css**

Add at the top of `src/styles/globals.css` (before the tailwindcss imports):

```css
@import "./tokens.css";
```

- [ ] **Step 1.3: Extend tailwind.config.js**

Replace the `fontFamily.sans` section and add ardmag colors. Keep all existing config, just add to `theme.extend`:

```js
// In theme.extend, add:
fontFamily: {
  sans: [
    "IBM Plex Sans",
    "Inter",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "sans-serif",
  ],
  mono: [
    "IBM Plex Mono",
    "ui-monospace",
    "SF Mono",
    "Menlo",
    "Consolas",
    "monospace",
  ],
},
// Add color references to CSS vars (for Tailwind utility class usage):
colors: {
  // keep existing grey object
  grey: { /* ... unchanged ... */ },
  // add ardmag brand scale
  brand: {
    50:  "var(--brand-50)",
    100: "var(--brand-100)",
    200: "var(--brand-200)",
    300: "var(--brand-300)",
    400: "var(--brand-400)",
    500: "var(--brand-500)",
    600: "var(--brand-600)",
    700: "var(--brand-700)",
    800: "var(--brand-800)",
    900: "var(--brand-900)",
    950: "var(--brand-950)",
  },
  stone: {
    50:  "var(--stone-50)",
    100: "var(--stone-100)",
    200: "var(--stone-200)",
    300: "var(--stone-300)",
    400: "var(--stone-400)",
    500: "var(--stone-500)",
    600: "var(--stone-600)",
    700: "var(--stone-700)",
    800: "var(--stone-800)",
    900: "var(--stone-900)",
    950: "var(--stone-950)",
  },
},
```

- [ ] **Step 1.4: Load Google Fonts in layout.tsx via next/font**

```tsx
// src/app/layout.tsx
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google"
import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="ro" data-mode="light" className={`${ibmPlexSans.variable} ${ibmPlexMono.variable}`}>
      <body style={{ fontFamily: "var(--f-sans)" }}>
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
```

Update `tokens.css` to use the Next.js font CSS variables:
```css
--f-sans: var(--font-ibm-plex-sans), ui-sans-serif, system-ui, sans-serif;
--f-mono: var(--font-ibm-plex-mono), ui-monospace, "SF Mono", Menlo, monospace;
```

- [ ] **Step 1.5: Verify build**

```bash
cd backend-storefront && npm run build 2>&1 | tail -20
```

Expected: build completes, no font-related errors.

- [ ] **Step 1.6: Commit**

```bash
git add backend-storefront/src/styles/tokens.css \
        backend-storefront/src/styles/globals.css \
        backend-storefront/tailwind.config.js \
        backend-storefront/src/app/layout.tsx
git commit -m "feat(design-system): add ardmag design tokens, IBM Plex Sans/Mono fonts"
```

---

## Task 2: Button component

**Files:**
- Create: `src/components/ui/button.tsx`

- [ ] **Step 2.1: Create Button component**

```tsx
// src/components/ui/button.tsx
"use client"

import { ButtonHTMLAttributes, forwardRef } from "react"

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive" | "inv"
type ButtonSize = "sm" | "md" | "lg"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  iconOnly?: boolean
  loading?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:     "bg-[var(--brand-500)] text-white border-[var(--brand-600)] hover:bg-[var(--brand-600)] hover:border-[var(--brand-700)] active:bg-[var(--brand-700)]",
  secondary:   "bg-white text-[var(--stone-900)] border-[var(--stone-300)] hover:bg-[var(--stone-100)] hover:border-[var(--stone-400)]",
  ghost:       "bg-transparent text-[var(--stone-800)] border-transparent hover:bg-[var(--stone-100)]",
  destructive: "bg-[var(--error)] text-white border-[oklch(44%_0.18_25)] hover:bg-[oklch(46%_0.20_25)]",
  inv:         "bg-white text-[var(--stone-900)] border-white hover:bg-[var(--stone-100)]",
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-[14px]",
  lg: "h-12 px-5 text-[15px]",
}

const iconOnlySizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 w-8 px-0",
  md: "h-10 w-10 px-0",
  lg: "h-12 w-12 px-0",
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", iconOnly = false, loading = false, disabled, className = "", children, ...props }, ref) => {
    const sizeClass = iconOnly ? iconOnlySizeStyles[size] : sizeStyles[size]

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[
          "inline-flex items-center justify-center gap-2",
          "font-[family-name:var(--f-sans)] font-medium rounded-[var(--r-sm)]",
          "border cursor-pointer transition-[background-color,border-color,color] duration-75",
          "whitespace-nowrap select-none",
          "focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]",
          "disabled:pointer-events-none disabled:opacity-45",
          "[&_svg]:w-4 [&_svg]:h-4 [&_svg]:flex-shrink-0",
          variantStyles[variant],
          sizeClass,
          className,
        ].join(" ")}
        {...props}
      >
        {loading && (
          <span className="w-[14px] h-[14px] border-[1.5px] border-current border-r-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"
export default Button
export type { ButtonProps, ButtonVariant, ButtonSize }
```

- [ ] **Step 2.2: Commit**

```bash
git add backend-storefront/src/components/ui/button.tsx
git commit -m "feat(design-system): add Button component (primary/secondary/ghost/destructive/inv)"
```

---

## Task 3: Badge component

**Files:**
- Create: `src/components/ui/badge.tsx`

- [ ] **Step 3.1: Create Badge component**

```tsx
// src/components/ui/badge.tsx
type BadgeVariant = "stock-in" | "stock-low" | "stock-out" | "promo" | "new" | "brand" | "info"

interface BadgeProps {
  variant?: BadgeVariant
  dot?: boolean
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  "stock-in":  "bg-[var(--success-bg)] text-[var(--success-fg)]",
  "stock-low": "bg-[var(--warning-bg)] text-[var(--warning-fg)]",
  "stock-out": "bg-[var(--stone-100)] text-[var(--stone-600)]",
  "promo":     "bg-[var(--brand-500)] text-white",
  "new":       "bg-[var(--stone-900)] text-white",
  "brand":     "bg-[var(--stone-100)] text-[var(--stone-800)] border border-[var(--rule)]",
  "info":      "bg-[var(--info-bg)] text-[var(--info-fg)]",
}

export default function Badge({ variant = "brand", dot = false, children, className = "" }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1",
        "font-[family-name:var(--f-mono)] text-[10px] font-medium leading-none",
        "px-[7px] py-1 rounded-[var(--r-sm)]",
        "tracking-[0.04em] uppercase whitespace-nowrap",
        variantStyles[variant],
        className,
      ].join(" ")}
    >
      {dot && (
        <span className="w-[6px] h-[6px] rounded-full bg-current opacity-90" />
      )}
      {children}
    </span>
  )
}

export type { BadgeVariant }
```

- [ ] **Step 3.2: Commit**

```bash
git add backend-storefront/src/components/ui/badge.tsx
git commit -m "feat(design-system): add Badge component (stock/promo/brand/info variants)"
```

---

## Task 4: Input components + barrel export

**Files:**
- Create: `src/components/ui/input.tsx`
- Create: `src/components/ui/index.ts`

- [ ] **Step 4.1: Create Input/Field/Stepper components**

```tsx
// src/components/ui/input.tsx
"use client"

import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode, forwardRef } from "react"

// Field wrapper (label + input + hint)
interface FieldProps {
  label?: string
  hint?: string
  error?: string
  children: ReactNode
  className?: string
}

export function Field({ label, hint, error, children, className = "" }: FieldProps) {
  return (
    <div className={`flex flex-col gap-[6px] min-w-0 ${className}`}>
      {label && (
        <span className="font-[family-name:var(--f-mono)] text-[10px] font-medium tracking-[0.08em] uppercase text-[var(--fg-muted)]">
          {label}
        </span>
      )}
      {children}
      {(hint || error) && (
        <span className={`text-[12px] ${error ? "text-[var(--error-fg)]" : "text-[var(--fg-muted)]"}`}>
          {error ?? hint}
        </span>
      )}
    </div>
  )
}

// InputShell sizes
type InputSize = "sm" | "md" | "lg"
const shellSizes: Record<InputSize, string> = {
  sm: "h-8 text-[13px]",
  md: "h-10 text-[14px]",
  lg: "h-12 text-[15px]",
}

interface InputShellProps {
  size?: InputSize
  error?: boolean
  disabled?: boolean
  mono?: boolean
  adornLeft?: ReactNode
  adornRight?: ReactNode
  children: ReactNode
  className?: string
}

export function InputShell({ size = "md", error, disabled, mono, adornLeft, adornRight, children, className = "" }: InputShellProps) {
  return (
    <div
      className={[
        "flex items-stretch bg-white",
        "border rounded-[var(--r-sm)]",
        "transition-[border-color,box-shadow] duration-75",
        error
          ? "border-[var(--error)] focus-within:shadow-[0_0_0_3px_oklch(52%_0.20_25_/_0.25)]"
          : "border-[var(--rule-strong)] hover:border-[var(--stone-400)] focus-within:border-[var(--brand-500)] focus-within:shadow-[var(--focus-ring)]",
        disabled ? "bg-[var(--stone-100)] border-[var(--rule)] opacity-75 pointer-events-none" : "",
        mono ? "font-[family-name:var(--f-mono)]" : "",
        shellSizes[size],
        className,
      ].join(" ")}
    >
      {adornLeft && (
        <span className="flex items-center justify-center px-[10px] text-[var(--fg-muted)] font-[family-name:var(--f-mono)] text-[12px] border-r border-[var(--rule)] bg-[var(--stone-50)] [&_svg]:w-[14px] [&_svg]:h-[14px]">
          {adornLeft}
        </span>
      )}
      {children}
      {adornRight && (
        <span className="flex items-center justify-center px-[10px] text-[var(--fg-muted)] font-[family-name:var(--f-mono)] text-[12px] border-l border-[var(--rule)] bg-[var(--stone-50)] [&_svg]:w-[14px] [&_svg]:h-[14px]">
          {adornRight}
        </span>
      )}
    </div>
  )
}

// Native input inside InputShell
interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  mono?: boolean
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ mono, className = "", ...props }, ref) => (
    <input
      ref={ref}
      className={[
        "flex-1 min-w-0 border-0 outline-0 bg-transparent px-3",
        "text-[var(--fg)] placeholder:text-[var(--stone-400)]",
        mono ? "font-[family-name:var(--f-mono)]" : "font-[family-name:var(--f-sans)]",
        className,
      ].join(" ")}
      {...props}
    />
  )
)
TextInput.displayName = "TextInput"

// Native select inside InputShell
export const SelectInput = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className = "", ...props }, ref) => (
    <select
      ref={ref}
      className={[
        "flex-1 min-w-0 border-0 outline-0 bg-transparent px-3 pr-8 cursor-pointer",
        "font-[family-name:var(--f-sans)] text-[var(--fg)]",
        "appearance-none",
        "[background-image:url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path d='M4 6 L8 10 L12 6' fill='none' stroke='%23737373' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/></svg>\")]",
        "bg-no-repeat bg-[right_10px_center] [background-size:14px]",
        className,
      ].join(" ")}
      {...props}
    />
  )
)
SelectInput.displayName = "SelectInput"

// Quantity stepper
interface StepperProps {
  value: number
  min?: number
  max?: number
  size?: "sm" | "md"
  onChange: (value: number) => void
}

export function Stepper({ value, min = 1, max = 9999, size = "md", onChange }: StepperProps) {
  const h = size === "sm" ? "h-8" : "h-10"
  const btnW = size === "sm" ? "w-7 text-[14px]" : "w-8 text-[16px]"
  const inputW = size === "sm" ? "w-9 text-[13px]" : "w-11 text-[14px]"

  return (
    <div className={`inline-flex items-stretch border border-[var(--rule-strong)] rounded-[var(--r-sm)] bg-white ${h} focus-within:border-[var(--brand-500)] focus-within:shadow-[var(--focus-ring)]`}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={`${btnW} border-0 border-r border-[var(--rule)] bg-[var(--stone-50)] font-[family-name:var(--f-mono)] text-[var(--stone-700)] cursor-pointer hover:bg-[var(--stone-100)] hover:text-[var(--stone-900)] disabled:opacity-45 disabled:pointer-events-none`}
      >
        -
      </button>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`${inputW} border-0 outline-0 text-center font-[family-name:var(--f-mono)] text-[var(--fg)] bg-transparent`}
      />
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={`${btnW} border-0 border-l border-[var(--rule)] bg-[var(--stone-50)] font-[family-name:var(--f-mono)] text-[var(--stone-700)] cursor-pointer hover:bg-[var(--stone-100)] hover:text-[var(--stone-900)] disabled:opacity-45 disabled:pointer-events-none`}
      >
        +
      </button>
    </div>
  )
}
```

- [ ] **Step 4.2: Create barrel export**

```ts
// src/components/ui/index.ts
export { default as Button } from "./button"
export { default as Badge } from "./badge"
export { Field, InputShell, TextInput, SelectInput, Stepper } from "./input"
export type { ButtonProps, ButtonVariant, ButtonSize } from "./button"
export type { BadgeVariant } from "./badge"
```

- [ ] **Step 4.3: Commit**

```bash
git add backend-storefront/src/components/ui/
git commit -m "feat(design-system): add Input, Field, SelectInput, Stepper components"
```

---

## Task 5: Site Header - 3-layer structure

**Files:**
- Create: `src/modules/layout/components/site-header/util-bar.tsx`
- Create: `src/modules/layout/components/site-header/main-bar.tsx`
- Create: `src/modules/layout/components/site-header/cat-nav.tsx`
- Modify: `src/modules/layout/templates/nav/index.tsx`

**Reference:** DS04 Chrome & Homepage HTML for exact structure and styles.

The header has 3 layers:

**Layer 1 - UtilBar** (`stone-900` background):
- Left: promo dot (brand-500) + message "Transport gratuit la comenzi peste 500 lei"
- Dividers separating: "Program Lun-Vin: 8-16" and "Cluj-Napoca"
- Right: phone link, email link, lang switcher (static "RO" for now)

**Layer 2 - MainBar** (white background):
- Left: Logo (dark square mark "am" in mono + wordmark "ardmag" + tagline "25 DE ANI. LA MILIMETRU." in mono)
- Center: SearchCombo (category filter dropdown + text input + brand-500 submit button)
- Right: Actions (Account icon+label, Cart icon+label+count badge)

**Layer 3 - CatNav** (white background, border-top):
- "Toate" black button (links to /store)
- Category links from Medusa API (fetched server-side)
- Right: "Tenax Romania ↗" link

- [ ] **Step 5.1: Create util-bar.tsx (server component)**

```tsx
// src/modules/layout/components/site-header/util-bar.tsx
export default function UtilBar() {
  return (
    <div style={{ background: "var(--stone-900)", color: "var(--stone-200)" }}
      className="font-[family-name:var(--f-mono)] text-[11px] uppercase tracking-[0.06em]">
      <div className="max-w-[1400px] mx-auto px-6 py-2 flex items-center gap-5 flex-wrap">
        <span className="inline-flex items-center gap-[6px]">
          <span className="w-[6px] h-[6px] rounded-full bg-[var(--brand-500)]" />
          <strong className="text-white font-medium">Transport gratuit</strong>
          <span>la comenzi peste 500 lei</span>
        </span>
        <span className="text-[var(--stone-600)]">|</span>
        <span>Lun - Vin: 8 - 16</span>
        <span className="text-[var(--stone-600)]">|</span>
        <span>Cluj-Napoca</span>
        <div className="ml-auto flex gap-4 items-center">
          <a href="tel:+40722155441" className="text-[var(--stone-200)] no-underline hover:text-[var(--brand-300)]">
            +40 722 155 441
          </a>
          <a href="mailto:office@arcromdiamonds.ro" className="text-[var(--stone-200)] no-underline hover:text-[var(--brand-300)]">
            office@arcromdiamonds.ro
          </a>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5.2: Create cat-nav.tsx (server component, fetches categories)**

```tsx
// src/modules/layout/components/site-header/cat-nav.tsx
import { listCategories } from "@lib/data/categories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function CatNav() {
  const categories = await listCategories()
  const topLevel = categories?.filter((c) => !c.parent_category) ?? []

  return (
    <nav style={{ borderTop: "1px solid var(--rule)", background: "var(--surface)" }}>
      <div className="max-w-[1400px] mx-auto px-6 flex items-stretch gap-[2px]">
        <LocalizedClientLink
          href="/store"
          className="flex items-center gap-[6px] px-4 py-3 text-[13px] font-medium text-white no-underline rounded-none"
          style={{ background: "var(--stone-900)", marginRight: "12px" }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="1" width="5" height="5" rx="0.5" />
            <rect x="8" y="1" width="5" height="5" rx="0.5" />
            <rect x="1" y="8" width="5" height="5" rx="0.5" />
            <rect x="8" y="8" width="5" height="5" rx="0.5" />
          </svg>
          Toate
        </LocalizedClientLink>

        {topLevel.slice(0, 8).map((cat) => (
          <LocalizedClientLink
            key={cat.id}
            href={`/categories/${cat.handle}`}
            className="flex items-center px-4 py-3 text-[13px] font-[family-name:var(--f-sans)] no-underline border-b-2 border-transparent"
            style={{ color: "var(--stone-800)" }}
          >
            {cat.name}
          </LocalizedClientLink>
        ))}

        <div className="ml-auto flex items-stretch">
          <a
            href="https://tenax.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center px-4 py-3 text-[13px] no-underline"
            style={{ color: "var(--fg-muted)" }}
          >
            ↗ Tenax Romania
          </a>
        </div>
      </div>
    </nav>
  )
}
```

- [ ] **Step 5.3: Create main-bar.tsx (server component + client search)**

The search input needs to be a client component for interactivity. Create a SearchCombo client component inline or separate.

```tsx
// src/modules/layout/components/site-header/main-bar.tsx
"use client"

import { Suspense } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"

function Logo() {
  return (
    <LocalizedClientLink href="/" className="flex items-center gap-[10px] no-underline" style={{ color: "var(--fg)" }}>
      <span
        className="w-9 h-9 flex items-center justify-center font-[family-name:var(--f-mono)] font-semibold text-[16px] tracking-[-0.02em] rounded-[var(--r-sm)]"
        style={{ background: "var(--stone-900)", color: "var(--brand-400)" }}
      >
        am
      </span>
      <span>
        <span className="block text-[20px] font-semibold tracking-[-0.025em]">ardmag</span>
        <span className="block font-[family-name:var(--f-mono)] text-[10px] uppercase tracking-[0.08em]" style={{ color: "var(--fg-muted)", marginTop: "2px" }}>
          25 DE ANI. LA MILIMETRU.
        </span>
      </span>
    </LocalizedClientLink>
  )
}

function SearchCombo() {
  const router = useRouter()
  const [query, setQuery] = useState("")

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/store?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-11 max-w-[700px] w-full justify-self-center rounded-[var(--r-sm)] overflow-hidden transition-[border-color] duration-75 focus-within:shadow-[var(--focus-ring)]"
      style={{ border: "1.5px solid var(--stone-300)" }}
    >
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cauta scule, discuri, adezivi..."
        className="flex-1 border-0 outline-0 px-4 text-[14px] bg-transparent min-w-0"
        style={{ fontFamily: "var(--f-sans)", color: "var(--fg)" }}
      />
      <button
        type="submit"
        className="flex items-center gap-2 px-[22px] border-0 cursor-pointer font-medium text-[14px] text-white"
        style={{ background: "var(--brand-500)" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--brand-600)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--brand-500)")}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="7" cy="7" r="4.5" />
          <path d="M10.5 10.5 L14 14" />
        </svg>
        <span>Cauta</span>
      </button>
    </form>
  )
}

function ActionButton({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <LocalizedClientLink
      href={href}
      className="flex flex-col items-center gap-[2px] px-3 py-2 min-w-[56px] no-underline rounded-[var(--r-sm)] transition-colors duration-75"
      style={{ color: "var(--stone-800)", border: 0, background: "transparent" }}
    >
      <span className="w-[22px] h-[22px] flex items-center justify-center">{icon}</span>
      <span className="font-[family-name:var(--f-mono)] text-[11px] uppercase tracking-[0.04em]" style={{ color: "var(--stone-600)" }}>
        {label}
      </span>
    </LocalizedClientLink>
  )
}

export default function MainBar() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-4 grid items-center gap-8" style={{ gridTemplateColumns: "auto 1fr auto" }}>
      <Logo />
      <SearchCombo />
      <div className="flex gap-1 items-center">
        <ActionButton
          href="/account"
          label="Cont"
          icon={
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="8" r="3.5" />
              <path d="M3 19.5c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          }
        />
        <Suspense
          fallback={
            <ActionButton
              href="/cart"
              label="Cos (0)"
              icon={
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 2h2l2.5 11h10l2-8H6" />
                  <circle cx="9" cy="18" r="1" />
                  <circle cx="16" cy="18" r="1" />
                </svg>
              }
            />
          }
        >
          <CartButton />
        </Suspense>
      </div>
    </div>
  )
}
```

- [ ] **Step 5.4: Replace nav/index.tsx with SiteHeader**

```tsx
// src/modules/layout/templates/nav/index.tsx
import { Suspense } from "react"
import UtilBar from "@modules/layout/components/site-header/util-bar"
import MainBar from "@modules/layout/components/site-header/main-bar"
import CatNav from "@modules/layout/components/site-header/cat-nav"

export default function Nav() {
  return (
    <header className="sticky top-0 inset-x-0 z-50" style={{ background: "var(--surface)", borderBottom: "1px solid var(--rule)" }}>
      <UtilBar />
      <MainBar />
      <Suspense fallback={<div className="h-[44px]" />}>
        <CatNav />
      </Suspense>
    </header>
  )
}
```

- [ ] **Step 5.5: Verify header renders**

```bash
cd backend-storefront && npm run dev &
sleep 5
curl -s http://localhost:8000/ro 2>/dev/null | grep -c "ardmag" || echo "check manually"
```

Check `localhost:8000` in browser - header should show 3 layers with ardmag branding.

- [ ] **Step 5.6: Commit**

```bash
git add backend-storefront/src/modules/layout/
git commit -m "feat(design-system): replace Nav with 3-layer SiteHeader (util-bar, main-bar, cat-nav)"
```

---

## Task 6: Mobile Drawer

**Files:**
- Create: `src/modules/layout/components/mobile-drawer/index.tsx`

**Note:** The existing `SideMenu` in `src/modules/layout/components/side-menu/index.tsx` can be kept for checkout flows. The new drawer is for the main header on mobile.

- [ ] **Step 6.1: Create MobileDrawer client component**

```tsx
// src/modules/layout/components/mobile-drawer/index.tsx
"use client"

import { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

interface Category { id: string; name: string; handle: string }

interface MobileDrawerProps {
  categories: Category[]
}

export default function MobileDrawer({ categories }: MobileDrawerProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex flex-col justify-center gap-[5px] w-10 h-10 border-0 bg-transparent cursor-pointer p-2"
        aria-label="Deschide meniu"
      >
        <span className="block w-full h-[1.5px] rounded" style={{ background: "var(--stone-800)" }} />
        <span className="block w-full h-[1.5px] rounded" style={{ background: "var(--stone-800)" }} />
        <span className="block w-5 h-[1.5px] rounded" style={{ background: "var(--stone-800)" }} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0"
            style={{ background: "oklch(0% 0 0 / 0.5)" }}
            onClick={() => setOpen(false)}
          />
          <div
            className="relative flex flex-col w-[300px] h-full overflow-y-auto"
            style={{ background: "var(--surface)", borderRight: "1px solid var(--rule)" }}
          >
            <div className="flex items-center justify-between p-4" style={{ borderBottom: "1px solid var(--rule)" }}>
              <span className="font-semibold text-[18px] tracking-[-0.02em]">ardmag</span>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center border-0 bg-transparent cursor-pointer rounded-[var(--r-sm)] hover:bg-[var(--stone-100)]"
                aria-label="Inchide meniu"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M3 3 L13 13 M13 3 L3 13" />
                </svg>
              </button>
            </div>

            <nav className="flex flex-col flex-1 p-4 gap-1">
              {categories.map((cat) => (
                <LocalizedClientLink
                  key={cat.id}
                  href={`/categories/${cat.handle}`}
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 text-[14px] no-underline rounded-[var(--r-sm)] hover:bg-[var(--stone-100)]"
                  style={{ color: "var(--fg)" }}
                >
                  {cat.name}
                </LocalizedClientLink>
              ))}
            </nav>

            <div className="p-4" style={{ borderTop: "1px solid var(--rule)" }}>
              <LocalizedClientLink
                href="/account"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-[14px] no-underline rounded-[var(--r-sm)] hover:bg-[var(--stone-100)]"
                style={{ color: "var(--fg)" }}
              >
                Contul meu
              </LocalizedClientLink>
              <div className="mt-3 font-[family-name:var(--f-mono)] text-[11px] uppercase tracking-[0.06em]" style={{ color: "var(--fg-muted)" }}>
                <div>+40 722 155 441</div>
                <div>Lun-Vin: 8-16</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
```

The mobile drawer should be integrated into the MainBar on small screens. Update `main-bar.tsx` to import MobileDrawer and show it only on mobile (below the `small` breakpoint, hidden on desktop).

- [ ] **Step 6.2: Commit**

```bash
git add backend-storefront/src/modules/layout/components/mobile-drawer/
git commit -m "feat(design-system): add mobile navigation drawer"
```

---

## Task 7: Site Footer - dark 5-column layout

**Files:**
- Modify: `src/modules/layout/templates/footer/index.tsx`

**Reference:** DS04 footer section - `stone-900` background with 5 columns.

Columns:
1. **Brand**: logo + tagline + description + contact info
2. **Produse**: category links (from Medusa)
3. **Informatii**: Despre noi, Contact, Transport, Returnari
4. **Conturi**: Cont nou, Comenzile mele, Cos
5. **Contact**: address, phone, email, program

Footer bottom bar: copyright on left, certification icons (CE, ISO) right.

- [ ] **Step 7.1: Replace footer/index.tsx**

```tsx
// src/modules/layout/templates/footer/index.tsx
import { listCategories } from "@lib/data/categories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function Footer() {
  const categories = await listCategories()
  const topLevel = categories?.filter((c) => !c.parent_category) ?? []

  return (
    <footer style={{ background: "var(--stone-900)", color: "var(--stone-200)" }}>
      {/* 5-column grid */}
      <div
        className="max-w-[1400px] mx-auto px-6 py-14"
        style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1.3fr", gap: "48px" }}
      >
        {/* Col 1: Brand */}
        <div>
          <div className="flex items-center gap-[10px] mb-4">
            <span
              className="w-9 h-9 flex items-center justify-center font-[family-name:var(--f-mono)] font-semibold text-[16px] rounded-[var(--r-sm)]"
              style={{ background: "var(--stone-800)", color: "var(--brand-400)" }}
            >
              am
            </span>
            <span>
              <span className="block text-[18px] font-semibold tracking-[-0.02em] text-white">ardmag</span>
              <span className="block font-[family-name:var(--f-mono)] text-[10px] uppercase tracking-[0.08em]" style={{ color: "var(--stone-500)" }}>
                25 DE ANI. LA MILIMETRU.
              </span>
            </span>
          </div>
          <p className="text-[13px] leading-[1.6]" style={{ color: "var(--stone-400)", maxWidth: "280px" }}>
            Distribuitor autorizat Tenax si furnizor de scule profesionale pentru prelucrarea pietrei naturale din 2001.
          </p>
          <div className="mt-4 font-[family-name:var(--f-mono)] text-[11px] uppercase tracking-[0.06em]" style={{ color: "var(--stone-500)" }}>
            <div>Calea Baciului 1-3, Cluj-Napoca 400230</div>
            <div className="mt-1"><a href="tel:+40722155441" style={{ color: "var(--stone-300)" }}>+40 722 155 441</a></div>
          </div>
        </div>

        {/* Col 2: Categories */}
        <div>
          <h5 className="font-[family-name:var(--f-mono)] text-[11px] uppercase tracking-[0.08em] mb-[14px] font-medium" style={{ color: "var(--stone-500)" }}>
            Produse
          </h5>
          <ul className="flex flex-col gap-2 list-none p-0 m-0">
            {topLevel.slice(0, 8).map((cat) => (
              <li key={cat.id}>
                <LocalizedClientLink
                  href={`/categories/${cat.handle}`}
                  className="text-[13px] no-underline hover:text-[var(--brand-300)]"
                  style={{ color: "var(--stone-200)" }}
                >
                  {cat.name}
                </LocalizedClientLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Info */}
        <div>
          <h5 className="font-[family-name:var(--f-mono)] text-[11px] uppercase tracking-[0.08em] mb-[14px] font-medium" style={{ color: "var(--stone-500)" }}>
            Informatii
          </h5>
          <ul className="flex flex-col gap-2 list-none p-0 m-0">
            {["Despre noi", "Contact", "Transport si livrare", "Returnari", "Garantie"].map((item) => (
              <li key={item}>
                <span className="text-[13px]" style={{ color: "var(--stone-400)" }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 4: Account */}
        <div>
          <h5 className="font-[family-name:var(--f-mono)] text-[11px] uppercase tracking-[0.08em] mb-[14px] font-medium" style={{ color: "var(--stone-500)" }}>
            Cont
          </h5>
          <ul className="flex flex-col gap-2 list-none p-0 m-0">
            {[
              { label: "Inregistrare", href: "/account" },
              { label: "Autentificare", href: "/account" },
              { label: "Comenzile mele", href: "/account/orders" },
              { label: "Cos de cumparaturi", href: "/cart" },
            ].map(({ label, href }) => (
              <li key={label}>
                <LocalizedClientLink
                  href={href}
                  className="text-[13px] no-underline hover:text-[var(--brand-300)]"
                  style={{ color: "var(--stone-200)" }}
                >
                  {label}
                </LocalizedClientLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 5: Contact / distribuitor */}
        <div>
          <h5 className="font-[family-name:var(--f-mono)] text-[11px] uppercase tracking-[0.08em] mb-[14px] font-medium" style={{ color: "var(--stone-500)" }}>
            Contact
          </h5>
          <div className="text-[13px] flex flex-col gap-2" style={{ color: "var(--stone-400)" }}>
            <div>Lun - Vin: 8:00 - 16:00</div>
            <a href="tel:+40722155441" className="no-underline hover:text-white" style={{ color: "var(--stone-300)" }}>
              +40 722 155 441
            </a>
            <a href="mailto:office@arcromdiamonds.ro" className="no-underline hover:text-white" style={{ color: "var(--stone-300)" }}>
              office@arcromdiamonds.ro
            </a>
            <div className="mt-2 font-[family-name:var(--f-mono)] text-[11px] uppercase tracking-[0.06em]" style={{ color: "var(--stone-600)" }}>
              Distribuitor autorizat
            </div>
            <div className="font-semibold text-white">TENAX</div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid var(--stone-800)", background: "var(--stone-950)" }}>
        <div className="max-w-[1400px] mx-auto px-6 py-[18px] flex items-center gap-5 flex-wrap">
          <span className="font-[family-name:var(--f-mono)] text-[11px]" style={{ color: "var(--stone-500)" }}>
            © {new Date().getFullYear()} Arcrom Diamonds SRL. Toate drepturile rezervate.
          </span>
          <div className="ml-auto flex gap-5">
            <span className="text-[12px]" style={{ color: "var(--stone-600)" }}>GDPR</span>
            <span className="text-[12px]" style={{ color: "var(--stone-600)" }}>Termeni si conditii</span>
            <span className="text-[12px]" style={{ color: "var(--stone-600)" }}>Politica de confidentialitate</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 7.2: Commit**

```bash
git add backend-storefront/src/modules/layout/templates/footer/index.tsx
git commit -m "feat(design-system): replace Footer with dark 5-column ardmag footer"
```

---

## Task 8: ProductCard - grid variant

**Files:**
- Create: `src/modules/products/components/product-card/index.tsx`

**Reference:** DS03 `.pcard` styles (exact match required).

The ProductCard replaces `ProductPreview` for grid listings. It uses `ProductImage` for the image.

- [ ] **Step 8.1: Create ProductCard component**

```tsx
// src/modules/products/components/product-card/index.tsx
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductImage from "@modules/products/components/product-image"
import Badge from "@components/ui/badge"
import { getProductPrice } from "@lib/util/get-product-price"

interface ProductCardProps {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
}

function extractStem(product: HttpTypes.StoreProduct): string | null {
  const thumbnail = product.thumbnail
  if (!thumbnail) return null
  const match = thumbnail.match(/\/([^/]+)\.(jpg|jpeg|png|webp|avif)$/i)
  return match ? match[1] : null
}

function extractSpecs(product: HttpTypes.StoreProduct): string[] {
  const tags = product.tags ?? []
  return tags
    .filter((t) => t.value?.includes(":") && !t.value.startsWith("brand:") && !t.value.startsWith("promo:"))
    .slice(0, 3)
    .map((t) => t.value.split(":")[1] ?? t.value)
}

function extractBrand(product: HttpTypes.StoreProduct): string | null {
  const brandTag = product.tags?.find((t) => t.value?.startsWith("brand:"))
  return brandTag ? brandTag.value.split(":")[1]?.toUpperCase() ?? null : null
}

function getPromoPercent(product: HttpTypes.StoreProduct): number | null {
  const promoTag = product.tags?.find((t) => t.value?.startsWith("promo:"))
  if (!promoTag) return null
  const pct = parseInt(promoTag.value.split(":")[1] ?? "", 10)
  return isNaN(pct) ? null : pct
}

function formatPrice(amount: number | undefined, currencyCode: string): string {
  if (!amount) return "Pret la cerere"
  return new Intl.NumberFormat("ro-RO", { style: "currency", currency: currencyCode, minimumFractionDigits: 0 }).format(amount / 100)
}

export default function ProductCard({ product, region }: ProductCardProps) {
  const { cheapestPrice } = getProductPrice({ product })
  const stem = extractStem(product)
  const specs = extractSpecs(product)
  const brand = extractBrand(product)
  const promoPct = getPromoPercent(product)
  const isOutOfStock = product.variants?.every((v) => !v.manage_inventory || (v.inventory_quantity ?? 0) <= 0) ?? false
  const isLowStock = !isOutOfStock && product.variants?.some((v) => v.manage_inventory && (v.inventory_quantity ?? 0) <= 5) ?? false

  return (
    <div
      className="relative flex flex-col bg-white transition-[border-color,box-shadow] duration-75 hover:shadow-[var(--sh-sm)]"
      style={{ border: "1px solid var(--rule)", borderRadius: "var(--r-sm)" }}
    >
      {/* Image */}
      <div className="relative" style={{ aspectRatio: "1/1", background: "var(--stone-100)", borderBottom: "1px solid var(--rule)", overflow: "hidden", borderRadius: "var(--r-sm) var(--r-sm) 0 0" }}>
        {stem && product.handle ? (
          <ProductImage
            slug={product.handle}
            stem={stem}
            variant="card"
            alt={product.title ?? ""}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center font-[family-name:var(--f-mono)] text-[10px] uppercase tracking-[0.08em]" style={{ color: "var(--stone-400)", background: "repeating-linear-gradient(135deg, var(--stone-100) 0 12px, var(--stone-50) 12px 24px)" }}>
            <span style={{ background: "var(--stone-50)", padding: "4px 8px", border: "1px solid var(--stone-200)" }}>
              {product.handle}
            </span>
          </div>
        )}

        {/* Overlay badges */}
        <div className="absolute top-[10px] left-[10px] right-[10px] flex justify-between pointer-events-none">
          <div className="flex gap-[6px] flex-wrap">
            {promoPct && <Badge variant="promo">-{promoPct}%</Badge>}
            {isOutOfStock && <Badge variant="stock-out">Stoc 0</Badge>}
            {!isOutOfStock && isLowStock && <Badge variant="stock-low" dot>Stoc redus</Badge>}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-[6px] flex-1 p-4">
        {brand && (
          <span className="font-[family-name:var(--f-mono)] text-[10px] uppercase tracking-[0.06em] font-medium" style={{ color: "var(--stone-500)" }}>
            {brand}
          </span>
        )}
        <LocalizedClientLink href={`/products/${product.handle}`} className="no-underline">
          <h3 className="text-[14px] font-semibold leading-[1.35] tracking-[-0.005em] m-0 hover:text-[var(--brand-700)]" style={{ color: "var(--fg)" }}>
            {product.title}
          </h3>
        </LocalizedClientLink>
        {specs.length > 0 && (
          <div className="flex flex-wrap gap-x-[10px] gap-y-1 mt-1 font-[family-name:var(--f-mono)] text-[11px]" style={{ color: "var(--stone-600)" }}>
            {specs.map((spec, i) => (
              <span key={i}>{spec}</span>
            ))}
          </div>
        )}
      </div>

      {/* Foot: price + CTA */}
      <div
        className="flex items-center justify-between gap-2 px-4 py-3 mt-auto"
        style={{ borderTop: "1px solid var(--rule)", background: "var(--stone-50)" }}
      >
        <div className="flex flex-col leading-[1.1]">
          {cheapestPrice && (
            <>
              <span className="font-[family-name:var(--f-mono)] text-[15px] font-medium" style={{ color: "var(--fg)" }}>
                {cheapestPrice.calculated_price}
              </span>
              {cheapestPrice.price_type === "sale" && cheapestPrice.original_price && (
                <span className="font-[family-name:var(--f-mono)] text-[11px] line-through mt-[2px]" style={{ color: "var(--stone-500)" }}>
                  {cheapestPrice.original_price}
                </span>
              )}
            </>
          )}
        </div>
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          className="inline-flex items-center justify-center h-8 px-3 text-[13px] font-medium rounded-[var(--r-sm)] no-underline text-white border border-[var(--brand-600)]"
          style={{ background: "var(--brand-500)" }}
        >
          {isOutOfStock ? "Detalii" : "Adauga"}
        </LocalizedClientLink>
      </div>
    </div>
  )
}
```

- [ ] **Step 8.2: Commit**

```bash
git add backend-storefront/src/modules/products/components/product-card/
git commit -m "feat(design-system): add ProductCard grid component"
```

---

## Task 9: ProductRow - list variant

**Files:**
- Create: `src/modules/products/components/product-row/index.tsx`

**Reference:** DS03 `.prow` styles - 3-column grid (thumb 88px | meta+title | price).

- [ ] **Step 9.1: Create ProductRow component**

```tsx
// src/modules/products/components/product-row/index.tsx
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductImage from "@modules/products/components/product-image"
import Badge from "@components/ui/badge"
import { getProductPrice } from "@lib/util/get-product-price"

interface ProductRowProps {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
}

function extractStem(product: HttpTypes.StoreProduct): string | null {
  const match = product.thumbnail?.match(/\/([^/]+)\.(jpg|jpeg|png|webp|avif)$/i)
  return match ? match[1] : null
}

export default function ProductRow({ product, region }: ProductRowProps) {
  const { cheapestPrice } = getProductPrice({ product })
  const stem = extractStem(product)
  const brandTag = product.tags?.find((t) => t.value?.startsWith("brand:"))
  const brand = brandTag ? brandTag.value.split(":")[1]?.toUpperCase() : null
  const specs = (product.tags ?? [])
    .filter((t) => t.value?.includes(":") && !t.value.startsWith("brand:") && !t.value.startsWith("promo:"))
    .slice(0, 4)
    .map((t) => t.value.split(":")[1] ?? t.value)

  return (
    <div
      className="bg-white hover:bg-[var(--stone-50)] transition-colors duration-75"
      style={{
        display: "grid",
        gridTemplateColumns: "88px 1fr auto",
        gridTemplateRows: "auto auto auto",
        gridTemplateAreas: `"thumb meta price" "thumb title title" "thumb foot foot"`,
        columnGap: "16px",
        rowGap: "6px",
        padding: "14px 16px",
        border: "1px solid var(--rule)",
        borderBottom: 0,
      }}
    >
      {/* Thumb */}
      <div style={{ gridArea: "thumb", alignSelf: "center" }}>
        <div className="w-[72px] h-[72px] rounded-[var(--r-sm)] overflow-hidden" style={{ border: "1px solid var(--rule)" }}>
          {stem && product.handle ? (
            <ProductImage slug={product.handle} stem={stem} variant="thumb" alt={product.title ?? ""} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full" style={{ background: "repeating-linear-gradient(135deg, var(--stone-100) 0 8px, var(--stone-50) 8px 16px)" }} />
          )}
        </div>
      </div>

      {/* Meta: brand + SKU */}
      <div style={{ gridArea: "meta" }} className="flex items-center gap-2">
        {brand && <span className="font-[family-name:var(--f-mono)] text-[10px] uppercase tracking-[0.06em]" style={{ color: "var(--stone-500)" }}>{brand}</span>}
        {product.variants?.[0]?.sku && (
          <span className="font-[family-name:var(--f-mono)] text-[11px]" style={{ color: "var(--stone-400)" }}>
            {product.variants[0].sku}
          </span>
        )}
      </div>

      {/* Price */}
      <div style={{ gridArea: "price" }} className="flex flex-col items-end leading-[1.1]">
        {cheapestPrice && (
          <>
            <span className="font-[family-name:var(--f-mono)] text-[15px] font-medium" style={{ color: "var(--fg)" }}>
              {cheapestPrice.calculated_price}
            </span>
            {cheapestPrice.price_type === "sale" && cheapestPrice.original_price && (
              <span className="font-[family-name:var(--f-mono)] text-[11px] line-through" style={{ color: "var(--stone-400)" }}>
                {cheapestPrice.original_price}
              </span>
            )}
          </>
        )}
      </div>

      {/* Title */}
      <div style={{ gridArea: "title" }}>
        <LocalizedClientLink href={`/products/${product.handle}`} className="no-underline">
          <h3 className="text-[14px] font-semibold leading-[1.35] tracking-[-0.005em] m-0 hover:text-[var(--brand-700)]" style={{ color: "var(--fg)" }}>
            {product.title}
          </h3>
        </LocalizedClientLink>
      </div>

      {/* Foot: specs + stock + CTA */}
      <div style={{ gridArea: "foot" }} className="flex items-center gap-4 flex-wrap">
        <div className="flex gap-[10px] flex-wrap font-[family-name:var(--f-mono)] text-[11px]" style={{ color: "var(--stone-600)" }}>
          {specs.map((spec, i) => <span key={i}>{spec}</span>)}
        </div>
        <div className="ml-auto">
          <LocalizedClientLink
            href={`/products/${product.handle}`}
            className="inline-flex items-center justify-center h-8 px-3 text-[13px] font-medium rounded-[var(--r-sm)] no-underline text-white"
            style={{ background: "var(--brand-500)", border: "1px solid var(--brand-600)" }}
          >
            Detalii
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 9.2: Commit**

```bash
git add backend-storefront/src/modules/products/components/product-row/
git commit -m "feat(design-system): add ProductRow list component"
```

---

## Task 10: CategoryCard component

**Files:**
- Create: `src/modules/products/components/category-card/index.tsx`

**Reference:** DS03 category card - 1:1 image, dark overlay on hover, title/count/link.

- [ ] **Step 10.1: Create CategoryCard**

```tsx
// src/modules/products/components/category-card/index.tsx
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

interface CategoryCardProps {
  category: HttpTypes.StoreProductCategory & { product_count?: number }
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <LocalizedClientLink href={`/categories/${category.handle}`} className="no-underline group">
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: "1/1", borderRadius: "var(--r-sm)", background: "var(--stone-800)", border: "1px solid var(--rule)" }}
      >
        {/* Fallback stone gradient background */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, var(--stone-700) 0%, var(--stone-900) 100%)" }}
        />

        {/* Overlay: always partially visible, stronger on hover */}
        <div
          className="absolute inset-0 flex flex-col justify-end p-4 transition-[background] duration-150"
          style={{ background: "linear-gradient(to top, oklch(0% 0 0 / 0.7) 0%, transparent 50%)" }}
        >
          <span className="font-[family-name:var(--f-mono)] text-[10px] uppercase tracking-[0.08em] mb-1" style={{ color: "var(--brand-400)" }}>
            {category.product_count ?? 0} produse
          </span>
          <h3 className="text-white text-[16px] font-semibold leading-[1.25] tracking-[-0.01em] m-0">
            {category.name}
          </h3>
          <span
            className="font-[family-name:var(--f-mono)] text-[11px] uppercase tracking-[0.05em] mt-2 transition-colors duration-75"
            style={{ color: "var(--brand-400)" }}
          >
            Vezi toate →
          </span>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
```

- [ ] **Step 10.2: Commit**

```bash
git add backend-storefront/src/modules/products/components/category-card/
git commit -m "feat(design-system): add CategoryCard component"
```

---

## Task 11: SpecTable component

**Files:**
- Create: `src/modules/products/components/spec-table/index.tsx`

**Reference:** DS01 density test table - dense mono, 8/10px padding, alternating rows.

- [ ] **Step 11.1: Create SpecTable**

```tsx
// src/modules/products/components/spec-table/index.tsx
interface SpecRow {
  label: string
  value: string
}

interface SpecTableProps {
  rows: SpecRow[]
  title?: string
}

export default function SpecTable({ rows, title }: SpecTableProps) {
  if (rows.length === 0) return null

  return (
    <div className="overflow-x-auto" style={{ border: "1px solid var(--rule)", borderRadius: "var(--r-sm)" }}>
      {title && (
        <div className="px-[10px] py-2" style={{ borderBottom: "1px solid var(--rule)", background: "var(--stone-50)" }}>
          <span className="font-[family-name:var(--f-mono)] text-[11px] uppercase tracking-[0.06em] font-medium" style={{ color: "var(--fg-muted)" }}>
            {title}
          </span>
        </div>
      )}
      <table className="w-full" style={{ borderCollapse: "collapse", fontSize: "12px" }}>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 1 ? "var(--stone-50)" : "var(--surface)" }}>
              <td
                className="font-[family-name:var(--f-mono)] text-[10px] uppercase tracking-[0.06em] font-medium"
                style={{ padding: "7px 10px", color: "var(--fg-muted)", borderTop: i > 0 ? "1px solid var(--rule)" : undefined, width: "40%" }}
              >
                {row.label}
              </td>
              <td
                className="font-[family-name:var(--f-mono)] text-[12px]"
                style={{ padding: "7px 10px", color: "var(--fg)", borderTop: i > 0 ? "1px solid var(--rule)" : undefined }}
              >
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 11.2: Commit**

```bash
git add backend-storefront/src/modules/products/components/spec-table/
git commit -m "feat(design-system): add SpecTable component"
```

---

## Task 12: SupplierStrip component

**Files:**
- Create: `src/modules/home/components/supplier-strip/index.tsx`

**Reference:** DS03 `.supplier-strip` - shows supplier brand logos in a horizontal strip.

- [ ] **Step 12.1: Create SupplierStrip**

```tsx
// src/modules/home/components/supplier-strip/index.tsx
const SUPPLIERS = [
  { name: "TENAX", tagline: "Adezivi si chimie pentru piatra" },
  { name: "TYROLIT", tagline: "Abrazive de precizie" },
  { name: "HUSQVARNA", tagline: "Echipamente de taiere" },
  { name: "RAIMONDI", tagline: "Unelte de pozare gresie" },
  { name: "BERNER", tagline: "Consumabile profesionale" },
]

export default function SupplierStrip() {
  return (
    <section className="py-12" style={{ background: "var(--stone-50)", borderTop: "1px solid var(--rule)" }}>
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-baseline justify-between mb-[18px] flex-wrap gap-3">
          <h3 className="font-[family-name:var(--f-mono)] text-[12px] uppercase tracking-[0.08em] font-medium m-0" style={{ color: "var(--fg-muted)" }}>
            Furnizori parteneri
          </h3>
          <a href="/store" className="font-[family-name:var(--f-mono)] text-[11px] uppercase tracking-[0.05em] no-underline" style={{ color: "var(--stone-700)" }}>
            Catalog complet
          </a>
        </div>
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${SUPPLIERS.length}, 1fr)` }}>
          {SUPPLIERS.map((s) => (
            <div
              key={s.name}
              className="flex flex-col items-center justify-center p-4 rounded-[var(--r-sm)] transition-[border-color,box-shadow] duration-75"
              style={{ border: "1px solid var(--rule)", background: "var(--surface)", aspectRatio: "3/2" }}
            >
              <span className="font-[family-name:var(--f-mono)] text-[14px] font-semibold tracking-[0.02em]" style={{ color: "var(--stone-900)" }}>
                {s.name}
              </span>
              <span className="text-[11px] text-center mt-1 leading-[1.3]" style={{ color: "var(--stone-500)" }}>
                {s.tagline}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 12.2: Commit**

```bash
git add backend-storefront/src/modules/home/components/supplier-strip/
git commit -m "feat(design-system): add SupplierStrip component"
```

---

## Task 13: Homepage assembly

**Files:**
- Modify: `src/modules/home/components/hero/index.tsx`
- Create: `src/modules/home/components/category-grid/index.tsx`
- Create: `src/modules/home/components/promo-band/index.tsx`
- Modify: `src/app/[countryCode]/(main)/page.tsx`

**Rhythm:** dark Hero (stone-900) -> light CategoryGrid (stone-50) -> dark PromoBand (brand-500) -> light ProductGrid (white) -> SupplierStrip -> dark Footer

- [ ] **Step 13.1: Replace Hero with ardmag-branded dark hero**

```tsx
// src/modules/home/components/hero/index.tsx
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function Hero() {
  return (
    <section
      style={{
        background: "var(--stone-900)",
        color: "white",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        minHeight: "520px",
      }}
    >
      {/* Main hero panel */}
      <div
        className="flex flex-col justify-between p-12"
        style={{ borderRight: "1px solid var(--stone-800)", position: "relative" }}
      >
        <div>
          <div className="font-[family-name:var(--f-mono)] text-[11px] uppercase tracking-[0.08em] mb-4" style={{ color: "var(--brand-400)" }}>
            Distribuitor autorizat Tenax - Romania
          </div>
          <h1 className="text-[44px] leading-[1.05] tracking-[-0.025em] font-semibold m-0 max-w-[560px]">
            Scule profesionale pentru piatra naturala
          </h1>
          <p className="mt-4 text-[15px] leading-[1.6] max-w-[480px]" style={{ color: "var(--stone-300)" }}>
            Discuri diamantate, adezivi Tenax, mase de slefuit, scule de pozare. Stoc permanent. Livrare in 24h.
          </p>
        </div>

        <div>
          <div className="flex gap-[10px] flex-wrap">
            <LocalizedClientLink
              href="/store"
              className="inline-flex items-center justify-center h-12 px-6 text-[15px] font-medium rounded-[var(--r-sm)] no-underline text-white"
              style={{ background: "var(--brand-500)", border: "1px solid var(--brand-600)" }}
            >
              Catalog produse
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/categories/discuri-de-taiere"
              className="inline-flex items-center justify-center h-12 px-6 text-[15px] font-medium rounded-[var(--r-sm)] no-underline"
              style={{ background: "white", color: "var(--stone-900)", border: "1px solid white" }}
            >
              Discuri diamantate
            </LocalizedClientLink>
          </div>

          <div className="flex gap-8 mt-6 flex-wrap">
            {[
              { value: "25+", label: "Ani experienta" },
              { value: "500+", label: "Produse in stoc" },
              { value: "90+", label: "Marci in catalog" },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col">
                <strong className="font-[family-name:var(--f-mono)] text-[22px] font-medium text-white">{value}</strong>
                <span className="font-[family-name:var(--f-mono)] text-[10px] uppercase tracking-[0.06em] mt-[2px]" style={{ color: "var(--stone-500)" }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Side: 2 category highlight cards */}
      <div className="grid p-6 gap-4" style={{ gridTemplateRows: "1fr 1fr" }}>
        {[
          { href: "/categories/discuri-de-taiere", kicker: "Bestseller", title: "Discuri diamantate de taiere", desc: "Pentru marmura, granit, andezit, gresie" },
          { href: "/categories/adezivi-si-solutii", kicker: "Produs nou", title: "Adezivi Tenax profesionali", desc: "Bicomponenti, epoxidici, poliesterici" },
        ].map(({ href, kicker, title, desc }) => (
          <LocalizedClientLink
            key={href}
            href={href}
            className="flex flex-col p-6 rounded-[var(--r-sm)] no-underline transition-[background] duration-75"
            style={{ background: "var(--stone-800)", border: "1px solid var(--stone-700)" }}
          >
            <span className="font-[family-name:var(--f-mono)] text-[10px] uppercase tracking-[0.08em] mb-2" style={{ color: "var(--brand-600)" }}>
              {kicker}
            </span>
            <h3 className="text-[20px] font-semibold leading-[1.2] tracking-[-0.015em] m-0 max-w-[80%] text-white">
              {title}
            </h3>
            <p className="text-[13px] mt-2 m-0" style={{ color: "var(--fg-muted)" }}>{desc}</p>
            <span className="mt-auto font-[family-name:var(--f-mono)] text-[12px] uppercase tracking-[0.05em]" style={{ color: "var(--brand-700)" }}>
              Vede produsele →
            </span>
          </LocalizedClientLink>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 13.2: Create CategoryGrid**

```tsx
// src/modules/home/components/category-grid/index.tsx
import { HttpTypes } from "@medusajs/types"
import CategoryCard from "@modules/products/components/category-card"

interface CategoryGridProps {
  categories: (HttpTypes.StoreProductCategory & { product_count?: number })[]
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  const visible = categories.filter((c) => !c.parent_category).slice(0, 8)

  return (
    <section className="py-12" style={{ background: "var(--stone-50)" }}>
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-[22px] font-semibold tracking-[-0.015em] m-0" style={{ color: "var(--fg)" }}>
            Categorii
          </h2>
          <a href="/store" className="font-[family-name:var(--f-mono)] text-[11px] uppercase tracking-[0.05em] no-underline" style={{ color: "var(--stone-700)" }}>
            Toate produsele
          </a>
        </div>
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
          {visible.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 13.3: Create PromoBand**

```tsx
// src/modules/home/components/promo-band/index.tsx
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function PromoBand() {
  return (
    <section className="py-12" style={{ background: "var(--brand-500)" }}>
      <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between gap-6 flex-wrap">
        <div>
          <div className="font-[family-name:var(--f-mono)] text-[11px] uppercase tracking-[0.08em] mb-2" style={{ color: "oklch(90% 0.06 42)" }}>
            Oferta lunii
          </div>
          <h2 className="text-[28px] font-semibold tracking-[-0.02em] m-0 text-white">
            Adezivi Tenax - 20% reducere
          </h2>
          <p className="mt-1 text-[15px]" style={{ color: "oklch(90% 0.06 42)" }}>
            Stoc limitat. Valabil pana la epuizarea stocului.
          </p>
        </div>
        <LocalizedClientLink
          href="/categories/adezivi-si-solutii"
          className="inline-flex items-center justify-center h-12 px-6 text-[15px] font-medium rounded-[var(--r-sm)] no-underline whitespace-nowrap"
          style={{ background: "var(--stone-900)", color: "white", border: "1px solid var(--stone-800)" }}
        >
          Vezi oferta
        </LocalizedClientLink>
      </div>
    </section>
  )
}
```

- [ ] **Step 13.4: Rewrite homepage page.tsx**

```tsx
// src/app/[countryCode]/(main)/page.tsx
import { Metadata } from "next"
import Hero from "@modules/home/components/hero"
import CategoryGrid from "@modules/home/components/category-grid"
import PromoBand from "@modules/home/components/promo-band"
import SupplierStrip from "@modules/home/components/supplier-strip"
import { listCategories } from "@lib/data/categories"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import ProductCard from "@modules/products/components/product-card"

export const metadata: Metadata = {
  title: "ardmag - Scule profesionale pentru piatra naturala",
  description: "Distribuitor autorizat Tenax. Discuri diamantate, adezivi, scule de prelucrare piatra naturala. Livrare in 24h din Cluj-Napoca.",
}

export default async function Home(props: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await props.params

  const [categories, region] = await Promise.all([
    listCategories(),
    getRegion(countryCode),
  ])

  const { response: { products } } = await listProducts({
    queryParams: { limit: 8, order: "created_at" },
    ...(region?.id ? { regionId: region.id } : {}),
  })

  if (!region) return null

  return (
    <>
      <Hero />
      <CategoryGrid categories={categories ?? []} />
      <PromoBand />

      {/* Featured products grid */}
      <section className="py-12" style={{ background: "var(--surface)" }}>
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-[22px] font-semibold tracking-[-0.015em] m-0" style={{ color: "var(--fg)" }}>
              Produse noi
            </h2>
            <a href="/store" className="font-[family-name:var(--f-mono)] text-[11px] uppercase tracking-[0.05em] no-underline" style={{ color: "var(--stone-700)" }}>
              Catalog complet
            </a>
          </div>
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} region={region} />
            ))}
          </div>
        </div>
      </section>

      <SupplierStrip />
    </>
  )
}
```

- [ ] **Step 13.5: Verify homepage renders with real data**

```bash
curl -s http://localhost:9000/store/products?limit=1 | python3 -m json.tool 2>/dev/null | head -5 || echo "backend check manually"
```

Browse `http://localhost:8000/ro` and verify: Hero dark -> CategoryGrid light -> PromoBand orange -> ProductGrid white -> SupplierStrip.

- [ ] **Step 13.6: Commit**

```bash
git add backend-storefront/src/modules/home/ backend-storefront/src/app/
git commit -m "feat(design-system): implement homepage with alternating rhythm (hero/categories/promo/products/suppliers)"
```

---

## Task 14: Category page - use ProductCard

**Files:**
- Modify: `src/modules/categories/templates/index.tsx`
- Modify: `src/modules/store/templates/index.tsx`

- [ ] **Step 14.1: Update category template to use ProductCard**

Read `src/modules/categories/templates/index.tsx` first. Replace whatever `ProductPreview` it uses with `ProductCard`. The grid should be `repeat(4, 1fr)` on desktop, `repeat(2, 1fr)` on mobile.

```tsx
// Key change in category template - replace product grid section:
import ProductCard from "@modules/products/components/product-card"

// In the products grid, replace <ProductPreview> with:
<div className="grid gap-4" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
  {products.map((product) => (
    <ProductCard key={product.id} product={product} region={region} />
  ))}
</div>
```

- [ ] **Step 14.2: Commit**

```bash
git add backend-storefront/src/modules/categories/templates/ backend-storefront/src/modules/store/templates/
git commit -m "feat(design-system): use ProductCard in category and store listings"
```

---

## Task 15: Product detail page - SpecTable + ProductImage

**Files:**
- Modify: `src/modules/products/templates/index.tsx`
- Modify: `src/modules/products/templates/product-info/index.tsx`

- [ ] **Step 15.1: Integrate SpecTable in product template**

Read `src/modules/products/templates/product-info/index.tsx`. After the product description, add a SpecTable built from product metadata (options, variant specs from tags).

```tsx
import SpecTable from "@modules/products/components/spec-table"

// Extract spec rows from product options/tags
const specRows = [
  ...(product.options ?? []).map((opt) => ({
    label: opt.title,
    value: opt.values?.map((v) => v.value).join(", ") ?? "",
  })),
  ...(product.tags ?? [])
    .filter((t) => t.value?.includes(":") && !t.value.startsWith("brand:") && !t.value.startsWith("promo:"))
    .map((t) => {
      const [k, v] = t.value.split(":")
      return { label: k, value: v ?? "" }
    }),
]

// Below description:
{specRows.length > 0 && <SpecTable rows={specRows} title="Specificatii tehnice" />}
```

- [ ] **Step 15.2: Commit**

```bash
git add backend-storefront/src/modules/products/templates/
git commit -m "feat(design-system): add SpecTable to product detail page"
```

---

## Risk list

| Risk | Mitigation |
|------|------------|
| `@medusajs/ui-preset` overrides Tailwind colors for Medusa UI components | Ardmag components use CSS vars directly (`var(--brand-500)`), not Tailwind utility classes, so no conflict |
| Medusa backend offline during loop iterations | Health check at loop start; abort if 9000 unreachable |
| `oklch()` color values not supported in older Playwright | Use Playwright 1.40+; all modern browsers support oklch |
| ProductImage `stem` extraction fails if Wix thumbnail format changes | `extractStem()` returns `null` gracefully, shows placeholder |
| Category slugs differ from expected (`/categories/discuri-de-taiere`) | Query categories from Medusa, use actual `handle` values |
| `IBM_Plex_Sans` not found in `next/font/google` | Check exact export: it's `IBM_Plex_Sans` (underscore, not hyphen) in next/font |
| TypeScript strict errors on `product.tags` access | Always null-check with optional chaining `?.` |
| Mobile header: 3-layer header too tall on 375px | UtilBar hides on mobile (add `sm:hidden` on mobile, or collapse); MainBar searches becomes icon-only |
| `listProducts()` signature may differ | Read `src/lib/data/products.ts` before calling; match actual API |

---

## Open questions before proceeding

1. **Category handles** - The PromoBand and Hero hard-code category handles like `/categories/adezivi-si-solutii`. Do these match actual Medusa category handles? Verify with: `curl http://localhost:9000/store/product-categories | python3 -m json.tool | grep handle`

2. **SupplierStrip logos** - DS03 shows real logo images. Current plan uses text placeholders (`TENAX`, `TYROLIT`). Are there logo files in `resources/` or `backend-storefront/public/`? If yes, use them. If no, text placeholders are acceptable for iteration 1.

3. **Cart button integration** - The existing `CartButton` component in `src/modules/layout/components/cart-button/` has its own rendering. Should it be wrapped in the ardmag action button style, or does it handle its own display? Read `cart-button/index.tsx` before Task 5.

4. **Store/category page existing templates** - The task says "modify category template" but the template files may already have filtering/pagination logic. Must preserve that logic; only replace the product grid rendering.

5. **Product handle for ProductImage** - The `ProductImage` component takes `slug` (= product.handle) and `stem` (filename without extension). The stem extraction regex in tasks 8 and 9 assumes thumbnail URLs end with `/filename.ext`. Verify this against actual Medusa thumbnails from: `curl http://localhost:9000/store/products?limit=1 | python3 -m json.tool | grep thumbnail`

---

## Estimation

- **Iterations estimated:** 5-8 iterations
  - Iteration 1: Get all 15 tasks implemented (rough but functional)
  - Iteration 2-3: Fix UI/UX issues (mobile breakpoints, spacing errors, missing hover states)
  - Iteration 4-5: Fix consistency violations (hardcoded colors, component reuse)
  - Iteration 6-8: Final polish (typography precision, dark hero gradients, animation)

- **Complexity drivers:**
  - 3-layer header with responsive behavior (HIGH)
  - Dark footer with responsive grid collapse (MEDIUM)
  - Token coexistence with Medusa UI preset (MEDIUM)
  - ProductCard stem/slug extraction correctness (MEDIUM)

---

## Directories created

```
reports/
  iteration-1/       # Ready for iteration 1 outputs
    screenshots/     # Playwright screenshots (created by agent-2)
```
