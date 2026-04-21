# Raport Audit Brand — ardmag.com
**Data:** 21 aprilie 2026  
**Realizat de:** SurCod (analiză automată pe baza CSV Wix + Medusa API)  
**De revizuit de:** Andrei Rînziș

---

## Rezumat

Sistemul de tag-uri brand din noul site a atribuit etichetele **Tenax** sau **Delta Research** pe baza textului din descrieri. Logica a greșit pentru 15 produse: le-a marcat ca **Tenax** deși sunt **Delta Research**.

Sursa de adevăr folosită pentru verificare: produsele agregate "SOLUȚII TENAX" și "SOLUȚII DELTA" din CSV-ul Wix — care listau explicit care variante aparțin fiecărui brand.

---

## Produse cu brand greșit (brand:tenax → trebuie brand:delta-research)

Acestea sunt produse **Delta Research** afișate momentan cu eticheta **Tenax** pe site:

| # | Produs | Situație actuală | Situație corectă |
|---|--------|-----------------|-----------------|
| 1 | ECO DRY+ | brand: Tenax ❌ | brand: Delta Research |
| 2 | ECO STONE PRO | brand: Tenax ❌ | brand: Delta Research |
| 3 | ECO TONER | brand: Tenax ❌ | brand: Delta Research |
| 4 | WET SEAL | brand: Tenax ❌ | brand: Delta Research |
| 5 | TOTAL BLACK | brand: Tenax ❌ | brand: Delta Research |
| 6 | SILWAX | brand: Tenax ❌ | brand: Delta Research |
| 7 | DE GRAUB | brand: Tenax ❌ | brand: Delta Research |
| 8 | TERGON | brand: Tenax ❌ | brand: Delta Research |
| 9 | SOLVENTE GAMMA | brand: Tenax ❌ | brand: Delta Research |
| 10 | MAC MUD | brand: Tenax ❌ | brand: Delta Research |
| 11 | CLEAN STONE | brand: Tenax ❌ | brand: Delta Research |
| 12 | STONE WET | brand: Tenax ❌ | brand: Delta Research |
| 13 | RES 1001 | brand: Tenax ❌ | brand: Delta Research |
| 14 | PROLUX | brand: Tenax ❌ | brand: Delta Research |
| 15 | SABBIATORE AX/F | brand: Tenax ❌ | brand: Delta Research |

---

## Produse cu brand corect (nu necesită modificare)

### Tenax ✅
MASTIC LICHID, MASTIC SEMISOLID WET, MASTIC SEMISOLID, TIXO XE TRANSPARENT, MASTIC SOLID, MASTIC THASSOS, GLAXS EASY, ÎNTĂRITOR MASTIC, SET PIGMENȚI, GRAVITY SOLID EXTRA CLEAR, STRONGEDGE 45 EPOXY SOLID TRANSPARENT, RIVO EPOXY SOLID, FIXTOP EPOXY SOLID, TITANIUM SOLID TRANSPARENT, APLICATOR FAST GLAXS, FAST GLAXS GLUE CARTUȘ, KIT COLLA GLAXS TRANSPARENT, ELIOX EPOXY SOLID EXTRA CLEAR, DOMO 10 EPOXY SOLID, SET ADEZIV PROFESIONAL + DECAPANT

**Soluții Tenax corect clasificate:** HYDREX, AGER, PROSEAL, PROSEAL FS, TONER BLACK, SKUDO

### Delta Research ✅ (deja corect)
IDROREP, NANO WET, QUASAR, SEAL

---

## Produse fără brand setat (de discutat)

Aceste 34 de produse nu au niciun brand asociat — sunt în general discuri, abrazivi, echipamente, consumabile de la furnizori terți (Sait, Woosuk, Diatex, Fox, VBT). Câteva ar putea fi Delta Research sau Tenax:

| Produs | Observație |
|--------|-----------|
| DETERGENȚI | Pot fi Delta Research — confirmare necesară |
| DETERGENȚI ACIZI | Pot fi Delta Research — confirmare necesară |
| IMPERMEABILIZANȚI PE BAZĂ DE APĂ | Pot fi Delta Research — confirmare necesară |
| IMPERMEABILIZANȚI PE BAZĂ DE SOLVENȚI | Pot fi Delta Research — confirmare necesară |
| ÎNTREȚINERE ȘI CERURI | Pot fi Delta Research sau Tenax — confirmare necesară |
| TRATAMENTE SPECIFICE | Pot fi Delta Research sau Tenax — confirmare necesară |
| ACID OXALIC | Furnizor? |
| CERAMASTER 3 STEP | Furnizor? |
| Restul (discuri, abrazivi, scule) | Alte branduri (Sait, Woosuk, Diatex etc.) — OK fără brand tag |

---

## Acțiune propusă

**Andrei, te rog să confirmi că cele 15 produse din tabelul de mai sus sunt corect identificate ca Delta Research** (sau să marchezi dacă vreunul e de fapt Tenax).

Dacă OK, rulăm scriptul de corecție care schimbă automat tag-urile pe site. Durează ~2 minute.

Dacă ai clarificări și pentru produsele fără brand (DETERGENȚI, IMPERMEABILIZANȚI etc.), le adăugăm în același timp.

---

## Metodologie

Analiza a folosit:
1. CSV-ul Wix (`resources/Wix Products Catalog.csv`) — sursa de adevăr pentru care variante aparțin "SOLUȚII TENAX" vs "SOLUȚII DELTA"
2. Medusa API (`/store/products`) — starea curentă a tag-urilor pe site
3. Cross-referință: produsele desfăcute în site ca produse individuale (ECO DRY+, SILWAX etc.) mapate la produsele agregate originale din Wix

Tag-urile brand sunt vizibile pe site la fiecare produs (card + pagina produsului), sub titlu.
