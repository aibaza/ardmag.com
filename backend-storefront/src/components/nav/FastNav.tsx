"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

const SKIP_CLASSES = ["btn", "action-btn", "icon-btn", "zoom"]

function findAnchor(target: EventTarget | null): HTMLAnchorElement | null {
  if (!(target instanceof Element)) return null
  return target.closest("a")
}

function isInternalHref(href: string | null): href is string {
  if (!href) return false
  return href.startsWith("/") && !href.startsWith("/api/") && !href.startsWith("/_next/")
}

function isEligibleForPrefetch(a: HTMLAnchorElement): boolean {
  if (a.target === "_blank") return false
  if (a.hasAttribute("download")) return false
  if ((a.getAttribute("rel") ?? "").includes("external")) return false
  return isInternalHref(a.getAttribute("href"))
}

function isEligibleForFastActivate(a: HTMLAnchorElement): boolean {
  if (!isEligibleForPrefetch(a)) return false
  if (a.hasAttribute("data-no-fast-nav")) return false
  return !SKIP_CLASSES.some((cls) => a.classList.contains(cls))
}

export function FastNav() {
  const router = useRouter()

  useEffect(() => {
    const prefetched = new Set<string>()

    const onMouseOver = (e: MouseEvent) => {
      const a = findAnchor(e.target)
      if (!a || !isEligibleForPrefetch(a)) return
      const href = a.getAttribute("href")!
      if (prefetched.has(href)) return
      prefetched.add(href)
      router.prefetch(href)
      fetch(href, {
        headers: { "Purpose": "prefetch", "Sec-Purpose": "prefetch" },
        // @ts-ignore
        priority: "low",
      }).catch(() => {})
    }

    let pendingAnchor: HTMLAnchorElement | null = null

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      if (e.defaultPrevented) return
      const a = findAnchor(e.target)
      if (!a || !isEligibleForFastActivate(a)) return
      e.preventDefault()
      pendingAnchor = a
    }

    const onMouseUp = (e: MouseEvent) => {
      if (e.button !== 0) return
      const pressed = pendingAnchor
      pendingAnchor = null
      if (!pressed) return
      if (findAnchor(e.target) !== pressed) return
      const href = pressed.getAttribute("href")!
      const fallback = setTimeout(() => { window.location.href = href }, 2000)
      const prevUrl = window.location.href
      router.push(href)
      requestAnimationFrame(function check() {
        if (window.location.href !== prevUrl) { clearTimeout(fallback); return }
        requestAnimationFrame(check)
      })
    }

    document.addEventListener("mouseover", onMouseOver, { passive: true })
    document.addEventListener("mousedown", onMouseDown)
    document.addEventListener("mouseup", onMouseUp)
    return () => {
      document.removeEventListener("mouseover", onMouseOver)
      document.removeEventListener("mousedown", onMouseDown)
      document.removeEventListener("mouseup", onMouseUp)
    }
  }, [router])

  return null
}
