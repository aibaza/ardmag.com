# Design Review Loop -- Plan

## Status: AWAITING CONFIRMATION

---

## 1. Setup Confirmation

### Playwright

- `npx playwright` v1.59.1 available globally (no pnpm needed)
- `@playwright/test` and `js-yaml` NOT installed in `backend-storefront/` yet
- **Action required before iteration 1:**
  ```bash
  cd backend-storefront
  npm install -D @playwright/test js-yaml @types/js-yaml
  npx playwright install chromium
  ```

### Services

- Medusa backend: `http://localhost:9000` (start with `cd backend && npm run dev`)
- Next.js storefront: `http://localhost:8000` (start with `cd backend-storefront && npm run dev`)
- Health check before each iteration:
  ```bash
  curl -sf http://localhost:9000/health > /dev/null || { echo "Medusa DOWN"; exit 1; }
  curl -sf http://localhost:8000 > /dev/null || { echo "Storefront DOWN"; exit 1; }
  ```

### Design Files Location

Spec references `resources/design/ardmag_com/` but actual path is `resources/design/`. scope.yaml updated accordingly.

---

## 2. Scope

Source of truth: `reports/design-review/scope.yaml`

### Pages (7)

| # | Name | URL | Target Design File |
|---|------|-----|--------------------|
| 1 | homepage | /ro | Design System 04 - Chrome & Homepage.html |
| 2 | category-small | /ro/categorii/mese-de-taiat | Design System 03 - Commerce Components.html |
| 3 | category-medium | /ro/categorii/discuri-de-taiere | Design System 03 - Commerce Components.html |
| 4 | category-large | /ro/categorii/solutii-pentru-piatra | Design System 03 - Commerce Components.html |
| 5 | product-rich | /ro/produse/glaxs-easy | Design System 03 - Commerce Components.html |
| 6 | product-bundle | /ro/produse/set-adeziv-profesional-decapant | Design System 03 - Commerce Components.html |
| 7 | product-variations | /ro/produse/discuri-orizontale-de-marmura-si-andezit | Design System 03 - Commerce Components.html |

### Viewports (3)

| Priority | Name | Device |
|----------|------|--------|
| 1 | mobile | iPhone SE (375x667) |
| 2 | tablet | iPad Mini (768x1024) |
| 3 | desktop | 1440x900 |

Total tests per iteration: 7 pages x 3 viewports = **21 screenshot pairs**

---

## 3. Files Created

```
reports/design-review/
  scope.yaml                          -- single source of truth for pages/viewports

backend-storefront/tests/design-review/
  playwright.config.ts                -- 3 viewport projects, screenshots on, workers=1
  _helpers.ts                         -- loadScope() + screenshotPath() helpers
  capture-current.spec.ts             -- screenshots of running storefront
  capture-target.spec.ts              -- screenshots of design HTML files
```

### Iteration directory structure (created at runtime)

```
reports/design-review/
  iteration-N/
    screenshots/
      current/   -- {page}-{viewport}.png from storefront
      target/    -- {page}-{viewport}.png from design HTML
    diffs/       -- side-by-side (manual or tooling)
    reports/     -- {page}-{viewport}.md from vision comparison
  iteration-N/visual-review-summary.md
  iteration-N/fix-log.md
  iteration-N/validation-passed.md OR validation-failed.md
  FINAL-REPORT.md
  playwright-report/                  -- HTML report from Playwright
```

---

## 4. Loop Architecture

```
Iteration N:
  Phase 1 (Visual Review)
    1.1 -- Generate scripts from scope.yaml [already done -- static scripts]
    1.2 -- Run capture-target.spec.ts + capture-current.spec.ts via npx
    1.3 -- Compare pairs with vision API per criteria matrix
    1.4 -- Copy integrity check via OCR
    1.5 -- Save per-page reports + visual-review-summary.md

  Phase 2 (Fix Implementation)
    -- Read visual-review-summary.md
    -- Apply BLOCKER + MAJOR fixes (minimal, no rewrites)
    -- pnpm lint + pnpm tsc --noEmit
    -- Commit: fix(design-review): iteration N - <summary>

  Phase 3 (Validation)
    -- Re-run Phase 1
    -- All PASS -> changelog + commit -> STOP
    -- NEEDS_WORK -> stagnation check -> iteration N+1
```

### Stop conditions

| Condition | Action |
|-----------|--------|
| All 21 tests PASS | Changelog + commit + STOP |
| Same issues for 3 iterations | FATAL-ERROR + escalation report |
| Iteration 15 reached | Safety brake + FINAL-REPORT.md |

---

## 5. Criteria Matrix (for vision comparison)

### BLOCKER (fail immediately)
- Primary orange `oklch(64% 0.202 42)` on CTA buttons
- IBM Plex Sans + IBM Plex Mono present
- ardmag logo in header/footer
- Tagline "25 DE ANI. LA MILIMETRU." on homepage hero
- Copy violations from CLAUDE.md (invented claims, em dashes, corporate speak)

### MAJOR (block PASS)
- Spacing density on tables and card padding
- Border radius: 2px default (not rounded-xl)
- Shadows: minimal, borders preferred
- Specs above-the-fold on PDP
- Header: 3 layers (utility + main + cat-nav)
- Footer: 5 columns
- Mobile drawer functional
- Supplier logos present (mono placeholders OK)
- Category filters: DIAMETRU + TIP PIATRA priority on DISCURI

### MINOR (report only)
- Pixel alignment
- Micro-spacing < 4px

---

## 6. Estimated Timeline

| Item | Estimate |
|------|----------|
| Phase 1 per iteration (21 captures + vision) | ~8-12 min |
| Phase 2 per iteration (fix application) | ~15-30 min depending on issues |
| Phase 3 per iteration (re-capture + validate) | ~8-12 min |
| **Total per iteration** | **~30-55 min** |
| Expected iterations (based on current design state) | 3-6 |
| **Projected total** | **2-5 hours** |

---

## 7. Risk List

| Risk | Severity | Mitigation |
|------|----------|------------|
| URL slugs don't match Medusa handles | HIGH | Verify slugs against Medusa admin before iteration 1 |
| Storefront crashes during capture (404, error page) | HIGH | Check page load state before screenshot; flag as NEEDS_WORK |
| Design HTML files don't open correctly in Playwright (relative asset paths) | MEDIUM | Test file:// loading manually before iteration 1 |
| Vision API rate limits on 42 image pairs | MEDIUM | Sequential processing; 1 iteration at a time |
| Screenshots too large (fullPage on long category pages) | LOW | Cap at 5000px height if needed via page.evaluate |
| `js-yaml` types conflict with existing TS config | LOW | `@types/js-yaml` resolves this |

---

## 8. Open Questions

1. **URL slug verification** -- Do the 7 product/category URLs in scope.yaml match the actual Medusa handles in the database? Need to verify with `cd backend && npm run dev` + check admin or API.

2. **Homepage route** -- Is `/ro` the correct homepage URL or should it be `/` with auto-redirect? The `NEXT_PUBLIC_DEFAULT_REGION=ro` suggests `/ro` is correct.

3. **Design HTML rendering** -- The target HTML files in `resources/design/` may reference fonts/assets via relative paths that don't load correctly under `file://`. Should we serve them via a local HTTP server instead?

4. **Vision API access** -- The loop requires Claude vision (Read tool on screenshot PNG files). This works natively in Claude Code. Confirmed approach: Claude reads PNG file paths directly with the Read tool.

5. **Priority mobile rule** -- The spec says skip tablet/desktop for a page if mobile fails. Should this be hard-enforced (skip capture entirely) or soft (capture all but mark as lower priority)? Recommendation: soft -- capture all, but report mobile failures as blocking per page.

---

## 9. How to Start Iteration 1

After confirming this plan:

```bash
# Step 1: Install dependencies
cd backend-storefront
npm install -D @playwright/test js-yaml @types/js-yaml
npx playwright install chromium

# Step 2: Verify services are running
curl -sf http://localhost:9000/health && echo "Medusa OK"
curl -sf http://localhost:8000 && echo "Storefront OK"

# Step 3: Tell Claude to start
# "Confirmed -- start iteration 1 of the design review loop"
```

Claude will then run Phase 1 captures, compare with vision, report issues, apply fixes, validate, and continue until PASS or stop condition.
