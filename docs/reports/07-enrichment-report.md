# 07 - Raport Îmbogățire Produse

**Data:** 2026-04-19
**Script:** `scripts/enrich-products.ts --apply`
**Sursă date:** `resources/Wix Products Catalog.csv` → Medusa v2 Admin API

---

## 1. Statistici numerice

### 1.1 General

| Indicator | Valoare |
|-----------|---------|
| Total produse în Medusa | 90 |
| Produse cu description real | 59 (65.6%) |
| Produse fără description | 31 (34.4%) |
| Produse cu cel puțin un tag | 58 (64.4%) |
| Produse fără niciun tag | 32 (35.6%) |
| Produse cu `metadata.promo_bulk` | 3 (3.3%) |

### 1.2 Produse fără description (31)

Necesită Faza 2.5 (generare automată) sau input manual:

- MASTIC SEMISOLID
- CERAMASTER 3 STEP
- DISCHETE DE ȘLEFUIT DIAMANTATE
- ÎNTĂRITOR MASTIC
- SET PIGMENȚI
- DISCURI MARMURĂ ȘI ANDEZIT TOLA SECOND
- DISCURI SPECIALE
- DISCURI DE ANDEZIT
- DISCURI DE GRANIT
- DISCURI ORIZONTALE DE MARMURĂ ȘI ANDEZIT
- DISCURI MARMURĂ
- POMPĂ CU APĂ
- MASĂ DE TĂIAT
- SUPORT FRANKFURT
- LÂNĂ DE OȚEL
- CREION
- BATON
- MATERIAL DEZANCRASANT
- ACID OXALIC
- PÂSLĂ
- ABRAZIVI ANELLI
- ABRAZIVI TANGENȚIALI
- BURGHIU
- PAD CAUCIUC
- BURETE DIAMANTAT
- CAROTE DIAMANTATE
- ABRAZIVI OALĂ
- ÎNTREȚINERE ȘI CERURI
- DETERGENȚI ACIZI
- DETERGENȚI
- TRATAMENTE SPECIFICE

### 1.3 Distribuție taguri `brand:*`

| Tag | Produse |
|-----|---------|
| `brand:tenax` | 21 |
| `brand:sait` | 5 |
| `brand:woosuk` | 2 |
| **Total produse cu brand tag** | **28** |
| Produse fără brand detectabil | 62 |

### 1.4 Distribuție taguri `material:*`

| Tag | Produse |
|-----|---------|
| `material:cuart` | 25 |
| `material:ceramica` | 18 |
| `material:piatra-naturala` | 17 |
| `material:marmura` | 13 |
| `material:granit` | 12 |
| `material:travertin` | 8 |
| `material:andezit` | 4 |
| **Total taguri material aplicate** | **97** |

Notă: un produs poate avea mai multe taguri material. Produsele cu opțiunea `TIP PIATRĂ` au fost excluse de la tagging automat (materialul e deja structurat în variante).

### 1.5 Tag `promo:30`

| Indicator | Valoare |
|-----------|---------|
| Produse cu `promo:30` | 13 |

### 1.6 Metadata `promo_bulk`

Produse cu informații promoționale la volum în metadata:

| Produs | Conținut |
|--------|---------|
| ABRAZIVI OALĂ | Reducere 20% la 5 bucăți |
| DISCURI DE ȘLEFUIT CU CARBURĂ | Reducere 10% la 10 buc, 35-40% la 50 buc |
| DISCHETE DE ȘLEFUIT CU CARBURĂ | Reducere 35-40% la 50 buc, 45% la 400 buc |

---

## 2. Exemple de produse reale

JSON-urile complete sunt salvate în același folder:
- `docs/reports/sample-product-rich.json`
- `docs/reports/sample-product-medium.json`
- `docs/reports/sample-product-poor.json`

### 2.1 Produs bogat — GLAXS EASY

**Criteriu de selecție:** cel mai mare număr de taguri (5) dintre produsele din colecția MASTICI TENAX cu description.

| Câmp | Valoare |
|------|---------|
| ID | `prod_01KPH3PZHE2GEZ13B8RHSBSRHV` |
| Handle | `glaxs-easy` |
| Description | prezent (1181 caractere HTML) |
| Taguri | `brand:tenax`, `material:cuart`, `material:ceramica`, `material:piatra-naturala`, `promo:30` |
| Metadata | — |
| Status | published |

### 2.2 Produs mediu — SET ADEZIV PROFESIONAL + DECAPANT

**Criteriu de selecție:** description prezent, 2 taguri material, fără brand detectabil.

| Câmp | Valoare |
|------|---------|
| ID | `prod_01KPH3PZWSHQT667G4WRZW97A8` |
| Handle | `set-adeziv-profesional-decapant` |
| Description | prezent (1032 caractere HTML) |
| Taguri | `material:cuart`, `material:ceramica` |
| Metadata | — |
| Status | published |

### 2.3 Produs sărac — MASTIC SEMISOLID

**Criteriu de selecție:** fără description, populat doar din date derivate (brand din colecție, ribbon).

| Câmp | Valoare |
|------|---------|
| ID | `prod_01KPH3PY0DH4YRH3A979ATE7N5` |
| Handle | `mastic-semisolid` |
| Description | null |
| Taguri | `brand:tenax`, `promo:30` |
| Metadata | — |
| Status | published |

---

## 3. Lista completă taguri

| Tag | Număr produse | Exemplu produs |
|-----|---------------|----------------|
| `brand:sait` | 5 | SAITPAD-DQ |
| `brand:tenax` | 21 | MASTIC LICHID |
| `brand:woosuk` | 2 | DISC DE ȘLEFUIRE CONCAV |
| `material:andezit` | 4 | RES 1001 |
| `material:ceramica` | 18 | GLAXS EASY |
| `material:cuart` | 25 | MASTIC LICHID |
| `material:granit` | 12 | CLEAN STONE |
| `material:marmura` | 13 | SABBIATORE AX/F |
| `material:piatra-naturala` | 17 | MASTIC LICHID |
| `material:travertin` | 8 | MASTIC SEMISOLID WET |
| `promo:30` | 13 | MASTIC SEMISOLID |
| **TOTAL** | **138** | |
