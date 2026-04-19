# Visual Review Summary -- Iteratia 1

**Data:** 2026-04-19  
**Screenshots:** 21 perechi (7 pagini x 3 viewports)  
**Target:** Design System 03 (Commerce Components) + Design System 04 (Chrome & Homepage)

---

## Scorecard

| Pagina | Mobile | Tablet | Desktop | Verdict |
|--------|--------|--------|---------|---------|
| homepage | NEEDS_WORK | NEEDS_WORK | NEEDS_WORK | NEEDS_WORK |
| category-small | NEEDS_WORK | NEEDS_WORK | NEEDS_WORK | NEEDS_WORK |
| category-medium | NEEDS_WORK | NEEDS_WORK | NEEDS_WORK | NEEDS_WORK |
| category-large | NEEDS_WORK | NEEDS_WORK | NEEDS_WORK | NEEDS_WORK |
| product-rich | NEEDS_WORK | NEEDS_WORK | NEEDS_WORK | NEEDS_WORK |
| product-bundle | NEEDS_WORK | NEEDS_WORK | NEEDS_WORK | NEEDS_WORK |
| product-variations | NEEDS_WORK | NEEDS_WORK | NEEDS_WORK | NEEDS_WORK |

---

## Ce functioneaza bine (PASS pe criterii individuale)

- Logo ardmag prezent in header pe toate paginile si viewporturile ✓
- Utility bar (3 straturi header) prezent si pe mobile si pe desktop ✓
- Butoane CTA portocalii prezente (Adauga, Cauta, CTA homepage) ✓
- IBM Plex Sans incarca vizibil pe toate paginile ✓
- Footer prezent cu coloane multiple ✓
- Copy conform CLAUDE.md -- nicio inventie detectata ✓
- Tagline "25 de ani. La milimetru." prezent pe homepage (banner portocaliu) ✓

---

## Issues agregate

### BLOCKERS (0)

Niciun BLOCKER in iteratia 1.

---

### MAJOR (5)

---

**MAJOR-1: Filtre categorie absente pe toate paginile de categorie**

Toate viewporturile, toate cele 4 pagini de categorie.

Target (DS03): panel de filtre cu DIAMETRU si TIP PIATRA ca filtre prioritare pe DISCURI. Vizibil in sidebar pe desktop, accordion pe mobile.

Current: doar un dropdown "Sort by" si taburi de sub-categorii la top. Zero filtre pe atribute.

- Fisiere: `src/modules/store/templates/` sau `src/modules/categories/templates/`
- Fix: implementeaza componenta de filtre cu atributele variantelor (DIAMETRU, TIP_PIATRA, LATIME). Pe desktop: sidebar stanga. Pe mobile: accordion/drawer.

---

**MAJOR-2: Specificatii produse sub fold pe PDP**

Toate viewporturile, product-rich, product-bundle, product-variations.

Target (DS03 -- Product row / list view): spec-urile (DIAMETRU, TIP PIATRA, LATIME) sunt vizibile imediat sub titlu, inainte de pret si butonul de adaugare.

Current: spec-urile sunt inecate in blocul de descriere text (product-rich arata un text lung narrativ), sau complet absente above-fold (product-variations arata un selector de variante dar fara spec table).

- Fisiere: `src/modules/products/components/product-actions/index.tsx` si `src/modules/products/templates/`
- Fix: adauga un tabel compact de spec-uri (max 4-5 randuri) intre titlu/brand si pretul final. Foloseste datele existente din variante (metadata sau options).

---

**MAJOR-3: Cards categorie -- densitate informationala mica**

Toate viewporturile, toate paginile de categorie.

Target (DS03 -- Product card / grid view): card compact cu imagine, titlu, specs rezumate (ex: "DIAMETRU: 115mm-230mm"), pret, CTA. Raport imagine/text echilibrat.

Current: card cu imagine dominanta (ocupa ~60-70% din card), titlu, un rand de specs, pret, buton. Pe mobile view single-column -- imaginile sunt prea mari fata de informatia textuala.

- Fisiere: `src/modules/products/components/product-card/index.tsx` si `src/modules/products/components/product-preview/index.tsx`
- Fix: reduce inaltimea imaginii in card, adauga 2-3 linii de spec-uri sub titlu. Pe mobile, verifica ca raportul imagine/text sa fie mai aproape de DS03.

---

**MAJOR-4: Logouri furnizori absente**

Toate paginile, toate viewporturile.

Target: banda cu logouri furnizori (Tenax, Sait, Woosuk, Diatex, Fox Ironstone, VBT, Delta Research) -- mono/greyscale acceptabil per CLAUDE.md. Vizibila pe homepage si potential footer.

Current: logouri furnizori inexistente nicaieri.

- Fisiere: `src/modules/home/` (nou component) + footer eventual
- Fix: adauga componenta `SupplierLogos` cu cele 7 branduri confirmate in CLAUDE.md. Placeholdere SVG mono sunt OK in iteratia 1.

---

**MAJOR-5: Hero homepage -- structura diferita de DS04**

Toate viewporturile.

Target (DS04 -- Homepage asamblat): hero dark cu promo-ul campaniei ca element vizual principal -- "Discuri diamantate Delta Turbo -20%" + CTA portocaliu + produse aferente vizibile in hero. Layout orientat catre conversia unui produs specific.

Current: hero cu headline generic "Scule profesionale pentru piatra naturala" + stats (25+, 500k+, 10) + buton portocaliu + search bar inline. Urmat de categorii grid + banner "25 de ani. La milimetru." separat.

Nota: copy-ul actual NU e inventat -- "Scule profesionale..." este din ardmag.com si "25 de ani. La milimetru." este tagline-ul aprobat. Problema e structura vizuala: stats + search bar in hero nu sunt in DS04.

- Fisiere: `src/modules/home/components/` (hero component)
- Fix: restructureaza hero-ul sa aiba: headline + tagline + CTA simplu + promo highlight. Elimina stats block si search bar din hero (searchul e in header). Componentele individuale sunt corecte; ordinea si proportia trebuie ajustate.

---

### MINOR (3)

**MINOR-1: Border radius pe carduri > 2px**  
Cardurile de produs par sa aiba rounded-md sau rounded-lg vizibil. Target: 2px (rounded-sm sau border-radius: 2px).  
Fisier: `src/modules/products/components/product-card/index.tsx`

**MINOR-2: Footer -- numarul exact de coloane**  
Desktop footer pare sa aiba 4-5 coloane, greu de numarat la scala mica. Target: exact 5 coloane. De verificat la zoom real.  
Fisier: footer layout component.

**MINOR-3: Thumbnailuri produse pe homepage lipsesc partial**  
Cateva produse in grila "Produse noi" de pe homepage apar fara imagine (box gol gri). Nu e o problema de design ci de date -- unele produse nu au imagine incarcata.  
Nu necesita fix de cod -- fix de date in Medusa admin.

---

## Decizie: Verdict global

**NEEDS_WORK** -- 0 BLOCKERi, 5 MAJOR

Ordinea de rezolvare in Faza 2:
1. MAJOR-5 (hero homepage) -- cel mai vizibil, impact maxim
2. MAJOR-2 (specs above fold pe PDP) -- afecteaza conversia direct
3. MAJOR-3 (densitate carduri) -- afecteaza toate paginile de categorie
4. MAJOR-4 (logouri furnizori) -- adaugare componenta noua, relativ simplu
5. MAJOR-1 (filtre categorie) -- cel mai complex, implementare noua

MINOR-1 si MINOR-2 se adreseaza dupa ce toate MAJOR sunt rezolvate.
