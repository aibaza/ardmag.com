"use client"

import { ReactNode, useState, useId } from 'react'

interface PDPTab {
  label: string
  content: ReactNode
}

interface PDPTabsProps {
  tabs: PDPTab[]
}

export function PDPTabs({ tabs }: PDPTabsProps) {
  const baseId = useId()
  // Filter out tabs cu content gol (null/undefined/empty)
  const activeTabs = tabs.filter((t) => t.content)
  const [activeIdx, setActiveIdx] = useState(0)

  if (activeTabs.length === 0) return null

  function handleKeyDown(e: React.KeyboardEvent, i: number) {
    if (e.key === 'ArrowRight') setActiveIdx((i + 1) % activeTabs.length)
    if (e.key === 'ArrowLeft') setActiveIdx((i - 1 + activeTabs.length) % activeTabs.length)
  }

  return (
    <section className="pdp-content">
      <div className="tabs" role="tablist">
        {activeTabs.map((tab, i) => (
          <button
            key={i}
            role="tab"
            id={`${baseId}-tab-${i}`}
            aria-controls={`${baseId}-panel-${i}`}
            aria-selected={activeIdx === i}
            tabIndex={activeIdx === i ? 0 : -1}
            className={activeIdx === i ? 'on' : undefined}
            onClick={() => setActiveIdx(i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        className="tab-panel"
        role="tabpanel"
        id={`${baseId}-panel-${activeIdx}`}
        aria-labelledby={`${baseId}-tab-${activeIdx}`}
      >
        {activeTabs[activeIdx].content}
      </div>
    </section>
  )
}
