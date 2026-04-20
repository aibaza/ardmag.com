# Design Pending

Decizii vizuale în așteptare de la track-ul B. Actualizat pe măsură ce implementarea avansează.

Format: `- [ ] Componentă: <element> — <ce decizie se așteaptă>`

---

- [ ] Componentă: card produs în listing — layout, hover state, badge reducere, afișare preț
- [ ] Componentă: pagina de produs — layout selector variații, actualizare preț dinamic, galerie imagini
- [ ] Componentă: listing categorie — nr. coloane, filtre/sort, paginare vs. infinite scroll
- [ ] Componentă: header — poziționare logo, meniu navigare, cos, search, mobile menu
- [ ] Componentă: homepage hero — decizie intre "brand hero" (stats + category cards, implementat acum) vs "promo hero" (campanie specifica cu produs + discount, ca in DS04). Promo hero necesita date dinamice din Medusa si decizie de campanie.
- [ ] Componentă: mobile filter — accordion vs inline pentru panelul de filtre pe mobile (acum: inline functional)
- [ ] Componentă: footer — structura coloanelor, ANPC placement
- [ ] Componentă: checkout — single-page sau multi-step
- [ ] Componentă: pagini cont (login/register/orders) — layout general
- [ ] Componentă: card categorie — imagine, titlu, nr. produse
- [ ] Decizie: optiunea COLOR (MASTIC LICHID) — color swatch sau dropdown standard
- [ ] Decizie: breadcrumbs — exista pe paginile de produs si categorie?
- [ ] Decizie: tipografie — fonturi pentru heading, body, price
- [x] A11Y — Contrast CTA primary — `--brand-500` intunecat la `oklch(56% 0.190 42)`. Rezolvat.
- [x] A11Y — Contrast footer text — `.footer-top h5`, `.news-consent`, `.trust-item span`, `.footer-bot` swap `--stone-500` -> `--stone-400`. Rezolvat.
