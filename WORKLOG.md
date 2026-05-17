# Work Log -- ardmag.ro (Arc Rom Diamonds)

Cronologic crescator. 1 entry per livrare confirmata pe live.
Format: data + commits + descriere + deploy URL + confirmare user.

---

## 2026-05-16 -- Sesiune full (mai multe livrari)

Detalii in memory entries `project_session_16mai2026.md`. Highlights:

- `7172492` fix(checkout): pastreaza POST in middleware ca sa nu pierdem Server Actions
- `57ce297` fix(cache): include global tag in optiunile de cache pentru useri anonimi
- `dc3eaec` feat(fan-courier): fallback la greutate variante din DB cand context lipseste
- `4ca0b3e` fix(checkout): banner Stripe test mode doar cand key e pk_test_
- `a601b41` chore: ignore .env*.local in storefront, whitelist .medusa/ pe Railway
- `6ba3b64` chore: script one-shot replace-saitron-images (executat)
- `74115bd` docs: research catalog pentru completare descrieri produse
- `711b67e` chore: regenereaza imagini produse cu rembg refinement (7 produse)
- `8336148` feat(pdp): variante "contact telefonic" pentru discuri taiat >600mm
- `5b874a3` fix(pdp): sortare numerica variante, icon telefon solid, copy modal neutru
- `1edb058` fix(pcard): paspartout alb pe imagini produs pentru dark mode
- `9a34ec7` feat(home): hero side cards folosesc ultimele 2 articole publicate
- `9aa3597` chore(gitignore): ignora env productie, planning workflow, surse imagini neutilizate
- `0789825` chore: completeaza JPG-urile sursa lipsa din commit 711b67e

DB: 4 weights POLIMASTER HEX 13" + 1 soft delete orfan + 22 metadata.contact_to_order pe discuri >600mm.

---

## 2026-05-17 -- Sesiune full (CSS, brand, descrieri, perf paralel)

Detalii in memory entries `project_session_17mai2026.md`. Highlights:

- `f2fc12b` fix(css): dark mode highlight pentru variante contact telefonic
- `171ef9b` feat(pcard): chip-uri cu valori variante + overlay logo brand pe imagine
- `7898683` fix(pdp): scoate valoarea selectata din label-ul axei
- `db83fed` fix(pcard): logo brand fara fundal, max-width 100px
- `30d3c40` chore(brand-logos): logo-uri brand cu fundal complet transparent (Codex curatat 4)
- `78a9251` perf(home): ISR full-static homepage si cart badge client-side (sesiune paralela)
- `97e6ac2` feat(pdp): tab-uri condit + livrare/garantie cu continut generic
- `c08ea24` fix(blog): wrap imagine articol in container cu aspect-ratio fix
- `fe36f49` feat(home): hero side cards integral clickable
- `6209ec4` fix(promotii): publicFetch=true pentru a primi calculated_price cu original_amount
- `0cd830b` feat: feedback vizual add to cart + link-uri cart + scroll fix
- `e666af5` fix(promotii): include si produse cu metadata.ribbon=PROMO ca fallback

DB: 10 produse tag-uite brand (6 Delta + 4 SAIT) + descrieri aplicate pe 38 produse (din fara/placeholder/COPY_PENDING).

Codex deep research: 38 produse cercetate + descrieri propuse (XLSX in docs/copy-proposals/).

Vercel: backend-storefront proiect orfan sters (deploys fail). Doar ardmag-storefront ramane activ pe ardmag.ro.

---

<!-- Entry-uri viitoare se adauga dedesubt. 1 entry per livrare confirmata pe live cu format:

## YYYY-MM-DD HH:MM -- <titlu scurt>

Commits: `<hash1>`, `<hash2>`
Deploy: https://ardmag.ro/<path> | Vercel: <url>
Confirmat: DA / NU

<descriere ce s-a livrat + de ce>

-->

## 2026-05-17 14:00 -- Format preturi: Lei + decimal low-contrast + right-align + fix factor 100

Commits: `<pending>` (consolidat post-`0cd830b`)
Deploy: https://ardmag.ro/ | Vercel: ardmag-storefront-61e6gisvj
Confirmat: DA (user iterativ pe fiecare layer)

Pachet consolidat de fix-uri pe afisarea preturilor, deploy-uite incremental
direct via `vercel --prod` fara commit/push (eroare workflow recunoscuta
ulterior). Acest entry consolideaza livrarile in master.

1. **Fix factor 100 in /api/cart-snapshot** -- valorile veneau in cents din
   Medusa si erau afisate ca atare in AddToCartSheet (3 buc · 24.000,00 RON
   pentru un mastic de 80 lei/buc). Acum amounts trimise ca raw + formatPrice
   imparte la 100 client-side.

2. **Rename moneda RON -> Lei in display utilizator** -- `formatPrice` si
   `convertToLocale` returneaza "Lei" cand currency_code = "ron". Toate
   componentele relevante (CartLineItem, OrderRow, OrderSummary,
   CheckoutReview, CheckoutShipping, AddToCartSheet, PDPPriceCard,
   ProductCard, order pages) refactorizate sa foloseasca helper-ul centralizat.
   Texte hardcoded "500 RON" -> "500 Lei" in header promo, livrare-si-plata,
   termeni, PDPShippingInfo. JSON-LD ramane "RON" (cod ISO 4217 standard
   pentru Google structured data).

3. **Component FormattedPrice cu spans int/dec/currency** -- `<span class="price">
   <span class="price-int">18</span><span class="price-dec">,60</span>
   <span class="price-currency">Lei</span></span>`. CSS: decimalul +
   currency afisate cu `var(--fg-muted)`, integerul cu culoarea de baza.
   Plus `font-variant-numeric: tabular-nums` pentru aliniere consistenta.

4. **Right-align in card preț PDP** -- `.pdp-price-card` cu `text-align:right`,
   `.pdp-price-row` cu `justify-content:flex-end`, linia "Fara TVA" cu
   `justifyContent:flex-end` inline. Cardurile de produs raman cu pretul
   left-natural in footer (parte din flex space-between cu butonul Adauga).

Fisiere modificate: 21 fisiere refactor + 1 component nou (FormattedPrice +
index). Build SSG mentinut: 783 pagini static, homepage TTFB ~160ms hit cached.
