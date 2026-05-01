# Ziua 1 — Catalog complet (1 mai 2026)

**Goal:** 90+ produse cu preț corect, greutate populată pe toate variantele, produse noi importate cu poze, categorii moarte eliminate.

**Blocker principal:** XLS-urile de la Andrei trebuie puse în `docs/preturi/` înainte de pașii 1.1 și 1.2.

---

## 1.1 Procesare XLS-uri noi (BLOCAT pe utilizator)

Andrei a trimis 6 fișiere Excel în 5 emailuri (22-29 apr), fiecare cu sheet-uri pe categorii.
Utilizatorul le pune manual în `docs/preturi/`.

**Fișiere așteptate (din subiecte email):**
- "liste dec pret" (27 apr) — 2 fișiere
- "inca una" (27 apr) — 1 fișier
- "Liste de pret abrazivi" (28 apr) — 1 fișier
- "ultimele doua liste" (29 apr) — 2 fișiere

**Ce conțin:** prețuri corectate cu TVA inclus + greutăți cântărite manual (confirmat de Andrei 29 apr).

**Format confirmat anterior (din XLS-urile procesate):**
```
Sheet: [Categorie]
Col A: Denumire produs / mărime
Col B: Categorie / cantitate  
Col C: Preț RON cu TVA
Col D: Greutate (kg sau g)
```

---

## 1.2 Update prețuri din XLS-uri noi

**Fișier:** `scripts/update-prices-xls.ts` — extindere pentru:
- Citire din TOATE XLS-urile din `docs/preturi/` (nu doar 2 fișiere hardcodate)
- Extragere greutate din coloana D (sau echivalent)
- Generare SQL pentru `product_variant.weight` pe lângă `price.amount`

**Corecție specifică confirmată pe WhatsApp (30 apr):**
- `DISCURI MARMURĂ / 300 / NOU`: 447 RON → **477 RON**

**Target Railway DB** — via `railway connect Postgres` (din `backend/`).

**Verificare post-update:**
```sql
SELECT COUNT(*) FROM product_variant WHERE weight IS NULL AND deleted_at IS NULL;
-- target: 0 sau foarte aproape de 0
SELECT p.title, v.title, v.weight
FROM product_variant v JOIN product p ON v.product_id = p.id
WHERE v.weight IS NULL AND v.deleted_at IS NULL
ORDER BY p.title;
-- lista explicită a ce rămâne fără greutate
```

---

## 1.3 Import produse noi (22 produse)

### Grup A — SAIT (5 produse noi, ~30 variante)

Produse confirmate de Andrei (28 apr WhatsApp) + links imagini de pe sait-abrasives.co.uk:

| Produs | Variante | Imagine |
|---|---|---|
| SAITRON 125 | 5 granulații × BUC + CUTIE 10 = 10 | https://www.sait-abr.com/en/acclucidatura-sait/2982-45900-saitac-pad-vel.html |
| SAITRON 180 | 5 granulații × BUC + CUTIE 10 = 10 | idem |
| SAITRIS 180 | 4 granulații × BUC = 4 | https://www.sait-abrasives.co.uk/product-catalogue/2623-42331-sait-premium-saitris-sfc.html |
| EK WINNER (3 dimensiuni) | 115mm, 125mm, 230mm × BUC = 3 | https://www.sait-abrasives.co.uk/product-catalogue/70-42289-sait-ekwinner-dt-c30p.html |
| SUPORT VELCROPAD | 115mm, 125mm, 180mm × BUC = 3 | https://www.sait-abrasives.co.uk/product-catalogue/2769-42997-pad-vel-rotativa.html |

Notă Andrei: "Vad ca si ei or pus o singura poza pt toate 3 dimensiunile" — ok să folosim 1 poză per produs.

**Greutăți SAIT** — din XLS-urile lui Andrei (coloana D). Dacă lipsesc, Andrei a confirmat: divide greutatea cutiei la nr. bucăți și rotunjești în sus.

### Grup B — Soluții Delta (13 produse lipsă din DB, 2 volume fiecare)

Confirmate din dry-run scriptul de prețuri (sesiunea anterioară):
- HL50 (1L, 5L)
- Q-SHINE (1L, 5L)
- Q-PROTEK (1L, 5L)
- SAF SEAL (1L, 5L)
- TOTAL WET (1L, 5L)
- ECO DRY 10L
- RAPID COTTO (1L, 5L)
- REFLEX NERA 700gr
- REFLEX NEUTRA 700gr
- WALL WASH (1L, 5L)
- DERUX (1L, 5L)
- AX CLEANER 5L
- SABBIATORE AX/F 5L

**Imagini:** scraping de pe `ardmag.com` (Wix vechi) — produse există acolo.

### Grup C — Bundle deal (1 produs)

- **"Set adeziv profesional + decapant"** — 6kg (menționat de Andrei 29 apr)
- URL Wix: `https://www.ardmag.com/product-page/set-adeziv-profesional-decapant`
- Categorie nouă: "BUNDLE DEALS" / "PACHETE PROMOTIONALE" (creat în pasul 3.5 ziua 3, sau acum ca draft)
- Greutate: 6kg (confirmat)

**Script:** `scripts/import-missing-products.ts` (nou)

Flow:
1. Autentificare Railway Admin API (activat temporar, dezactivat după)
2. Per produs: creare `product` + `product_variant` + `price_set` + `product_variant_price_set` + `price` (RON)
3. Imagini: fetch URL → upload R2 via modulul `file-r2-variants` → asignare thumbnail/images
4. Categorii: asignare la categoria existentă corectă

---

## 1.4 Cleanup mese de tăiat

**Context:** Andrei a confirmat pe WhatsApp (29 apr): "Mesele de taiat trebuie sa le scoatem. Aparent s-o inchis fabrica."

**Acțiuni SQL directe (Railway `railway connect Postgres`):**

```sql
-- 1. Reasignare POMPĂ CU APĂ (prod_01KPH3QST4GGBMKVZS2DFG1SYP)
--    din categoria "MESE DE TĂIAT" la categoria "Accesorii" sau similară
--    (confirmă cu Andrei ce categorie — dacă nu răspunde, lasă fără categorie)

-- 2. Soft-delete produs MASĂ DE TĂIAT și variantele lui
UPDATE product SET deleted_at = NOW(), updated_at = NOW()
WHERE id = 'prod_01KPH3QT5R2Y6EF1SGMKZ5WC1M';

UPDATE product_variant SET deleted_at = NOW(), updated_at = NOW()
WHERE product_id = 'prod_01KPH3QT5R2Y6EF1SGMKZ5WC1M';

-- 3. Soft-delete categoria MESE DE TĂIAT
UPDATE product_category SET deleted_at = NOW(), updated_at = NOW()
WHERE id = 'pcat_01KPH3851NZYN18KMB5MVQG5JY';
```

---

## 1.5 Verificare finală ziua 1

```bash
# Număr produse după cleanup + import
echo "SELECT COUNT(*) as produse FROM product WHERE deleted_at IS NULL;" | railway connect Postgres

# Variante fără greutate
echo "SELECT COUNT(*) FROM product_variant WHERE weight IS NULL AND deleted_at IS NULL;" | railway connect Postgres

# Prețuri DISCURI MARMURA 300 NOU — trebuie 477 RON (47700 bani)
echo "SELECT p.amount FROM price p JOIN product_variant_price_set pvps ON p.price_set_id = pvps.price_set_id JOIN product_variant v ON pvps.variant_id = v.id WHERE v.title ILIKE '%300%' AND v.title ILIKE '%NOU%' AND v.product_id = 'prod_01KPH3QS2YNHWSA8JX304GNF0N';" | railway connect Postgres
# Expected: 47700

# Nu există nicio referință la mese de tăiat pe storefront
curl -s "https://ardmag.surmont.co/produse" | grep -i "masa de taiat" | wc -l
# Expected: 0

# Rebuild storefront (dacă produsele sunt cached)
systemctl --user restart ardmag-storefront.service
```

---

## Notițe implementare

- Prefer Admin API pentru import produse noi (vs SQL direct) — menține integritatea `price_set` și `product_variant_price_set`, care sunt complexe de creat manual.
- Temporar enable admin pe Railway (`DISABLE_MEDUSA_ADMIN=false`), rulează import, dezactivează.
- Dacă Railway Admin API tot e instabil, alternativa e SQL cu creare manuală a `price_set` + `product_variant_price_set`.
- Greutățile din XLS pot fi în grame (g) sau kilograme (kg) — normalizare la **grame** (Medusa stochează greutatea în grame în câmpul `weight`).
