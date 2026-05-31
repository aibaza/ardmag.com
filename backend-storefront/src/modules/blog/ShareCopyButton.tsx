"use client"

import { useState } from "react"
import { getPublicShareURL } from "@lib/util/env"

const ShareIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75">
    <circle cx="5" cy="8" r="1.75" />
    <circle cx="12" cy="3" r="1.75" />
    <circle cx="12" cy="13" r="1.75" />
    <path d="M6.7 7.3 10.3 4.7M6.7 8.7l3.6 2.6" />
  </svg>
)

export function ShareCopyButton({ variant = "full" }: { variant?: "icon" | "full" }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(getPublicShareURL(window.location.href)).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (variant === "icon") {
    return (
      <button className="icon-btn" onClick={handleCopy} aria-label="copiaza link" title={copied ? "Copiat!" : "Copiaza link"}>
        <ShareIcon />
      </button>
    )
  }

  return (
    <button onClick={handleCopy}>
      <ShareIcon />
      {copied ? "Copiat!" : "Copiaza link"}
    </button>
  )
}
