# ardmag-iterate

Workflow orchestrator pentru loop-ul iterativ de implementare design ardmag.com.

## Cum se folosește

```
/ardmag-iterate --page index|category|product [--iteration N]
```

- `--page`: pagina de implementat (`index`, `category`, `product`)
- `--iteration`: numărul iterației (opțional, default 1)

## Ce face

Rulează loop-ul complet [server-up] → [log-checker] → [html-porter] → [log-checker] → [visual-qa] → [report-writer] pentru pagina specificată. Max 5 iterații per pagină.

---

## Workflow

### Pasul 0 — Setup

Determine paths din `--page`:

| Page | Source HTML | Target TSX | QA Current URL | QA Target URL |
|------|-------------|------------|----------------|---------------|
| index | `resources/design2/index.html` | `backend-storefront/src/app/[countryCode]/(main)/page.tsx` | `http://localhost:8000/ro` | `http://localhost:7778/index.html` |
| category | `resources/design2/category.html` | `backend-storefront/src/app/[countryCode]/_design/category/page.tsx` | `http://localhost:8000/ro/_design/category` | `http://localhost:7778/category.html` |
| product | `resources/design2/product.html` | `backend-storefront/src/app/[countryCode]/_design/product/page.tsx` | `http://localhost:8000/ro/_design/product` | `http://localhost:7778/product.html` |

Project root: `/home/dc/Work/SurCod/client-projects/ardmag.com/`

### Pasul 1 — Server health

Invocă subagentul `ardmag-server-up`.

Dacă verdict `FAILED` → STOP. Raportează utilizatorului care server a eșuat și de ce.

### Pasul 2 — Log pre-check

Invocă subagentul `ardmag-log-checker`.

Dacă verdict `ERRORS` cu erori critice → STOP. Raportează erorile utilizatorului. Nu are sens să continui cu portul dacă există erori de compilare deja.

### Pasul 3 — HTML Porter

Invocă subagentul `ardmag-html-porter` cu:
- `SOURCE_HTML`: calea absolută a fișierului HTML sursă
- `TARGET_TSX`: calea absolută a fișierului TSX țintă

Dacă agentul raportează erori la scriere → STOP, raportează.

### Pasul 4 — Log post-porter

Invocă din nou `ardmag-log-checker`.

Dacă `ERRORS` → colectează erorile și trimite-le înapoi la `ardmag-html-porter` cu instrucțiunea de fix. Reintră la Pasul 3. Contorizează re-intrările (max 3 fix cycles per iterație).

### Pasul 5 — Visual QA

Invocă subagentul `ardmag-visual-qa` cu:
- `CURRENT_URL`: URL-ul paginii implementate
- `TARGET_URL`: URL-ul design-ului HTML sursă
- `PAGE_NAME`: numele paginii
- `ITERATION`: numărul iterației curent

### Pasul 6 — Raport

Invocă subagentul `ardmag-report-writer` cu output-urile din pașii anteriori.

### Pasul 7 — Verdict

**Dacă PASS:**
- Raportează utilizatorului: "✓ Page `{PAGE}` PASS — iteration {N}. Report: `docs/impl/iteration-{N}.md`"
- Sugerează comanda pentru pagina următoare

**Dacă FAIL:**
- Afișează lista diferențelor din visual QA
- Întreabă utilizatorul: "Iterez automat cu fix-urile de mai sus (max {remaining} iterații rămase), sau vrei să revizuiești manual?"
- Dacă utilizatorul confirmă: reintră la Pasul 3 cu lista de fix-uri ca context pentru ardmag-html-porter
- Dacă am ajuns la iterația 5 fără PASS → escalează la utilizator, oprește loop-ul

---

## Reguli orchestrator

- **NU pornești servere direct** — mereu prin ardmag-server-up
- **NU modifici cod direct** — mereu prin ardmag-html-porter
- **NU declari PASS fără confirmarea din visual-qa** — verdictul vine de la agent, nu e asumat
- **NU continui dacă lipsesc PNG-urile** — ardmag-visual-qa returnează FAIL automat, respectă acel FAIL
- **Contorizează iterațiile** — dacă ajungi la 5 fără PASS, escalează

---

## Exemplu de rulare reușită

```
> /ardmag-iterate --page index

[server-up] ✓ ALL_UP (backend:already_running, frontend:already_running, design:already_running)
[log-checker] ✓ CLEAN (no errors in any log)
[html-porter] Converting resources/design2/index.html → backend-storefront/src/app/.../page.tsx
  useState hooks: [menuOpen]
  Lines: 487 html → 512 tsx
[log-checker] ✓ CLEAN (compiled successfully)
[visual-qa] Capturing screenshots...
  ✓ 6/6 PNG files created
  VERDICT: FAIL — 3 diffs found
    [MOBILE] Hero CTA button missing
    [DESKTOP] Footer columns misaligned  
    [ALL] Font weight 600 vs 700 in headings

Iteration 1 FAIL. Proceed with auto-fix? (2/5 fix cycles remaining)
```
