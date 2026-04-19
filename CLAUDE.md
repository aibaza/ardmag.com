# ardmag.com — CLAUDE.md

## Context proiect

ardmag.com este magazinul propriu al aiBaza pentru scule și consumabile destinate prelucrării pietrei naturale. Site-ul actual rulează pe Wix. Proiectul migrează pe **Medusa v2** (backend) + **Next.js** (storefront), self-hosted, cu dev inițial pe localhost.

Companie: prezentă pe piață din 2001, cel mai mare distribuitor Tenax din România. Contact: +40 722 155 441, office@arcromdiamonds.ro, Calea Baciului 1-3, Cluj-Napoca 400230.

---

## Două track-uri paralele

**Track A — Implementare (tu, Claude Code):** bootstrap Medusa v2, import catalog din CSV, API-uri, admin, logică de business, deploy pe localhost. Acesta este track-ul tău.

**Track B — Design (Ciprian cu Claude prin artifacts):** UI/UX complet nou pornind de la logo + tagline "PRECIZIE SOLIDĂ" cu paleta slate/grey. Outputul din track-ul B ajunge în `resources/design/` sub formă de design tokens, componente HTML/React de referință și/sau screenshot-uri.

**Tu NU inventezi design.** Nicio decizie vizuală (culori, fonturi, spacing, layout, componente) nu se ia fără input din track-ul B. Dacă ai nevoie de o decizie vizuală pentru ca ceva să funcționeze, marchezi cu `// DESIGN PENDING: <ce aștepți>` în cod și adaugi o linie în `docs/design-pending.md`. Storefront-ul rulează pe template-ul oficial Next.js starter Medusa (neutru, nestilizat) până la livrarea designului.

## Sursă de adevăr pentru design -- OBLIGATORIU

**Design System-ul finalizat se află în `resources/design/`.** Fișierele HTML din acest folder sunt sursele unice de adevăr pentru orice decizie vizuală. Nu interpreta, nu simplifici, nu "îmbunătățești" -- implementezi exact ce e acolo.

**Fișiere de referință obligatorii (în ordine):**
- `Design System 04 - Chrome & Homepage.html` -- header (3 straturi), footer, homepage asamblat complet (hero, quick-cats, grile produse, trust banner, supplier strip). **Secțiunea 04** din acest fișier = sursă de adevăr pentru homepage.
- Orice alt fișier din `resources/design/` are aceeași autoritate pentru secțiunea sa.

**Reguli de implementare:**
1. Înainte să scrii orice componentă de UI, citești fișierul HTML de referință corespunzător.
2. Copiezi CSS tokens, clase, structură HTML exact -- nu le reinterpretezi.
3. Dacă există conflict între ce ai implementat anterior și design system, design system-ul câștigă.
4. Dacă o secțiune nu e acoperită de niciun fișier din `resources/design/`, marchezi `// DESIGN PENDING` și nu inventezi.

---

## Reguli absolute de migrare — nu negociabile

1. **1 produs Wix = 1 produs Medusa.** Nu se generează produse separate pentru variații. Rezultat final în admin: exact 90 de carduri de produs, nu mai mult.

2. **Variantele sunt rânduri sub produs.** Dacă un produs are 360 de combinații generate din care 40 sunt active, în Medusa va avea 40 de variante sub același produs.

3. **Importăm doar variantele active.** Din CSV: 775 `visible=true` din 2163. Cele 1388 cu `visible=false` nu se importă deloc.

4. **Produsele fără variante în Wix (30 din 90)** primesc în Medusa o variantă default internă (titlu "Default", fără opțiuni vizibile). Aceasta este o cerință a modelului Medusa, nu o opțiune vizibilă clientului.

5. **Migrare fidelă în Faza 1, optimizări în Faza 2+.** Nu restructurăm catalogul la import. Notăm în `docs/` orice problemă de structură și decidem separat.

6. **Niciun design nu se inventează.** (Repetat intenționat.)

---

## Structura de foldere

```
ardmag.com/
├── CLAUDE.md                    # acest fișier
├── docs/
│   ├── 01-catalog-analysis.md  # analiza CSV Wix
│   ├── 02-site-analysis.md     # analiza site live
│   ├── 03-wix-to-medusa-mapping.md  # mapare câmp cu câmp
│   ├── 04-implementation-plan.md   # plan pe faze
│   └── design-pending.md       # decizii vizuale în așteptare
├── resources/
│   ├── Wix Products Catalog.csv  # exportul Wix, sursă de adevăr pentru catalog
│   ├── logo designs.png           # brand identity (logo + tagline + paletă)
│   ├── aibaza_content_guidelines.md  # (urmează să fie adăugat)
│   └── design/                  # OUTPUT din track-ul B (design tokens, componente, screenshots)
├── backend/                     # Medusa v2 app
├── backend-storefront/          # Next.js starter storefront
└── scripts/
    └── import-wix-catalog.ts    # script de import CSV → Medusa (creat în Faza 1)
```

---

## Convenție DESIGN PENDING

Ori de câte ori o decizie de UI/UX nu are încă input din track-ul B:

**În cod:**
```tsx
// DESIGN PENDING: card produs — layout, hover state, badge reducere
```

**În `docs/design-pending.md`:** adaugă un rând cu `- [ ] Componentă: <ce element> — <ce decizie se așteaptă>`

---

## Convenții de cod

- **TypeScript strict** — `"strict": true` în tsconfig
- **Prettier** — config default Medusa/Next.js
- **ESLint** — config default din fiecare framework
- **Fără comentarii decorative** — comentariile doar pentru WHY non-obvious sau DESIGN PENDING
- **Fără em dash** în cod, copy sau docstrings — folosește cratimă (`-`) sau două cratime (`--`)

---

## Copy integrity -- regulă absolută

Zero copy inventat pe ardmag.com. Toate textele afișate utilizatorului vin din surse autorizate:
1. Medusa API (date dinamice)
2. ardmag.com actual (copy verificat)
3. Date business confirmate (vezi secțiunea dedicată mai jos)
4. Labels UI standard

Dacă lipsește copy pentru o secțiune, lasă spațiul gol sau folosește tagline-ul aprobat. Nu inventezi slogans, nu inventezi beneficii, nu inventezi promises (livrare X ore, garanție Y zile, etc.).

---

## Date business confirmate pentru copy

- 25 ani experiență
- Distribuitor autorizat Tenax România
- Distribuție în 12-18 țări
- Cluj-Napoca, Calea Baciului 1-3, 400230
- +40 722 155 441
- office@arcromdiamonds.ro
- Livrare gratuită peste 500 RON
- Promoție -30% Mastici Tenax (aplicată la checkout)
- Tagline: "25 DE ANI. LA MILIMETRU."
- Mark logo: "PRECIZIE SOLIDĂ"
- Furnizori: Tenax, Sait, Woosuk, Diatex, Fox Ironstone, VBT, Delta Research
- ANPC link prezent pe toate paginile

---

## Reguli de copy (aplicabile în toate textele de pe site și în produse)

- Fără em dash (`—`) — folosit ca separator în titluri sau text de produs e nepotrivit pentru tonul site-ului
- Fără corporate speak și filler (`soluție completă`, `de calitate superioară`, `conform celor mai înalte standarde`)
- Ton direct și ferm — spune ce face produsul, nu ce sentimente trebuie să trezească
- Fără bullet points goale sau titluri fără conținut real
- Dacă există `resources/aibaza_content_guidelines.md`, el are prioritate față de regulile de mai sus

---

## Convenții commit

Format: [Conventional Commits](https://www.conventionalcommits.org/)

```
feat: adaugă script de import catalog Wix
fix: corectează calculul prețului pentru surcharge gol
docs: actualizează 04-implementation-plan cu Faza 5
refactor: extrage logica de construire URL imagini
chore: configurare ESLint pentru workspace
```

---

## Comenzi utile dev

```bash
# Backend Medusa
cd backend
npm run dev          # pornește pe localhost:9000

# Migrații
npx medusa migrations run

# Seed (date de test)
npx medusa seed --seed-file ./data/seed.json

# Storefront Next.js
cd storefront
npm run dev          # pornește pe localhost:8000

# Script de import catalog
cd scripts
npx ts-node import-wix-catalog.ts
```

---

## Plugin-uri Claude Code de instalat

```
/plugin marketplace add medusajs/medusa-claude-plugins
/plugin install medusa-dev@medusa
```

---

## Documentație de referință

- [01 — Analiză Catalog Wix](docs/01-catalog-analysis.md)
- [02 — Analiză Site Live](docs/02-site-analysis.md)
- [03 — Mapare Wix → Medusa v2](docs/03-wix-to-medusa-mapping.md)
- [04 — Plan de Implementare](docs/04-implementation-plan.md)
