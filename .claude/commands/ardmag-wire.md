# ardmag-wire — Orchestrator Faza 2: Wire-up componente la Medusa

Workflow atomic per area cu 7 gate-uri obligatorii: unit tests, log-clean, E2E Playwright, console, a11y, perf, visual review.

## Utilizare

```
/ardmag-wire --area <id>     # ex: --area B1 (homepage)
/ardmag-wire --next          # urmatorul area in ordinea A→E
/ardmag-wire --status        # progress N/14
```

## Ordinea areas (14 iteratii Faza A → E)

| # | Area ID | Descriere | Faza | Pagini afectate |
|---|---------|-----------|------|-----------------|
| 1 | A1 | Image URL rewrite (DB script) | A | — |
| 2 | A2 | Enrichment final run | A | — |
| 3 | A3 | Adapter library (9 adapters + Vitest) | A | — |
| 4 | A4 | SortOptions type fix | A | — |
| 5 | B1 | Homepage real data | B | (main)/page.tsx |
| 6 | B2 | Category route recreate | B | categories/[...category]/page.tsx |
| 7 | B3 | FilterSidebar wired (facets) | B | category |
| 8 | B4 | CategoryToolbar sort | B | category |
| 9 | B5 | Pagination server-side | B | category |
| 10 | C1 | PDP route recreate | C | products/[handle]/page.tsx |
| 11 | C2 | Variant selector live | C | PDP |
| 12 | C3 | Add to cart wired | C | PDP |
| 13 | D1-4 | Header live data | D | toate |
| 14 | E1-3 | Cleanup + final E2E | E | delete design-preview/ |

## Progress tracking

`reports/wire-up/PROGRESS.json`:
```json
{
  "started": "<data>",
  "totalAreas": 14,
  "completed": [],
  "failed": [],
  "current": "A1",
  "status": "running"
}
```

## Flow per area (executat de orchestrator)

```
PRE-FLIGHT (o data per sesiune):
  1. ardmag-server-up → :9000 + :8000 live
  2. ardmag-data-check → Medusa are date, pub key configurat
  3. ardmag-log-checker → zero erori existente
  4. Verifica deps: vitest, @axe-core/playwright, lighthouse in package.json

AREAS SPECIALE (A1, A2, A4 — fara gate-uri complete):
  A1: Ruleaza scripts/rewrite-image-urls.ts, verifica cu curl ca imagini locale
  A2: Ruleaza scripts/enrich-products.ts --apply, verifica tags pe produse
  A4: Fix import SortOptions in lib/data/products.ts, verifica compile
  Commit atomic, continua

AREAS CU TOATE GATE-URILE (A3, B1-5, C1-3, D, E):

  RETRY = 0

  LOOP (max 3 retry):

    [1] GATE 1 — Adapter unit tests (daca area include adapters noi)
        → ardmag-adapter-writer (adapter specificat)
        → daca FAIL: RETRY += 1, loop back

    [2] GATE 2 — Page wire-up + log-clean
        → ardmag-page-wirer (area, pagini, adapters disponibile)
        → ardmag-log-checker
        → daca ERRORS in log: RETRY += 1, loop back

    [3] GATE 3+4 — E2E + Console
        → ardmag-test-writer (area, pagini) — genereaza spec
        → ardmag-test-runner (area) — ruleaza Playwright
        → daca FAIL: RETRY += 1, loop back cu failure details

    [4] GATE 5 — A11y
        → ardmag-a11y-auditor (pagini afectate)
        → daca FAIL: RETRY += 1, loop back cu violation list
          Exceptie: daca violation necesita decizie design → STOP & ESCALATE

    [5] GATE 6 — Perf
        → ardmag-perf-auditor (pagini afectate)
        → daca FAIL: RETRY += 1, loop back
          Exceptie: daca fix necesita restructurare arhitecturala → STOP & ESCALATE

    → daca RETRY == 3 pe acelasi gate: STOP & ESCALATE

  [6] GATE 7 — Visual review (dupa toate celelalte PASS)
      → ardmag-visual-reviewer (area, pagini)
      → Prezinta gallery.md utilizatorului
      → Asteapta ACK / REJECT
      → daca REJECT: RETRY pe [2] cu feedback utilizator

  [7] ardmag-area-reporter (area, toate rapoartele)

  [8] Commit atomic:
      git add <fisierele area>
      git commit -m "feat(wire/<area>): <descriere>"
      Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>

  [9] Update PROGRESS.json: muta area din current → completed

  → Continua cu urmatorul area
```

## Politica STOP & ESCALATE

Dupa 3 retry consecutive FAIL pe acelasi gate, sau daca gate necesita decizie:

```
STOP — area <X> blocat la gate <N> dupa 3 incercari

Incercarea 1: <abordare> → FAIL (motiv: ...)
Incercarea 2: <abordare> → FAIL (motiv: ...)
Incercarea 3: <abordare> → FAIL (motiv: ...)

Diagnostic:
  reports/wire-up/<area>/<gate>-report.json
  Logs: <ultimele 30 linii>
  Coverage gap / test failure / violation / budget miss: <detalii>

Decizie necesara: <intrebare specifica>
```

## Gate-uri per area (ce gate-uri sunt obligatorii)

| Area | G1 unit | G2 log | G3+4 E2E | G5 a11y | G6 perf | G7 visual |
|------|---------|--------|-----------|---------|---------|-----------|
| A1 | — | ✓ | — | — | — | — |
| A2 | — | ✓ | — | — | — | — |
| A3 | ✓ | ✓ | — | — | — | — |
| A4 | — | ✓ | — | — | — | — |
| B1-5 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| C1-3 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| D | — | ✓ | ✓ | ✓ | — | ✓ |
| E | — | ✓ | ✓ | — | — | — |

## Niciodata nu marchez area ca done fara toate gate-urile aplicabile PASS.
