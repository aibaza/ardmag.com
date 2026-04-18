# 03 — Mapare Wix → Medusa v2

Regulă fundamentală: **1 produs Wix = 1 produs Medusa.** 90 produse în Wix = 90 produse în Medusa. Variantele sunt rânduri sub produs, nu produse separate.

---

## 1. Collection → Product Category

**Wix:** câmpul `collection` pe rândul Product (o singură valoare; nu există colecții multiple per produs).

**Medusa:** `POST /admin/product-categories` — o categorie per valoare unică din `collection`.

| Wix collection | Medusa Category slug | Handle sugestiv |
|----------------|---------------------|-----------------|
| MASTICI TENAX | mastici-tenax | mastici-tenax |
| SOLUȚII PENTRU PIATRĂ | solutii-pentru-piatra | solutii-pentru-piatra |
| DIVERSE | diverse | diverse |
| ȘLEFUIRE PIATRĂ | slefuire-piatra | slefuire-piatra |
| DISCURI DE TĂIERE | discuri-de-taiere | discuri-de-taiere |
| ABRAZIVI ȘI PERII | abrazivi-si-perii | abrazivi-si-perii |
| MESE DE TĂIAT | mese-de-taiat | mese-de-taiat |
| PACHETE PROMOȚIONALE | pachete-promotionale | pachete-promotionale |
| ABRAZIVI OALĂ | abrazivi-oala | abrazivi-oala |
| (fără categorie — 8 produse) | de-decis | — |

**Acțiune necesară:** Ciprian decide în ce categorie merg cele 8 produse fără `collection` înainte de rularea importului. Fără această decizie, scriptul de import se va opri sau va pune produsele într-o categorie temporară "NECATEGORIZAT".

---

## 2. Product row → Medusa Product

| Câmp Wix | Câmp Medusa | Transformare |
|----------|-------------|-------------|
| `handleId` | `handle` | Slug generat din `name` (lowercase, diacritice normalizate, spații → `-`) |
| `name` | `title` | 1:1 |
| `description` | `description` | HTML brut din Wix (conține `<p>`, `<ul>`, `<li>`). Se importă ca HTML. Dacă gol, `description = null`. |
| Prima imagine din `productImageUrl` | `thumbnail` | Construit ca `https://static.wixstatic.com/media/{id}` |
| Toate imaginile din `productImageUrl` (split `;`) | `images[]` | Fiecare ID construit ca URL complet. |
| `collection` | `categories[]` | ID-ul categoriei Medusa corespunzătoare |
| `visible` | `status` | `true` → `"published"`, `false` → `"draft"` |
| `ribbon` | `metadata.ribbon` | Salvat ca metadată (ex: `"PROMO 30%"`) |
| `additionalInfoTitle1` + `additionalInfoDescription1` | `metadata.promo_info` | Salvat ca metadată, nu ca logică de preț |
| `weight` | `weight` | În grame (Wix stochează în kg → `weight * 1000` dacă unitatea e kg; trebuie verificat) |
| `discountMode`, `discountValue` | nu se importă direct | Recreat manual ca Medusa promotion după import |
| `sku` (produs) | ignorat | SKU-urile sunt pe variante |
| `cost` | ignorat | 0/90 produse au valoare |
| `brand` | ignorat | 0/90 produse au valoare |
| `customTextField1-2` | ignorat | 0/90 produse au valoare |

---

## 3. productOptionName → Medusa Product Option

**Wix:** câmpurile `productOptionName1..4` pe rândul Product (max 4 opțiuni; opțiunile 5-6 nu sunt folosite).

**Medusa:** `POST /admin/products/{id}/options` — câte o opțiune per `productOptionName` nevid.

| Wix câmp | Medusa |
|----------|--------|
| `productOptionName1` + `productOptionType1` | Option cu `title = productOptionName1` |
| `productOptionName2` + `productOptionType2` | Option cu `title = productOptionName2` |
| `productOptionName3` + `productOptionType3` | Option cu `title = productOptionName3` |
| `productOptionName4` + `productOptionType4` | Option cu `title = productOptionName4` |

**Tipuri Wix vs. Medusa:** Wix are `DROP_DOWN` și `COLOR`. Medusa nu are un câmp de tip pe opțiune — tipul se reflectă în UI la nivel de storefront. `DROP_DOWN` → selector standard; `COLOR` (un singur caz: CULOARE la MASTIC LICHID) → color picker în storefront (decizie de UI, marcată DESIGN PENDING).

**Valorile opțiunilor** nu sunt pe Product row — sunt extrase din rândurile Variant (câmpurile `productOptionDescription1..4`).

---

## 4. Variant rows (visible=true) → Medusa Product Variant

**Regulă de import:** Se importă EXCLUSIV variantele cu `visible=true`. Cele cu `visible=false` (1388 din 2163) nu se importă deloc.

| Câmp Wix Variant | Câmp Medusa Variant | Transformare |
|-----------------|---------------------|-------------|
| `productOptionDescription1` | `options[0].value` | Valoarea pentru Option 1 |
| `productOptionDescription2` | `options[1].value` | Valoarea pentru Option 2 |
| `productOptionDescription3` | `options[2].value` | Valoarea pentru Option 3 (dacă există) |
| `productOptionDescription4` | `options[3].value` | Valoarea pentru Option 4 (dacă există) |
| `price` (Product) + `surcharge` (Variant) | `prices[0].amount` | Preț final în bani (cent RON → `(price + surcharge) * 100`). Dacă surcharge gol → tratezi ca 0. |
| `inventory` | `manage_inventory` + `inventory_quantity` | `InStock` → quantity = 100 (placeholder Faza 1); gestiunea reală în Faza 2 |
| `sku` | `sku` | Niciun variant nu are SKU în CSV → generat ca `{product-handle}-{index}` |
| `visible` | filtru de import | `false` → nu se importă |

**Currency:** RON. Medusa stochează prețurile în smallest currency unit (bani). `115 RON` → `11500`.

**Calculul prețului:**
- Dacă `price (Product) > 0` și `surcharge (Variant) = 0`: preț final = `price`
- Dacă `price (Product) = 0` și `surcharge (Variant) > 0`: preț final = `surcharge`
- Nu există cazuri unde ambele sunt > 0 simultan

**Caz special — surcharge gol pe variantă activă:** PAD POLIMASTER + HEX, varianta `PAD POLIMASTER HEX | 17" | STEP 3` are `surcharge = ""`. Se importă cu preț 0 și se loghează ca warning.

---

## 5. Produse cu 0 variante (produse simple)

30 de produse nu au niciun rând Variant în CSV. Prețul lor final este pe câmpul `price` al Product row.

**Medusa cere cel puțin o variantă per produs** (varianta default, fără opțiuni vizibile în UI). Se creează automat la import:

```
Variant: {
  title: "Default",
  options: [],  // fără valori de opțiune
  prices: [{ amount: price * 100, currency_code: "ron" }]
}
```

Această variantă "Default" nu apare ca selector în UI dacă produsul nu are opțiuni definite.

---

## 6. Imagini

**Format URL Wix:** `{mediaId}~mv2.jpg`
**URL complet:** `https://static.wixstatic.com/media/{mediaId}~mv2.jpg`

**Distribuție imagini per produs:**
- 1 imagine: 65 produse
- 2-4 imagini: 20 produse
- 5+ imagini: 5 produse

**Strategie import Faza 1:** Descarcă imaginile de pe CDN Wix (request cu delay 200-500ms pentru a evita rate limiting) și stochează-le local sau pe Cloudflare R2. Dacă un URL returnează 403/404, loghează și continuă — produsul se importă fără acea imagine.

**Risc CDN Wix:** Imaginile sunt servite de `static.wixstatic.com`. Accesul fără autentificare ar trebui să funcționeze, dar Wix poate restricționa descărcarea în bulk. Testează cu 5-10 imagini înainte de descărcarea completă.

---

## 7. Câmpuri Wix care se pierd la migrare

| Câmp Wix | Motiv |
|----------|-------|
| `sku` (pe Product row) | 0/90 produse au valoare |
| `cost` | 0/90 produse au valoare |
| `brand` | 0/90 produse au valoare |
| `customTextField1-2` | 0/90 au valoare |
| `additionalInfoTitle2-6` | 0/90 au valoare |
| `discountMode` / `discountValue` | Recreat ca promotion Medusa, nu importat direct |
| `productOptionType` (DROP_DOWN/COLOR) | Tip UI — decizia de rendering rămâne la storefront |
| `weight` (unitate incertă) | Se importă dacă unitatea se confirmă ca kg; altfel pierdut temporar |

---

## 8. Tabel-exemplu concret: DISCHETE DE ȘLEFUIT CU CARBURĂ

**În Wix:** 1 produs, 360 variante generate, **100 variante active**.

**Opțiuni definite pe Product row:**
- TIP DISCHETĂ (DROP_DOWN): SAITDISC, VEL
- DIAMETRU (DROP_DOWN): 115, 125, 180 (mm)
- GRANULAȚIE (DROP_DOWN): 36, 60, 80, 120, 180, 220, 320, 500
- CANTITATE (DROP_DOWN): CUTIE (25 BUC.), CUTIE (50 BUC.), BAX (100 BUC.), BAX (400 BUC.)

Produsul are `price = 0.0`. Fiecare variantă activă are surcharge-ul ca preț final.

**Primele 10 variante active (din 100):**

| TIP DISCHETĂ | DIAMETRU | GRANULAȚIE | CANTITATE | Preț final (RON) |
|-------------|---------|-----------|----------|-----------------|
| SAITDISC | 180 | 60 | CUTIE (25 BUC.) | 160.00 |
| VEL | 125 | 180 | CUTIE (50 BUC.) | 90.00 |
| SAITDISC | 125 | 36 | CUTIE (25 BUC.) | 135.00 |
| SAITDISC | 180 | 120 | BAX (100 BUC.) | 590.00 |
| SAITDISC | 180 | 80 | BAX (100 BUC.) | 590.00 |
| SAITDISC | 180 | 320 | CUTIE (25 BUC.) | 160.00 |
| VEL | 180 | 500 | BAX (400 BUC.) | 1200.00 |
| VEL | 115 | 60 | BAX (400 BUC.) | 640.00 |
| SAITDISC | 180 | 220 | BAX (100 BUC.) | 590.00 |
| SAITDISC | 125 | 320 | CUTIE (25 BUC.) | 112.50 |

**Rezultat în Medusa admin:**
- 1 card de produs în listing: "DISCHETE DE ȘLEFUIT CU CARBURĂ"
- La editare: 4 Product Options + tabelă cu **100 rânduri de variante** (nu 360)
- Variantele cu `visible=false` (260 din 360) **nu apar în admin deloc**
- Fiecare rând de variantă are: combinație de valori (TIP + DIAMETRU + GRANULAȚIE + CANTITATE) + preț în RON + SKU generat

**Ce NU se întâmplă:** Nu se creează 100 produse separate, nu se creează 360 produse, nu apar variantele inactive.

---

## Rezumat mapare

```
Wix Export                          Medusa v2
─────────────────────────────────   ─────────────────────────────────
90 Product rows               →     90 Product entities
9 Collection values           →     9 Product Categories (+ 1 decizie)
775 Variant rows (visible=true) →   775 Product Variants (distribuite sub cele 90 produse)
1388 Variant rows (visible=false) → IGNORAT, nu se importă
max 4 productOptionNames/prod →     max 4 Product Options/produs
productImageUrl (IDs relative) →    images[] (URL-uri construite + descărcate)
price + surcharge             →     prices[].amount (în bani RON)
ribbon + discountMode         →     recreat manual ca Promotions Medusa
```
