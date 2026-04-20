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
- [ ] A11Y — Contrast CTA primary (`--brand-500`) — butoane orange pe fundal alb au contrast 3.63:1 (WCAG AA cere 4.5:1 pentru text normal). Optiuni: (1) Darkens `--brand-500` la echivalentul curent al `--brand-600` (oklch 56% 0.190 42) — afecteaza toate CTA-urile si badge-urile `-30%`; (2) Token separat `--brand-accessible-text` doar pentru text-on-brand; (3) Mareste font-weight `.btn.primary` la 700 + font-size >= 18px (large-text rule — 3:1 suficient). Decizie necesara inainte de production.
- [ ] A11Y — Contrast footer text (`--stone-500`) — text muted footer pe `--stone-900`/`--stone-950` = 4.0:1 (sub 4.5:1). Afecteaza `.footer-top h5`, `.news-consent`, `.trust-item span`, `.footer-bot` (design-system.css:210,225,234,245). Optiuni: (1) Swap `var(--stone-500)` -> `var(--stone-400)` in cele 4 selectoare; (2) Token nou `--fg-muted-on-dark: var(--stone-400)`. Decizie necesara inainte de production.
