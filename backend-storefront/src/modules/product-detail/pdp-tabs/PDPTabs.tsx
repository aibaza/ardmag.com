"use client"

import { ReactNode, useState, useId } from 'react'

interface PDPTab {
  label: string
  active?: boolean
}

interface PDPTabsProps {
  tabs: PDPTab[]
  children: ReactNode
}

export function PDPTabs({ tabs, children }: PDPTabsProps) {
  const baseId = useId()
  const [activeIdx, setActiveIdx] = useState(() => {
    const found = tabs.findIndex(t => t.active)
    return found >= 0 ? found : 0
  })

  function handleKeyDown(e: React.KeyboardEvent, i: number) {
    if (e.key === 'ArrowRight') setActiveIdx((i + 1) % tabs.length)
    if (e.key === 'ArrowLeft') setActiveIdx((i - 1 + tabs.length) % tabs.length)
  }

  return (
    <section className="pdp-content">
      <div className="tabs" role="tablist">
        {tabs.map((tab, i) => (
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
        {activeIdx === 0 ? children : null}
      </div>
    </section>
  )
}
