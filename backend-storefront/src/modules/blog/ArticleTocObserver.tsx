"use client"

import { useEffect } from "react"

export function ArticleTocObserver({ headingIds }: { headingIds: string[] }) {
  useEffect(() => {
    if (!headingIds.length) return

    const setActive = () => {
      const y = window.scrollY + 120
      let cur = headingIds[0]
      for (const id of headingIds) {
        const el = document.getElementById(id)
        if (el && el.offsetTop <= y) cur = id
      }
      document.querySelectorAll(".toc li[data-id]").forEach((li) => {
        li.classList.toggle("on", li.getAttribute("data-id") === cur)
      })
    }

    window.addEventListener("scroll", setActive, { passive: true })
    setActive()
    return () => window.removeEventListener("scroll", setActive)
  }, [headingIds])

  return null
}
