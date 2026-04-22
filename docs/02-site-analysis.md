# 02 — Analiză Site Live ardmag.com

Scopul analizei: ce FACE site-ul actual, ce conținut trebuie păstrat, ce structură de informație (IA) există. Nu se analizează aspectul vizual.

Surse: WebFetch pe homepage, sitemap, 3 pagini de produs, 2 pagini de categorie, Despre Noi, Terms & Conditions, Shipping & Returns, listafirme.eu.

---

## Profil juridic și financiar — Arc Rom Diamonds SRL

| Câmp | Valoare |
|------|---------|
| Denumire legală | ARC ROM DIAMONDS SRL |
| CUI | 13828707 |
| Nr. Registrul Comerțului | J12/553/2001 |
| Data înființării | 9 aprilie 2001 |
| Sediu social | Str. Baciu (Calea Baciului) 1-3, Cluj-Napoca, jud. Cluj |
| Cod CAEN principal | 2391 — Fabricarea produselor abrazive |
| Formă juridică | SRL, 2 asociați, 2 administratori |
| Sedii secundare | 4 sedii secundare |

### Date financiare 2024 (ultimul bilanț disponibil public)

| Indicator | Valoare |
|-----------|---------|
| Cifra de afaceri | 1.292.304 RON (~258.000 EUR) |
| Profit net | 49.388 RON |
| Capitaluri proprii | 403.744 RON |
| Datorii totale | 924.046 RON |
| Angajați | 12 |

**Ranking:** Locul 1 în Top IMM-uri 2025, județul Cluj, sectorul fabricare produse abrazive (CAEN 2391).

**Observație pentru proiect:** Cifra de afaceri de ~1,3M RON la 12 angajați indică o operațiune de dimensiune medie, cu marjă netă de ~3,8%. Platforma online are potențial real de creștere a vânzărilor fără costuri suplimentare semnificative de personal.

---

## Profil comercial și brand

### Istoric și poziționare

- Prezent pe piața consumabilelor pentru prelucrarea pietrei naturale **din 2001** (25 de ani în 2026)
- Activitate: extragere, prelucrare, montare, tratare, curățare și întreținere pietre ornamentale (marmură, travertin, andezit)
- Claim validat: **"CEL MAI MARE DISTRIBUITOR TENAX DIN ROMÂNIA"**
- Tagline aprobat: **"25 DE ANI. LA MILIMETRU."**
- Mark logo: **"PRECIZIE SOLIDĂ"**
- Distribuție în **12-18 țări**

### Divizia Delta Research

- Preluată de Arc Rom Diamonds în **2011**
- Origine: firmă italiană fondată în **1984**, Delta Research.it S.R.L
- Activitate: producție impermeabilizanți și detergenți speciali pentru piatră naturală
- Poziționare: "primii producători de chimicale special adresate pieței pentru piatră, din Europa de Est"
- Peste 30 de ani de cercetare-dezvoltare în domeniu
- Produsele respectă normative internaționale

**Implicații pentru catalog:** Produsele Delta Research sunt fabricate propriu (nu distribuție third-party). Aceasta le diferențiază de restul catalogului și poate justifica un branding separat sau o secțiune dedicată în storefront.

### Furnizori oficiali (afișați pe homepage)

Tenax, Delta Research, Saitac (Sait), SuperSelva, Woosuk, Diatex, Fox Ironstone, VBT

**Notă:** "Saitac" și "Sait" par să fie același furnizor (Sait Abrasivi Italia). De verificat cu Andrei Rinzis care este denumirea corectă afișată pe noul site.

---

## Funcționalitate de păstrat

### Selectoare de variație cu preț dinamic

Pe pagina de produs, fiecare opțiune (ex: TIP DISCHETĂ, DIAMETRU, GRANULAȚIE, CANTITATE) este un dropdown. Prețul afișat inițial este 0 RON. Odată ce utilizatorul selectează toate opțiunile obligatorii (marcate cu asterisk), prețul se actualizează la valoarea variantei selectate. Această funcționalitate este esențială și trebuie reprodusă identic în Medusa + Next.js storefront.

### Coș și checkout

Butonul "Adaugă în coș" devine activ după selectarea tuturor opțiunilor obligatorii. Checkout-ul Wix suportă plată cu card (Credit/Debit), PayPal și plăți offline. Checkout guest (fără cont) este prezent.

### Cont client

Link "Conectează-te" vizibil în header. Funcționalitate standard de login/register. Medusa v2 suportă nativ autentificarea clienților.

### Promoție "Livrare gratuită peste 500 RON"

Afișată în header/banner, se aplică automat la checkout. Medusa suportă free shipping threshold ca shipping rule.

### Promoție MASTICI TENAX -30%

Categoria MASTICI TENAX conține **19 produse** total. Dintre acestea, **6 sunt marcate cu ribbon "PROMO 30%"**: MASTIC SEMISOLID, TIXO XE TRANSPARENT, MASTIC SOLID, GLAXS EASY, SET PIGMENȚI, GRAVITY SOLID EXTRA CLEAR. Reducerea se aplică automat la checkout (nu coupon). Trebuie recreată în Medusa ca promotion/discount selectiv — nu pe întreaga categorie, ci pe produsele specifice marcate.

**Notă față de analiza anterioară:** numărul de 13 produse cu PROMO era estimat; fetch direct pe pagina categoriei arată 6 produse cu ribbon și 19 total. De confirmat cu Andrei Rinzis lista exactă înainte de configurarea promoției în Medusa.

### Promoție PACHETE PROMOȚIONALE -20%

Categoria "Pachete Promoționale" conține produse cu reducere 20%. Logica exactă nu a putut fi extrasă din site (o singură pagina cu 1 produs), dar structura sugerează un discount pe categorie similar cu cel de mai sus.

### Căutare

Bară de căutare vizibilă în header. Căutare în titluri de produse. Medusa + Next.js storefront va necesita implementare de căutare (recomandabil: Meilisearch sau căutare nativă Medusa).

### Sortare în listing

Dropdown "Sortează după: Recomandat" pe paginile de categorie. Fără filtre avansate (nu există filtrare după preț, diametru, granulație etc.).

### Fișe tehnice PDF

Pe paginile de produs există o secțiune "FIȘE TEHNICE" cu linkuri directe la PDF-uri pentru două categorii de produse: "Soluții pentru Piatră" și "Mastici Tenax". Aceste PDF-uri sunt găzduite pe infrastructura Wix. La migrare, PDF-urile trebuie re-găzduite (Cloudflare R2 sau assets Next.js) și linkurile actualizate.

### Secțiune reduceri la cantitate (additionalInfo)

3 produse (ABRAZIVI OALĂ, DISCURI DE ȘLEFUIT CU CARBURĂ, DISCHETE DE ȘLEFUIT CU CARBURĂ) afișează o secțiune "PREȚ PROMOȚIONAL" cu tabel de reduceri la volum. Aceasta este informație textuală în câmpul additionalInfo din Wix, nu logică automată de preț. La migrare Faza 1 se importă ca text în descriere sau metadate; tier pricing automat este funcționalitate Faza 2+.

---

## Conținut de păstrat

### Pagina Despre Noi (`/despre-noi-1`)

Conținut esențial extras:
- "Suntem prezenți pe piața consumabilelor folosite în prelucrarea pietrei naturale din anul 2001"
- Compania oferă "soluții tehnice complete în domeniul extragerii, prelucrării, montării, tratării, curățării și întreținerii pietrelor ornamentale"
- Pietre vizate: marmură, travertin, andezit
- Portofoliu de produse menționat: discuri diamantate, abrazive și freze, mastici și cartuțe, produse pentru impermeabilizare și întreținere piatră
- Divizia DELTA RESEARCH: preluată în 2011, firmă italiană fondată în 1984 (40+ ani R&D), produce impermeabilizanți și detergenți speciali pentru piatră naturală; Arc Rom Diamonds = "primii producători de chimicale adresate pieței pentru piatră din Europa de Est"
- Produsele respectă "cele mai exigente standarde impuse de normativele internaționale"
- Livrare: "1-3 zile lucrătoare, în limita stocului disponibil"
- Claimul: "CEL MAI MARE DISTRIBUITOR TENAX DIN ROMÂNIA"
- Contact: +40 722 155 441

Textul paginii actuale este fragmentat și incomplet — necesită rescriere completă pentru noul site. Conținutul de mai sus este punct de plecare, nu text final.

### Pagini statice cu conținut lipsă sau placeholder

- `/terms-and-conditions`: Conține secțiunile CUSTOMER CARE, PRIVACY & SAFETY, WHOLESALE INQUIRIES, dar textul este generic/placeholder (template Wix necompletat). Conținut real lipsește. Există link la ANPC (anpc.ro) și menționarea metodelor de plată (card, PayPal, plăți offline).
- `/shipping-and-returns`: Complet necompletat — doar titluri de secțiuni (SHIPPING POLICY, RETURN & EXCHANGE POLICY) cu text placeholder Wix. Singura informație reală: "Livrare gratuită la comenzile de peste 500 RON".

**Concluzie:** Ambele pagini trebuie scrise de la zero pentru noul site.

### Contact

- Telefon: +40 722 155 441
- Email: office@arcromdiamonds.ro
- Adresă: Calea Baciului 1-3, Cluj-Napoca 400230, România

### Furnizori

Afișați pe homepage în secțiunea "Furnizori Oficiali": Tenax, Delta, Saitac, SuperSelva, Woosuk, Diatex, Fox Ironstone, VBT.

---

## Structura de informație (IA)

### Navigare principală

Meniu header: Acasă | Toate Produsele | Despre Noi | More (expandabil)

"More" conține pagini suplimentare (probabil Termeni, Livrări). Structura e minimală — nu există meniu mega cu categorii.

### Categorii — URL-uri reale din sitemap

| Categorie afișată | URL |
|-------------------|-----|
| Toate Produsele | `/category/all-products` |
| Mastici Tenax | `/category/mastici-tenax` |
| Soluții pentru Piatră | `/category/soluții-pentru-piatră` |
| Dischete și Discuri de Șlefuit | `/category/dischete-și-discuri-de-șlefuit` |
| Discuri de Tăiere | `/category/discuri-de-tăiere` |
| Abrazivi | `/category/abrazivi` |
| Abrazivi Oală | `/category/abrazivi-oală` |
| Diverse | `/category/diverse` |
| Mese de Tăiat | `/category/mese-de-tăiat` |
| Pachete Promoționale | `/category/pachete-promoționale` |

**Discrepanță CSV vs. sitemap:** CSV-ul exportă categoriile ca: ȘLEFUIRE PIATRĂ, ABRAZIVI ȘI PERII. Sitemap-ul arată: `dischete-și-discuri-de-șlefuit`, `abrazivi`. Acestea sunt probabil redenumiri în interfața Wix față de denumirile interne din CSV. La migrare, slug-urile Medusa trebuie să urmeze URL-urile noi dorite pentru noul site (nu neapărat aceleași cu Wix).

### URL-uri produse

Pattern: `/product-page/{slug}` (ex: `/product-page/dischete-de-șlefuit-cu-carbură`). Slug-urile sunt generate din numele produsului.

### Drumul de la homepage la un produs

1. Homepage → click categorie din grid → listing categorie (`/category/...`)
2. Listing afișează produse cu sort "Recomandat"; paginare cu "Load more"
3. Click pe produs → pagina de produs (`/product-page/...`)
4. Selectare opțiuni → preț actualizat → Adaugă în coș → Checkout

Nu există alte taxonomii de navigare (fără filtre după opțiuni, fără breadcrumbs de subcategorie).

---

## Ce NU copiem

- Paleta galben/negru — se înlocuiește complet cu designul din track-ul B
- Thumbnail-urile identice refolosite pe zeci de produse (același `db3b5a_...~mv2.jpg` apare la mai multe produse) — se decide separat dacă se înlocuiesc sau se lasă temporar
- Structura de navigare din header (link "More") — noul site va avea o navigare mai clară
- Paginile statice incomplete (Termeni, Livrări) — se rescriu complet
- Prețul afișat ca "0,00 lei" înainte de selecție — comportament acceptabil temporar, se poate îmbunătăți în Faza 2

---

## Lista de pagini necesare în noul site

| Rută | Scop | Sursă conținut |
|------|------|----------------|
| `/` | Homepage cu bannere promoționale, grid categorii, furnizori | Nou — design din track B |
| `/products` | Listing toate produsele, sortare | Catalog Medusa |
| `/categories/:slug` | Listing pe categorie, sortare | Catalog Medusa |
| `/products/:slug` | Pagina de produs — selectoare variație, preț dinamic, descriere, imagini | Catalog Medusa |
| `/cart` | Coș de cumpărături | Medusa cart API |
| `/checkout` | Checkout cu adresă, livrare, plată | Medusa checkout API |
| `/account` | Login/register/comenzi client | Medusa customer API |
| `/account/orders` | Istoricul comenzilor | Medusa orders API |
| `/about` | Despre Noi (rescrisă) | Conținut nou de la Ciprian |
| `/terms` | Termeni și Condiții (rescrisă) | Conținut nou de la Ciprian |
| `/shipping` | Politica de livrare și retur (rescrisă) | Conținut nou de la Ciprian |
| `/fise-tehnice` | Pagina cu linkuri PDF fișe tehnice | PDF-uri re-găzduite |

---

## Conținut lipsă din site-ul actual care trebuie creat pentru noul site

1. **Termeni și Condiții complet** — pagina actuală este placeholder
2. **Politică de livrare și retur completă** — pagina actuală este placeholder
3. **Descrieri pentru 24 de produse** — câmpul description este gol în CSV
4. **SKU-uri** — niciun produs nu are SKU definit
5. **Politică de confidențialitate (GDPR)** — nu există pagină separată pe site-ul actual
