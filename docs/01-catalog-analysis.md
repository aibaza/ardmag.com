# 01 — Analiză Catalog Wix

Sursa: `resources/Wix Products Catalog.csv` (UTF-8 BOM, 2253 rânduri de date + 1 header).

---

## Structura generală a datelor

| Metric | Valoare |
|--------|---------|
| Rânduri Product | 90 |
| Rânduri Variant | 2163 |
| Variante active (visible=true) | 775 |
| Variante inactive (visible=false) | 1388 |

Câmpul `visible` are doar două valori posibile: `true` și `false`. Nu există variante cu valori ambigue.

---

## Câmpuri folosite vs. goale (pe rânduri Product)

**Câmpuri complet populate (90/90):**
`handleId`, `fieldType`, `name`, `productImageUrl`, `price`, `visible`, `discountMode`, `discountValue`, `inventory`

**Câmpuri parțial populate:**
- `description`: 66/90 — 24 produse fără descriere (lista mai jos)
- `collection`: 82/90 — 8 produse fără categorie (detalii mai jos)
- `weight`: 29/90
- `ribbon`: 13/90 (toate cu valoarea `PROMO 30%`)
- `productOptionName1..4`: 61/32/8/3 din 90
- `additionalInfoTitle1`: 3/90

**Câmpuri complet nefolosite (0/90):**
`sku`, `cost`, `brand`, `surcharge` (pe Product row, surcharge apare doar pe Variant), `productOptionName5-6`, `additionalInfoTitle2-6`, `customTextField1-2`

**Observație importantă — câmpul surcharge:** Pe rândurile Product, surcharge este mereu gol. Surcharge-ul apare exclusiv pe rândurile Variant. Prețul final al unei variante = `price` (de pe Product) + `surcharge` (de pe Variant).

- 31 produse au `price > 0` și variantele lor au `surcharge = 0` (prețul final = price de bază)
- 59 produse au `price = 0` și prețul final vine integral din `surcharge`-ul variantei

Nu există niciun produs cu atât `price > 0` cât și variante cu `surcharge != 0` — sunt mereu mutual exclusive.

**Format URL imagini:** Câmpul `productImageUrl` nu conține URL-uri complete, ci ID-uri relative Wix de forma `{mediaId}~mv2.jpg` (exemplu: `db3b5a_e4d15fb0361348d0be47457443e6a42e~mv2.jpg`). URL-ul complet se construiește ca `https://static.wixstatic.com/media/{mediaId}~mv2.jpg`. Câmpuri separate cu `;` pentru multiple imagini.

---

## Categorii (câmpul `collection`)

| Categorie | Nr. produse |
|-----------|-------------|
| SOLUȚII PENTRU PIATRĂ | 27 |
| MASTICI TENAX | 20 |
| DIVERSE | 13 |
| ȘLEFUIRE PIATRĂ | 8 |
| DISCURI DE TĂIERE | 7 |
| ABRAZIVI ȘI PERII | 3 |
| MESE DE TĂIAT | 2 |
| PACHETE PROMOȚIONALE | 1 |
| ABRAZIVI OALĂ | 1 |
| **Fără categorie** | **8** |

**Total: 90 produse.** Niciun produs nu are categorii multiple (câmpul `collection` nu conține `;`).

**Discrepanță față de brief:** Brief-ul menționează 3 produse fără categorie. Analiza CSV identifică **8 produse fără categorie.** Lista completă:

1. CAROTE DIAMANTATE (12 variante active, DIAMETRU ca opțiune)
2. DISC DE ȘLEFUIRE CONCAV (2 variante active, GRANULAȚIE)
3. ÎNTREȚINERE ȘI CERURI (3/6 active, DENUMIRE + CANTITATE)
4. DETERGENȚI ACIZI (3/6 active, DENUMIRE + CANTITATE)
5. DETERGENȚI (8/8 active, DENUMIRE + CANTITATE)
6. TRATAMENTE SPECIFICE (6/6 active, DENUMIRE + CANTITATE)
7. IMPERMEABILIZANȚI PE BAZĂ DE APĂ (7/8 active, DENUMIRE + CANTITATE)
8. IMPERMEABILIZANȚI PE BAZĂ DE SOLVENȚI (17/22 active, DENUMIRE + CANTITATE)

Cele 6 produse cu opțiunea `DENUMIRE` (nr. 3-8) par a fi produse-container unde variantele sunt de fapt produse individuale grupate (ex: IMPERMEABILIZANȚI PE BAZĂ DE SOLVENȚI are variante: WET SEAL, SEAL, QUASAR, NANO WET, IDROREP, TOTAL BLACK etc.). Acestea aparțin logic de categoria `SOLUȚII PENTRU PIATRĂ`. CAROTE DIAMANTATE și DISC DE ȘLEFUIRE CONCAV aparțin logic de `ȘLEFUIRE PIATRĂ` sau `DIVERSE`.

**Decizie necesară înainte de import:** Ciprian trebuie să confirme categoria pentru fiecare din cele 8 produse.

---

## Distribuția variantelor active per produs

**30 produse au 0 variante** — sunt produse simple, fără rânduri Variant în CSV. Prețul lor final este `price` de pe Product row. Medusa cere totuși o variantă default internă pentru a stoca prețul.

**60 produse au variante active:**

| Bucket | Nr. produse |
|--------|-------------|
| 2-5 variante active | 33 |
| 6-20 variante active | 17 |
| 21-100 variante active | 10 |
| Exact 1 variantă activă | 0 |

Niciun produs nu are exact 1 variantă activă — toate produsele cu variante au minimum 2 active.

---

## Tipuri de opțiuni

**Tipuri:** Exclusiv `DROP_DOWN` (103 instanțe), cu o singură excepție `COLOR` (1 instanță — CULOARE la produsul MASTIC LICHID).

**Frecvența numelor de opțiuni:**

| Opțiune | Nr. produse |
|---------|-------------|
| CANTITATE | 33 |
| DIAMETRU | 14 |
| GRANULAȚIE | 13 |
| DENUMIRE | 9 |
| CULOARE | 5 |
| TIP PIATRĂ | 5 |
| CATEGORIE | 4 |
| SPECIALIZARE | 3 |
| Altele (unice) | 14 |

Maximum 4 opțiuni per produs (3 produse au 4 opțiuni: DISCHETE DE ȘLEFUIT CU CARBURĂ, DISCURI DE ȘLEFUIT CU CARBURĂ, ABRAZIVI ANELLI). Opțiunile 5 și 6 nu sunt folosite de niciun produs.

**Valori opțiune CANTITATE:** Semantica variază între produse — unii folosesc volume (`1 LITRU`, `5 LITRI`, `18 LITRI`), alții cantități de piese (`CUTIE (25 BUC.)`, `BAX (100 BUC.)`), alții greutăți (`5 KG`, `700 GRAME`) sau combinații (`A (1 L) + B (1 L)`). Opțiunea CANTITATE nu este globală — e per produs, deci semantica diferită nu ridică probleme de consistență în Medusa.

---

## Top 5 produse cu cele mai multe variante active

| Produs | Active | Generate | Rată activare |
|--------|--------|----------|---------------|
| DISCHETE DE ȘLEFUIT CU CARBURĂ | 100 | 360 | 28% |
| DISCHETE DE ȘLEFUIT DIAMANTATE | 85 | 288 | 30% |
| ABRAZIVI ȘI PERII FRANKFURT | 73 | 216 | 34% |
| ABRAZIVI ANELLI | 52 | 120 | 43% |
| DISCURI MARMURĂ | 38 | 48 | 79% |

Ratele mici de activare (28-43%) pentru top 4 indică că marea majoritate a combinațiilor generate de Wix nu sunt vândute activ. Cele inactive sunt fie stocuri epuizate permanent, fie combinații imposibile fizic, fie variante deprecated.

---

## Produse problematice

### 1. Produse care nu se pot vinde (preț = 0, fără variante active)

| Produs | Motiv |
|--------|-------|
| FIR DIAMANTAT | price=0 pe Product row, 0 variante în CSV (nici generate, nici active) |

FIR DIAMANTAT nu are nicio cale de a afișa un preț. Nu poate fi importat ca produs vandabil fără intervenție manuală.

### 2. Variantă activă cu surcharge gol

PAD POLIMASTER + HEX (12 active, opțiuni: TIP PAD / DIAMETRU / GRANULAȚIE) — varianta `PAD POLIMASTER HEX | 17" | STEP 3` are `visible=true` dar `surcharge=""`. Importatorul trebuie să trateze surcharge gol ca 0 sau să marcheze varianta cu preț de 0 RON și să alerteze.

### 3. Produse fără descriere (24 din 90)

MASTIC SEMISOLID, DISCHETE DE ȘLEFUIT DIAMANTATE, ÎNTĂRITOR MASTIC, DISCURI SPECIALE, DISCURI DE ANDEZIT, DISCURI DE GRANIT, DISCURI ORIZONTALE DE MARMURĂ ȘI ANDEZIT, DISCURI MARMURĂ, POMPĂ CU APĂ, MASĂ DE TĂIAT, SUPORT FRANKFURT, CREION, BATON, MATERIAL DEZANCRASANT, ABRAZIVI ANELLI, ABRAZIVI TANGENȚIALI, BURGHIU, PAD CAUCIUC, CAROTE DIAMANTATE, ABRAZIVI OALĂ, ÎNTREȚINERE ȘI CERURI, DETERGENȚI ACIZI, DETERGENȚI, TRATAMENTE SPECIFICE.

Acestea pot fi importate fără descriere (câmpul este opțional în Medusa), dar vor arăta incomplet în storefront. Decizie separată dacă se completează înainte sau după lansare.

### 4. Promovare PROMO 30% fără valoare numerică exportată

13 produse din MASTICI TENAX au `ribbon = "PROMO 30%"` dar `discountValue = 0.0`. Reducerea de 30% este aplicată la nivel de platformă Wix, nu stocată în CSV. La migrare, această reducere trebuie recreată manual în Medusa ca promoție/discount pe categoria MASTICI TENAX sau per-produs.

Lista produselor afectate: MASTIC SEMISOLID, TIXO XE TRANSPARENT, MASTIC SOLID, GLAXS EASY, SET PIGMENȚI, GRAVITY SOLID EXTRA CLEAR, STRONGEDGE 45 EPOXY SOLID TRANSPARENT, RIVO EPOXY SOLID, FIXTOP EPOXY SOLID, FAST GLAXS GLUE CARTUȘ, KIT COLLA GLAXS TRANSPARENT, ELIOX EPOXY SOLID EXTRA CLEAR, DOMO 10 EPOXY SOLID.

### 5. Discount AMOUNT pe un singur produs

SET ADEZIV PROFESIONAL + DECAPANT: `discountMode=AMOUNT`, `discountValue=332.0 RON`. Acesta este un discount fix în sumă absolută, nu procent. Medusa suportă discount-uri de tip FIXED_AMOUNT — trebuie creat ca price rule manual.

### 6. Niciun SKU definit

0 variante din 2163 au SKU în CSV. La import, SKU-urile trebuie generate sintetic (ex: `{handle}-{index}`). Dacă se doresc SKU-uri semnificative, Ciprian trebuie să le furnizeze separat.

---

## Riscuri și edge case-uri pentru migrare

| Risc | Severitate | Mitigare |
|------|-----------|----------|
| URL-uri imagini sunt ID-uri relative Wix, nu URL-uri complete | Medie | Construiește URL ca `https://static.wixstatic.com/media/{id}`. Testează câteva înainte de import în masă. |
| Wix CDN poate bloca download-urile cu 403/rate limiting | Medie | Descarcă imaginile cu delay între request-uri; pentru unele poate fi nevoie de descărcare manuală din Wix Media Manager. |
| 8 produse fără categorie | Mare | Decizie necesară de la Ciprian înainte de a rula importul. |
| Surcharge gol pe variantă activă (PAD POLIMASTER + HEX) | Mică | Tratați ca 0 RON, marcați cu todo în admin. |
| FIR DIAMANTAT fără preț și fără variante | Mică | Importat cu preț 0 și marcat `published=false` până se clarifică. |
| PROMO 30% nu e în CSV ca valoare | Mare | Recreat manual ca promotie Medusa după import. |
| 24 produse fără descriere | Medie | Importate cu descriere goală; completate ulterior. |
| Niciun SKU în CSV | Mică | Generate automat la import. |
| DETERGENȚI ACIZI are aceeași denumire variantă "DE GRAUB" cu prețuri diferite (1L vs 5L) | Mică | Variantele sunt diferențiate prin opțiunea CANTITATE, nu e o duplicare reală. |
| additionalInfo (reduceri la cantitate) — text promoțional în câmp HTML | Mică | Nu se importă direct ca logică de preț. Se salvează ca metadata sau text în descriere extinsă. Logica de reduceri la cantitate (ex: -35% la 50 buc) necesită implementare separată în Medusa ca tier pricing. |
