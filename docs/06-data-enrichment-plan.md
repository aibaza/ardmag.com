# 06 - Plan de Îmbogățire Date de Produs

**Sursă:** `resources/Wix Products Catalog.csv` (2269 linii, 90 produse, 775 variante active)
**Data analizei:** 2026-04-19
**Scop:** Extragere și populare câmpuri goale în Medusa v2 din datele existente în CSV

---

## 1. Inventar de date disponibile

### 1.1 Câmpuri relevante — populare numerică

| Câmp CSV | Populat | Gol | Observație |
|----------|---------|-----|------------|
| `description` | 66/90 | 24/90 | 1 produs are doar `<p>&nbsp;</p>` (CERAMASTER 3 STEP) — efectiv 65 utile |
| `brand` | 0/90 | 90/90 | Câmpul este complet gol în export Wix |
| `additionalInfoTitle1` | 3/90 | 87/90 | Toate 3 conțin "PREȚ PROMOȚIONAL" |
| `additionalInfoDescription1` | 3/90 | 87/90 | Text promo reduceri volum |
| `additionalInfoTitle2-6` | 0/90 | 90/90 | Neutilizate |
| `collection` | 82/90 | 8/90 | 8 produse fără colecție atribuită |
| `ribbon` | 13/90 | 77/90 | Toate 13 au valoarea "PROMO 30%" |
| `productOptionName1` | 61/90 | 29/90 | Deja importate ca opțiuni Medusa |

### 1.2 Calitatea descrierilor

**65 descrieri utile** au structură HTML consistentă cu secțiuni recognoscibile:
- Titlu produs (uneori și denumirea italiană/de brand)
- Paragraf introductiv (ce este produsul)
- `PENTRU` — materialele țintă (Piatră naturală, Cuarț, Granit, Marmură, etc.)
- `PLUS` — lista de beneficii (ul > li)
- `CARACTERISTICI TEHNICE` — specificații numerice (ul > li cu valori)

**25 produse fără descriere utilizabilă** (24 complet goale + 1 whitespace):
```
Fără descriere (necesită input manual):
MASTIC SEMISOLID, DISCHETE DE ȘLEFUIT DIAMANTATE, ÎNTĂRITOR MASTIC,
DISCURI SPECIALE, DISCURI DE ANDEZIT, DISCURI DE GRANIT,
DISCURI ORIZONTALE DE MARMURĂ ȘI ANDEZIT, DISCURI MARMURĂ,
POMPĂ CU APĂ, MASĂ DE TĂIAT, SUPORT FRANKFURT, CREION, BATON,
MATERIAL DEZANCRASANT, ABRAZIVI ANELLI, ABRAZIVI TANGENȚIALI,
BURGHIU, PAD CAUCIUC, CAROTE DIAMANTATE, ABRAZIVI OALĂ,
ÎNTREȚINERE ȘI CERURI, DETERGENȚI ACIZI, DETERGENȚI,
TRATAMENTE SPECIFICE, CERAMASTER 3 STEP
```

### 1.3 Additional Info (3 produse)

Conținut exclusiv promoțional — reduceri la volum:
- **ABRAZIVI OALĂ** — 20% reducere la 5 bucăți
- **DISCURI DE ȘLEFUIT CU CARBURĂ** — 10% la 10 buc, 35-40% la 50 buc
- **DISCHETE DE ȘLEFUIT CU CARBURĂ** — 35-40% la 50 buc, 45% la 400 buc

### 1.4 Specificații tehnice în descrieri (extractabile prin regex)

Prezente în produsele din colecția MASTICI TENAX și câteva soluții:
- `Timp de gel (25°C)` — 18+ produse
- `Timp de lucru (25°C)`
- `Raport de amestec`
- `Fără lipire la suprafață`
- `pH` / `concentrat` — în detergenți și soluții
- `Viteză periferică max` — în discuri

---

## 2. Mapping propus câmp cu câmp

### 2.1 `description` (HTML) → Medusa `description`

**Decizie: păstrăm HTML ca atare.**

Medusa v2 stochează `description` ca string și storefront-ul Next.js îl poate randa cu `dangerouslySetInnerHTML`. Conversia la Markdown ar pierde structura `ul > li` și elementele `strong/em`. Overhead zero, fidelitate maximă.

```
CSV description (HTML) → products[].description (HTML string)
```

**Excepții:** 25 produse fără descriere rămân cu `description: null` și sunt marcate în secțiunea 4.

### 2.2 `additionalInfoTitle1/Description1` → `metadata.promo_bulk`

Cele 3 produse cu informații promo la volum. Nu merită un câmp nou în Medusa — se stochează ca metadata.

```
metadata: {
  promo_bulk: "<p>La achiziționarea a 10 BUCĂȚI se aplică o reducere de 10%...</p>"
}
```

Alternativă: append la `description` ca secțiune `<strong>PREȚURI VOLUM</strong>`. Recomand **metadata** pentru a nu polua descrierea vizibilă cu detalii comerciale care se pot schimba independent.

### 2.3 `brand` (gol) → Medusa Tag `brand:*`

Câmpul `brand` din Wix este gol pe toate cele 90 produse. Brandul se poate deduce parțial din:

| Sursă de inferență | Produse acoperite | Taguri generate |
|--------------------|-------------------|-----------------|
| Colecție "MASTICI TENAX" | 20 | `brand:tenax` |
| Mențiune explicită "SAIT" în descriere | 5 | `brand:sait` |
| Mențiune "Woosuk" în descriere | 2 | `brand:woosuk` |
| Mențiune "Delta Research" în descriere | 1 | `brand:delta-research` |
| **Total auto-detectabil** | **28/90** | |
| **Fără brand detectabil** | **62/90** | necesită cercetare manuală |

**Notă:** Produsele din MASTICI TENAX (GLAXS, GRAVITY, FIXTOP, ELIOX, DOMO etc.) sunt toate Tenax, dar nu menționează explicit brandul în descriere — sunt detectate prin colecție. Produsele din alte colecții (SOLUȚII PENTRU PIATRĂ, DIVERSE, DISCURI etc.) nu au brand detectabil automat.

### 2.4 `ribbon` → Medusa Tag `promo-30`

13 produse au `ribbon = "PROMO 30%"`. Se mapează la un tag Medusa `promo-30` pentru filtrare în storefront.

```
ribbon = "PROMO 30%" → tags: ["promo-30"]
```

### 2.5 `collection` → Tag uz `uz:*` (derivat)

Colecțiile existente se mapează direct la taguri de utilizare:

| Colecție Wix | Tag uz propus | Produse |
|--------------|---------------|---------|
| MASTICI TENAX | `uz:lipire-chituire` | 20 |
| SOLUȚII PENTRU PIATRĂ | `uz:tratament-suprafete` | 27 |
| ȘLEFUIRE PIATRĂ | `uz:slefuire-polisare` | 8 |
| DISCURI DE TĂIERE | `uz:taiere` | 7 |
| ABRAZIVI ȘI PERII | `uz:slefuire-polisare` | 3 |
| ABRAZIVI OALĂ | `uz:slefuire-polisare` | 1 |
| MESE DE TĂIAT | `uz:utilaje` | 2 |
| DIVERSE | `uz:diverse` | 13 |
| PACHETE PROMOȚIONALE | `uz:promotii` | 1 |
| Fără colecție | manual | 8 |

### 2.6 Taguri materiale (din descrieri + opțiuni)

Detectate prin keyword search în `description` + `productOptionDescription*`:

| Tag material | Produse detectate |
|--------------|-------------------|
| `material:marmura` | 22 |
| `material:granit` | 18 |
| `material:cuart` | 25 |
| `material:ceramica` | 19 |
| `material:piatra-naturala` | 17 |
| `material:travertin` | 8 |
| `material:andezit` | 6 |

Un produs poate avea mai multe taguri material (ex: un mastic poate fi bun pentru marmură + cuarț).

---

## 3. Exemple before/after

### Exemplu A — Descriere bogată: MASTIC LICHID

**CSV (sursă):**
```
name: MASTIC LICHID
collection: MASTICI TENAX
brand: (gol)
ribbon: (gol)
description: <p><strong>MASTIC POLIESTER LICHID COLORAT</strong></p>
  <p>Mastic poliester lichid colorat, cu aderență ridicată și reactivitate excelentă
  chiar și la temperaturi scăzute...</p>
  <p><strong>PENTRU</strong> - Piatră naturală, Cuarț</p>
  <p><strong>PLUS</strong></p><ul><li>Lipire puternică și rapidă</li>...</ul>
  <p><strong>CARACTERISTICI TEHNICE</strong></p>
  <ul><li>Timp de gel (25°C): 3 - 4 min</li>...</ul>
```

**Medusa după îmbogățire:**
```
description: (HTML complet - păstrat ca atare)
tags: ["brand:tenax", "uz:lipire-chituire", "material:cuart", "material:piatra-naturala"]
metadata: {}
```

**Ce rămâne gol:** brand înregistrat numai ca tag derivat din colecție, nu câmp structurat.

---

### Exemplu B — Descriere minimă: CERAMASTER 3 STEP

**CSV (sursă):**
```
name: CERAMASTER 3 STEP
collection: ȘLEFUIRE PIATRĂ
brand: (gol)
description: <p>&nbsp;</p>  ← efectiv gol
productOptionName1: DIMENSIUNE → K100
productOptionName2: GRANULAȚIE → STEP 0; STEP 1; STEP 2; STEP 3
```

**Medusa după îmbogățire:**
```
description: null  ← nu se suprascrie cu whitespace
tags: ["uz:slefuire-polisare", "material:ceramica"]  ← din nume + colecție
metadata: {}
```

**Ce rămâne gol:** description (necesită input manual), brand.

---

### Exemplu C — Fără descriere + promo: MASTIC SEMISOLID

**CSV (sursă):**
```
name: MASTIC SEMISOLID
collection: MASTICI TENAX
ribbon: PROMO 30%
brand: (gol)
description: (gol)
options: CULOARE (ALB; BEJ; JURA), CANTITATE (18 LITRI)
```

**Medusa după îmbogățire:**
```
description: null  ← necesită input manual
tags: ["brand:tenax", "uz:lipire-chituire", "promo-30"]
metadata: {}
```

**Ce rămâne gol:** description — varianta semisolidă a masticului Tenax, Cristian poate adapta descrierea de la MASTIC LICHID sau MASTIC SOLID care au descrieri complete.

---

## 4. Produse problematice — necesită intervenție manuală

### 4.1 Fără descriere (25 produse)

Necesită scriere description de la zero sau de la Cristian:

| Produs | Colecție | Observație |
|--------|----------|------------|
| MASTIC SEMISOLID | MASTICI TENAX | Are variante promo 30% — prioritate |
| DISCHETE DE ȘLEFUIT DIAMANTATE | (lipsă colecție?) | - |
| ÎNTĂRITOR MASTIC | MASTICI TENAX | Produs accesoriu |
| DISCURI SPECIALE | DIVERSE | Categorie vagă |
| DISCURI DE ANDEZIT | DIVERSE | - |
| DISCURI DE GRANIT | DIVERSE | - |
| DISCURI ORIZONTALE DE MARMURĂ ȘI ANDEZIT | DIVERSE | - |
| DISCURI MARMURĂ | DIVERSE | - |
| POMPĂ CU APĂ | DIVERSE | - |
| MASĂ DE TĂIAT | MESE DE TĂIAT | - |
| SUPORT FRANKFURT | DIVERSE | - |
| CREION | DIVERSE | - |
| BATON | DIVERSE | - |
| MATERIAL DEZANCRASANT | DIVERSE | - |
| ABRAZIVI ANELLI | DIVERSE | - |
| ABRAZIVI TANGENȚIALI | DIVERSE | - |
| BURGHIU | DIVERSE | - |
| PAD CAUCIUC | DIVERSE | - |
| CAROTE DIAMANTATE | (fără colecție) | - |
| ABRAZIVI OALĂ | ABRAZIVI OALĂ | Are promo bulk în additionalInfo |
| ÎNTREȚINERE ȘI CERURI | (fără colecție) | - |
| DETERGENȚI ACIZI | (fără colecție) | - |
| DETERGENȚI | (fără colecție) | - |
| TRATAMENTE SPECIFICE | (fără colecție) | - |
| CERAMASTER 3 STEP | ȘLEFUIRE PIATRĂ | Are doar whitespace HTML |

### 4.2 Fără colecție (8 produse — necesită tag uz manual)

```
CAROTE DIAMANTATE
DISC DE ȘLEFUIRE CONCAV
ÎNTREȚINERE ȘI CERURI
DETERGENȚI ACIZI
DETERGENȚI
TRATAMENTE SPECIFICE
IMPERMEABILIZANȚI PE BAZĂ DE APĂ
IMPERMEABILIZANȚI PE BAZĂ DE SOLVENȚI
```

### 4.3 Fără brand detectabil (62 produse)

Toate produsele din colecțiile SOLUȚII PENTRU PIATRĂ, DIVERSE, DISCURI, ABRAZIVI etc. nu au brand detectabil din CSV. Necesită cercetare externă sau confirmare de la Cristian. Posibili furnizori nereprezentați în text: Fox, VBT, Distar, Diatex, Tenax (soluții), Klindex, Sika, ecc.

### 4.4 Colecția DIVERSE (13 produse)

Colecția "DIVERSE" este prea vagă pentru taguri uz utile. Produsele din ea sunt eterogene — burghie, baston, creion, discuri speciale. Necesită reclasificare manuală sau acceptarea tagului generic `uz:diverse`.

---

## 5. Estimare Faza 2 — Scriptul de îmbogățire

### Ce face scriptul

1. Parsează CSV (UTF-8 BOM, câmpuri cu HTML)
2. Pentru fiecare produs:
   - Extrage `description` HTML dacă e non-trivial (>50 chars după strip)
   - Detectează brand din colecție + text
   - Generează taguri uz din colecție
   - Detectează taguri material din description + optionDescription
   - Extrage `ribbon` → tag `promo-30`
   - Extrage `additionalInfoDescription1` → `metadata.promo_bulk` (dacă există)
3. Apelează Medusa Admin API `PATCH /admin/products/:id` pentru fiecare produs
4. Loghează fiecare update în `scripts/enrichment-audit.jsonl`

### Complexitate

| Task | Ore estimate |
|------|-------------|
| Parser CSV + extracție câmpuri | 1h |
| Mapare handleId → Medusa productId | 0.5h |
| Logică brand detection | 0.5h |
| Logică taguri material + uz | 1h |
| Apeluri API Medusa + error handling | 1h |
| Logging audit + dry-run mode | 0.5h |
| **Total** | **~4.5h** |

---

## 6. Sumar final

| Categorie | Produse | % |
|-----------|---------|---|
| **Complet auto** (description + taguri uz + material) | ~65 | ~72% |
| **Parțial auto** (taguri derivabile, description lipsă) | ~17 | ~19% |
| **Manual necesar** (nici description, nici brand, colecție vagă) | ~8 | ~9% |

**Câmpuri îmbogățite automat per produs (medie):**
- description: 65/90
- tags brand: 28/90
- tags uz: 82/90 (restul 8 manual)
- tags material: ~80/90 (estimat, bazat pe keyword coverage)
- tag promo-30: 13/90
- metadata.promo_bulk: 3/90

**Ce nu se poate face automat:**
- Brandul pentru 62/90 produse
- Description pentru 25/90 produse
- Reclasificarea colecției DIVERSE (13 produse)
- Legăturile cross-sell (nu există date în CSV — necesită logică separată)

**Recomandare pentru Cristian:** Primele 25 produse fără descriere — dacă există fișe tehnice PDF de la furnizori (Tenax, Sait etc.), acestea sunt sursa cea mai rapidă. Pentru discuri și abrazivi, descrierile pot fi construite din combinația opțiunilor existente (DIAMETRU, GRANULAȚIE, TIP PIATRĂ).
