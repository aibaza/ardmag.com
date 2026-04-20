# Design Pending

Decizii vizuale în așteptare de la track-ul B. Actualizat pe măsură ce implementarea avansează.

Format: `- [ ] Componentă: <element> — <ce decizie se așteaptă>`

---

- [x] Componentă: card produs în listing — hover effect existent confirmat. Nicio schimbare.
- [x] Componentă: pagina de produs — galerie: thumbnail strip vertical stanga + main image. Confirmat. Selector variații si pret dinamic: implementate.
- [ ] Componentă: listing categorie — infinite scroll (inlocuieste paginarea numerica). De implementat: Intersection Observer + fetch page urmatoare, pastreaza URL sync cu ?page=.
- [x] Componentă: header — 3 straturi (util-bar + main-bar + cat-nav) confirmate. Mobile burger + logo + favorite + cos confirmat.
- [ ] Componentă: homepage hero — promo hero dinamic din Medusa (tag `featured` pe produs). Layout vizual identic cu cel actual. De implementat: fetch produs featured + wire date in Hero component.
- [x] Componentă: mobile filter — inline confirmat. Header "Filtre" + buton "Închide ×" adaugat (era X izolat).
- [x] Componentă: footer — 5 coloane confirmate, ANPC in footer-bot. Date contact reale aplicate.
- [ ] Componentă: checkout — multi-step: Adresa -> Livrare -> Plata. Progress bar vizibil. De implementat.
- [ ] Componentă: pagini cont — dashboard cu sidebar fix (Comenzile mele, Profil, Adrese, Logout) + continut in dreapta. De implementat.
- [x] Componentă: card categorie — imagine + label + nr. produse. Confirmat.
- [x] Decizie: optiunea COLOR — chip buttons implementate (TRANSPARENT, BEJ, 1 LITRU). Confirmat.
- [x] Decizie: breadcrumbs — produs, categorie, /produse. Homepage fara. Confirmat.
- [x] Decizie: tipografie — IBM Plex Sans (body) + IBM Plex Mono (labels/preturi). Confirmat.
- [x] A11Y — Contrast CTA primary — `--brand-500` intunecat la `oklch(56% 0.190 42)`. Rezolvat.
- [x] A11Y — Contrast footer text — `.footer-top h5`, `.news-consent`, `.trust-item span`, `.footer-bot` swap `--stone-500` -> `--stone-400`. Rezolvat.
