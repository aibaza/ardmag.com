"use client"

import { useState } from "react"
import { FilterSidebar } from "@modules/category/filter-sidebar"
import { MobileFilterBar } from "@modules/category/mobile-filter-bar"
import type { FilterGroup } from "@lib/util/adapters/products-to-filter-groups"

interface ActiveFilter {
  label: string
  paramKey: "brand" | "material" | "price"
  value?: string
}

interface HelpCard {
  label: string
  description: string
  phone: string
  hours: string
}

interface CategoryLayoutClientProps {
  filterGroups: FilterGroup[]
  applyCount: number
  helpCard: HelpCard
  baseUrl: string
  activeCount: number
  sortOptions: string[]
  currentSort: string
  activeFilters: ActiveFilter[]
  children: React.ReactNode
}

export function CategoryLayoutClient({
  filterGroups,
  applyCount,
  helpCard,
  baseUrl,
  activeCount,
  sortOptions,
  currentSort,
  activeFilters,
  children,
}: CategoryLayoutClientProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="cat-layout">
      <FilterSidebar
        groups={filterGroups}
        applyCount={applyCount}
        helpCard={helpCard}
        baseUrl={baseUrl}
        isOpen={open}
        onClose={() => setOpen(false)}
      />
      <div className="cat-products">
        <MobileFilterBar
          activeCount={activeCount}
          sortOptions={sortOptions}
          currentSort={currentSort}
          baseUrl={baseUrl}
          activeFilters={activeFilters}
          onOpenFilters={() => setOpen(true)}
        />
        {children}
      </div>
    </div>
  )
}
