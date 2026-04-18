# Catalog Issues

Probleme din catalog care necesită intervenție manuală. Bifează când rezolvat.

---

## Prioritate mare — blochează vânzarea

- [ ] **FIR DIAMANTAT** — price=0, zero variante în CSV. Importat ca `draft`. De completat prețul și variantele înainte de publicare.

- [ ] **PAD POLIMASTER + HEX — varianta PAD POLIMASTER HEX / 17" / STEP 3** — variantă activă (`visible=true`) cu surcharge gol. Importată cu preț 0 RON. De completat prețul corect.

---

## Prioritate medie — afectează calitatea listingului

- [ ] **24 produse fără descriere** — câmpul `description` este gol în CSV. Produsele sunt importate și publicate, dar pagina de produs va arăta incomplet. Lista completă:
  - MASTIC SEMISOLID
  - DISCHETE DE ȘLEFUIT DIAMANTATE
  - ÎNTĂRITOR MASTIC
  - DISCURI SPECIALE
  - DISCURI DE ANDEZIT
  - DISCURI DE GRANIT
  - DISCURI ORIZONTALE DE MARMURĂ ȘI ANDEZIT
  - DISCURI MARMURĂ
  - POMPĂ CU APĂ
  - MASĂ DE TĂIAT
  - SUPORT FRANKFURT
  - CREION
  - BATON
  - MATERIAL DEZANCRASANT
  - ABRAZIVI ANELLI
  - ABRAZIVI TANGENȚIALI
  - BURGHIU
  - PAD CAUCIUC
  - CAROTE DIAMANTATE
  - ABRAZIVI OALĂ
  - ÎNTREȚINERE ȘI CERURI
  - DETERGENȚI ACIZI
  - DETERGENȚI
  - TRATAMENTE SPECIFICE

---

## Prioritate mică — de rezolvat înainte de lansare producție

- [ ] **Niciun produs nu are SKU** — SKU-urile sunt generate sintetic la import (`{handle}-{index}`). De înlocuit cu SKU-uri reale dacă există un sistem de coduri interne.

- [ ] **Promoție MASTICI TENAX -30%** — ribbon "PROMO 30%" pe 13 produse în CSV, dar `discountValue=0`. Reducerea nu e exportată. De creat manual ca promoție Medusa după import.

- [ ] **SET ADEZIV PROFESIONAL + DECAPANT** — discount FIXED_AMOUNT 332 RON în Wix. De recreat manual ca price rule în Medusa.

- [ ] **Reduceri la cantitate (tier pricing)** — 3 produse (ABRAZIVI OALĂ, DISCURI DE ȘLEFUIT CU CARBURĂ, DISCHETE DE ȘLEFUIT CU CARBURĂ) au tabel de reduceri la volum în câmpul `additionalInfo`. Importate ca text/metadate în Faza 1. Logică automată de tier pricing — Faza 2+.

- [ ] **Thumbnail-uri duplicate** — același ID de imagine (`db3b5a_e4d15fb0361348d0be47457443e6a42e~mv2.jpg`) apare la multiple produse. De înlocuit cu imagini individuale per produs.
