"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

const SunIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
)

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

const SystemIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>
)

const THEMES = ["system", "light", "dark"] as const
type Theme = typeof THEMES[number]

const ICONS: Record<Theme, React.FC> = {
  system: SystemIcon,
  light: SunIcon,
  dark: MoonIcon,
}

const LABELS: Record<Theme, string> = {
  system: "Tema sistem",
  light: "Tema luminoasa",
  dark: "Tema intunecata",
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <button className={`theme-toggle ${className ?? ""}`.trim()} aria-label="Schimba tema" />
  }

  const current = (theme as Theme) ?? "system"
  const next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length]
  const Icon = ICONS[current]

  return (
    <button
      className={`theme-toggle ${className ?? ""}`.trim()}
      onClick={() => setTheme(next)}
      aria-label={`${LABELS[current]} — apasa pentru ${LABELS[next]}`}
      title={LABELS[current]}
    >
      <Icon />
    </button>
  )
}
