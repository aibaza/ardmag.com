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

function isOnSlowConnection(): boolean {
  const conn = (navigator as any).connection
  if (!conn) return false
  if (conn.saveData) return true
  return conn.effectiveType === "slow-2g" || conn.effectiveType === "2g"
}

export function FastNav() {
  const router = useRouter()

  useEffect(() => {
    const prefetched = new Set<string>()
    let pendingAnchor: HTMLAnchorElement | null = null

    function doPrefetch(href: string, priority: "low" | "high" = "low") {
      if (prefetched.has(href) || isOnSlowConnection()) return
      prefetched.add(href)
      router.prefetch(href)
      fetch(href, {
        headers: { "Purpose": "prefetch", "Sec-Purpose": "prefetch" },
        // @ts-ignore
        priority,
      }).catch(() => {})
    }

    // --- mouseover: prefetch la hover ---
    const onMouseOver = (e: MouseEvent) => {
      const a = findAnchor(e.target)
      if (!a || !isEligibleForPrefetch(a)) return
      doPrefetch(a.getAttribute("href")!)
    }

    // --- mousedown: notează linkul + warm-up agresiv dacă n-a prins hover ---
    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      if (e.defaultPrevented) return
      const a = findAnchor(e.target)
      if (!a || !isEligibleForFastActivate(a)) return
      e.preventDefault()
      pendingAnchor = a
      doPrefetch(a.getAttribute("href")!, "high")
    }

    // --- mouseup: navighează dacă mouseup e pe același link ca mousedown ---
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

    // --- IntersectionObserver: prefetch linkuri vizibile în viewport ---
    // Cardurile de produs folosesc <a href> simplu (nu <Link>), deci Next.js
    // nu le prefetch-uieste automat. IO-ul compensează asta.
    let io: IntersectionObserver | null = null

    function observeAnchor(a: Element) {
      if (!(a instanceof HTMLAnchorElement)) return
      if (!isEligibleForPrefetch(a)) return
      io?.observe(a)
    }

    function setupIO() {
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue
            const a = entry.target as HTMLAnchorElement
            const href = a.getAttribute("href")!
            doPrefetch(href, "low")
            io?.unobserve(a)
          }
        },
        { rootMargin: "0px 0px 300px 0px" }  // 300px înainte de intrare în viewport
      )

      document.querySelectorAll("a[href^='/']").forEach(observeAnchor)

      // MutationObserver: prinde linkuri adăugate dinamic (ex: grile paginate)
      const mo = new MutationObserver((mutations) => {
        for (const m of mutations) {
          m.addedNodes.forEach((node) => {
            if (node instanceof Element) {
              if (node.tagName === "A") { observeAnchor(node); return }
              node.querySelectorAll("a[href^='/']").forEach(observeAnchor)
            }
          })
        }
      })
      mo.observe(document.body, { childList: true, subtree: true })

      return () => {
        io?.disconnect()
        mo.disconnect()
      }
    }

    // requestIdleCallback: nu bloca main thread-ul la mount
    let cleanupIO: (() => void) | null = null
    const idleHandle = typeof requestIdleCallback !== "undefined"
      ? requestIdleCallback(() => { cleanupIO = setupIO() }, { timeout: 2000 })
      : setTimeout(() => { cleanupIO = setupIO() }, 200)

    return () => {
      document.removeEventListener("mouseover", onMouseOver)
      document.removeEventListener("mousedown", onMouseDown)
      document.removeEventListener("mouseup", onMouseUp)
      if (typeof requestIdleCallback !== "undefined") cancelIdleCallback(idleHandle as number)
      else clearTimeout(idleHandle as ReturnType<typeof setTimeout>)
      cleanupIO?.()
    }
  }, [router])

  return null
}
