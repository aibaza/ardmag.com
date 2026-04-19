# ardmag-extract — Orchestrator Faza 1: Extractie componente

Workflow atomic pentru extragerea unei componente din paginile monolitice cu zero toleranta pixel si zero erori.

## Utilizare

```
/ardmag-extract --component <NumeComponenta>
/ardmag-extract --next
/ardmag-extract --status
```

## Ordinea de extractie (26 componente, Faza A → E)

| # | Componenta | Faza | Pagini afectate |
|---|------------|------|-----------------|
| 01 | Badge | A | index,category,product |
| 02 | Button | A | index,category,product |
| 03 | ProductCardSpecTag | A | category |
| 04 | StarRating | A | product |
| 05 | QuantityStepper | A | product |
| 06 | TrustItem | A | index,category,product |
| 07 | SectionHead | B | index,product |
| 08 | Breadcrumb | B | category,product |
| 09 | ProductCard | B | index,category,product |
| 10 | TrustBanner | B | index,category,product |
| 11 | Hero | C | index |
| 12 | QuickCategories | C | index |
| 13 | SupplierStrip | C | index |
| 14 | CategoryHero | C | category |
| 15 | Pagination | C | category |
| 16 | CategoryToolbar | C | category |
| 17 | MobileFilterBar | C | category |
| 18 | FilterSidebar | C | category |
| 19 | ProductGrid | C | index,category,product |
| 20 | PDPGallery | D | product |
| 21 | PDPVariantSelector | D | product |
| 22 | PDPPriceCard | D | product |
| 23 | PDPSummary | D | product |
| 24 | PDPTabs | D | product |
| 25 | SiteFooter | E | index,category,product |
| 26 | SiteHeader | E | index,category,product |

## Referinta structura modules

```
src/modules/
├── @shared/components/
│   ├── badge/
│   ├── button/
│   ├── product-card-spec-tag/
│   ├── star-rating/
│   ├── quantity-stepper/
│   ├── trust-item/
│   ├── section-head/
│   └── breadcrumb/
├── layout/
│   ├── site-header/
│   └── site-footer/
├── products/
│   ├── product-card/
│   └── product-grid/
├── sections/
│   ├── trust-banner/
│   ├── hero/
│   ├── quick-categories/
│   └── supplier-strip/
├── category/
│   ├── category-hero/
│   ├── filter-sidebar/
│   ├── mobile-filter-bar/
│   ├── category-toolbar/
│   └── pagination/
└── product-detail/
    ├── pdp-gallery/
    ├── pdp-variant-selector/
    ├── pdp-price-card/
    ├── pdp-summary/
    └── pdp-tabs/
```

## Flow per componenta (executat de orchestrator)

```
PRE-FLIGHT (o data per sesiune):
  1. ardmag-server-up → confirm :8000/:9000/:7778 live
  2. ardmag-log-checker → confirm zero erori existente
  3. Confirm pixelmatch instalat in backend-storefront/

PER COMPONENTA:
  RETRY = 0
  
  [0] ardmag-baseline-capture (COMPONENT, PAGES)
      → FAIL automat daca lipsesc PNG-uri sau < 10KB
  
  LOOP (max 3 retry):
    [1] ardmag-component-extractor (COMPONENT, PAGES, retry_context)
    
    [2] ardmag-log-checker
        → daca ERRORS: RETRY += 1, loop back cu error list
    
    [3] ardmag-pixel-diff (COMPONENT, PAGES)
        → daca FAIL (diffPixels > 0): RETRY += 1, loop back cu diff info
    
    [4] ardmag-console-check (node scripts/console-check.mjs)
        → daca FAIL (errors/warnings): RETRY += 1, loop back
    
    → daca PASS pe [2]+[3]+[4]: EXIT LOOP
    
    → daca RETRY == 3: STOP & ESCALATE
  
  [5] ardmag-component-reporter (COMPONENT, PAGES, diff data, decisions)
  
  [6] git commit atomic:
      git add src/modules/<path>/ backend-storefront/src/app/...
      git commit -m "refactor(NN): extract <Component>"
```

## Politica STOP & ESCALATE

Dupa 3 retry consecutive FAIL pe aceeasi componenta, orchestratorul OPRESTE si raporteaza in chat:

```
STOP — extractia <Component> blocata dupa 3 incercari

Incercarea 1: <abordare> → FAIL (motiv: ...)
Incercarea 2: <abordare> → FAIL (motiv: ...)
Incercarea 3: <abordare> → FAIL (motiv: ...)

Diff vizuale: reports/extract/<component>/diff/*.png
Log snippets: <ultimele 30 linii relevante>

Decizia/input necesar: <ce intrebare am>
```

**Niciodata nu marcam o componenta ca done cu diff > 0 sau erori.**

## Sursa de adevar pentru props interfaces

`docs/impl/component-extraction-analysis.md` — Sectiunea 2 (Props Interfaces)

Citeste OBLIGATORIU inainte de fiecare extractie.
