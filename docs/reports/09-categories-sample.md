# 09 - Categories Structure & Design Samples

Generated: 2026-04-19
Source: Medusa Admin API `http://localhost:9000`

---

## 1. Lista categoriilor Medusa

9 categorii, toate la nivel root (fara parinte). Nicio categorie nu are subcategorii.

| # | ID | Nume | Handle | Produse | Parent |
|---|-----|------|--------|---------|--------|
| 1 | pcat_01KPH38363237QETEA2S26ZDN0 | MASTICI TENAX | mastici-tenax | 20 | - |
| 2 | pcat_01KPH383SVDBH60EZM36CEBRKY | SOLUȚII PENTRU PIATRĂ | solutii-pentru-piatra | 33 | - |
| 3 | pcat_01KPH3843PNS7C9ZGXHE72ND2Z | DIVERSE | diverse | 13 | - |
| 4 | pcat_01KPH384DGCVZX1QRDNMJ1CHYE | ȘLEFUIRE PIATRĂ | slefuire-piatra | 10 | - |
| 5 | pcat_01KPH384QDM0G3QXCG9WBZN9K3 | DISCURI DE TĂIERE | discuri-de-taiere | 7 | - |
| 6 | pcat_01KPH385BHEVFKPH5PH0G4008C | ABRAZIVI ȘI PERII | abrazivi-si-perii | 3 | - |
| 7 | pcat_01KPH3851NZYN18KMB5MVQG5JY | MESE DE TĂIAT | mese-de-taiat | 2 | - |
| 8 | pcat_01KPH383FZK9KPHRYV3KABM101 | PACHETE PROMOȚIONALE | pachete-promotionale | 1 | - |
| 9 | pcat_01KPH385NC9FC21JWAM6QA8V10 | ABRAZIVI OALĂ | abrazivi-oala | 1 | - |

**Total: 90 produse, 805 variante active**

---

## 2. Sample JSON per categorie

Fisierele complete se afla in acelasi director:
- `docs/reports/sample-category-large.json` — SOLUȚII PENTRU PIATRĂ (33 produse)
- `docs/reports/sample-category-medium.json` — DISCURI DE TĂIERE (7 produse)
- `docs/reports/sample-category-small.json` — MESE DE TĂIAT (2 produse)

### Structura JSON (format identic pentru toate 3)

```json
{
  "category": {
    "id": "pcat_...",
    "name": "DISCURI DE TĂIERE",
    "handle": "discuri-de-taiere",
    "description": "",
    "is_active": true,
    "is_internal": false,
    "rank": 5,
    "parent_category_id": null,
    "created_at": "...",
    "updated_at": "...",
    "metadata": null,
    "category_children": []
  },
  "product_count": 7,
  "products": [
    {
      "id": "prod_01KPH3QNX3SR0632PMKQ33R6AK",
      "title": "DISCURI MARMURĂ ȘI ANDEZIT TOLA SECOND",
      "handle": "discuri-marmura-si-andezit-tola-second",
      "status": "published",
      "thumbnail": "/static/images/discuri-marmura-si-andezit-tola-second/db3b5a_31c4770e784f40dab2c8aae029b99c86.jpg",
      "variant_count": 6,
      "price_min_ron": 2862.0,
      "price_max_ron": 4076.0,
      "options": {
        "TIP PIATRĂ": ["ANDEZIT", "MARMURĂ"],
        "DIAMETRU": ["1000", "1100", "1200"]
      }
    }
  ]
}
```

### Note structura produse

**Produse cu varianta default (`Title: Default Title`):** 8 produse in SOLUȚII PENTRU PIATRĂ sunt importate ca produs standalone fara optiuni vizibile (Medusa necesita cel putin o varianta). Acestea sunt produse cu un singur SKU in Wix.

**Produse bundle cu optiunea DENUMIRE:** 8 produse sunt colectii/familii de produse cu denumirea individuala ca optiune de varianta (ex: SOLUȚII DELTA cu 36 variante — CLEAN STONE, DE GRAUB, ECO DRY+, ...). Aceasta e structura importata direct din CSV Wix.

---

## 3. Filtre tehnice disponibile per categorie

### SOLUȚII PENTRU PIATRĂ (33 produse)

```
SOLUȚII PENTRU PIATRĂ
├── CANTITATE: 1 LITRU, 5 KG, 5 LITRI, 700 GRAME
└── DENUMIRE: AGER, CLEAN STONE, DE GRAUB, ECO DRY +, ECO STONE PRO, ECO TONER,
              HYDREX, IDROREP, MAC MUD, NANO WET, PROLUX, PROSEAL, PROSEAL FS,
              QUASAR, REFLEX NERA, REFLEX NEUTRĂ, RES 1001, SABBIATORE AX/F,
              SEAL, SILWAX, SKUDO, SOLVENTE GAMMA, STONE WET, TERGON,
              TONER BLACK, TOTAL BLACK, WET SEAL
              (27 valori unice — din produsele bundle)
```

**Observatie filtre:** DENUMIRE e o optiune de varianta interna (identifica sub-produsul in pachetele bundle), nu un filtru util vizitatorului. Filtrele utile pentru design ar fi probabil: **CANTITATE** si eventual **TIP UTILIZARE** (daca se adauga ca metadata).

---

### DISCURI DE TĂIERE (7 produse)

```
DISCURI DE TĂIERE
├── DIAMETRU (mm): 100, 115, 125, 180, 200, 230, 250, 300, 350, 400, 450, 500,
│                  600, 625, 650, 700, 800, 900, 1000, 1100, 1200, 1300, 1600,
│                  1800, 2000
│                  (25 valori — disc mic 100mm pana la disc mare 2000mm)
├── TIP PIATRĂ: ANDEZIT, DISC GRANIT, DISC MARMURĂ, MARMURĂ
├── CATEGORIE: NOU, REPASTILAT, SILENȚIOS
├── TIP DISC: CURB, ELECTROPLATED, TURBO, TURBO CURB, TURBO EXTRA CLASS, VANITY
├── FIXARE DISC: CU FLANȘĂ, FĂRĂ FLANȘĂ
└── SPECIALIZARE: CERAMICĂ, CERAMICĂ CC, CERAMICĂ DD, CERAMICĂ DM,
                  CERAMICĂ PROFILAT, DC, DEKTON NOU, DEKTON REPASTILAT,
                  DEKTON SILENȚIOS, EDGE DRY, GRESIE, GRESIE SB,
                  HARD CERAMIC, HD, LT39K, SILENȚIOS TLS
                  (16 valori)
```

**Filtre utile pentru pagina de categorie:** DIAMETRU + TIP PIATRĂ + CATEGORIE (NOU/REPASTILAT/SILENȚIOS). TIP DISC si SPECIALIZARE pot fi filtre secundare (accordion collapse).

---

### MESE DE TĂIAT (2 produse)

```
MESE DE TĂIAT
├── MODEL MASĂ: MS, SW
├── LUNGIME TĂIERE (cm): 60, 80, 100, 125, 150, 200
├── TIP POMPĂ: S2, S3
└── CABLU: CABLU LUNG, CABLU SCURT
```

---

## Comanda de regenerare

```bash
# Necesita backend pornit pe localhost:9000
TOKEN=$(curl -s -X POST http://localhost:9000/auth/user/emailpass \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ardmag.com","password":"Admin1234!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

# Categorii + numar produse
curl -s "http://localhost:9000/admin/product-categories?limit=100" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# Produse dintr-o categorie
curl -s "http://localhost:9000/admin/products?limit=100&category_id[]=pcat_01KPH384QDM0G3QXCG9WBZN9K3" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```
