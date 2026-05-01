# Items blocate — dependențe externe

Acestea NU blochează lansarea — avem plan B pentru fiecare. Dar trebuie urmărite activ.

## De la Andrei Rinzis

### XLS-uri prețuri + greutăți (URGENT — blochează ziua 1)
- **Ce:** 6 fișiere Excel din emailurile 22-29 apr
- **Unde:** ciprian.dobrea@gmail.com (5 emailuri cu atașamente)
- **Plan B:** dacă nu le primim prin altă cale, Ciprian le descarcă manual din Gmail
- **Action:** pune-le în `docs/preturi/` când le ai

### Decizie POMPĂ CU APĂ
- **Ce:** produs în categoria "MESE DE TĂIAT" — trebuie reasignat sau șters
- **Categorie propusă:** "Accesorii" sau "Consumabile"
- **Plan B:** reasignăm la "Accesorii" și corectăm ulterior
- **Deadline:** ziua 1 cleanup

### ardmag.ro domeniu
- **Ce:** domeniu `.ro` recomandat, 70 lei/an
- **Unde:** orice registrar RO (RoTLD, ROTLD.ro, Go Daddy RO)
- **Plan B:** lansăm pe ardmag.surmont.co / ardmag.com, mutăm domeniu când e cumpărat
- **Status:** necumpărat (confirmat 30 apr WhatsApp)

### Credentiale SelfAWB Fan Courier
- **Ce:** username + password + client ID pentru API Fan Courier
- **Cine:** Andrei sau Anca Dima (Delta Research) — au contract activ
- **Plan B:** modul Fan Courier gata, fallback shipping static (Fan Courier 19.99 RON)
- **Email de trimis:** vezi `fan-courier-email.md`

## De la Cristian Rinzis

### Stripe LIVE keys
- **Ce:** `STRIPE_API_KEY` (sk_live_...) + `NEXT_PUBLIC_STRIPE_KEY` (pk_live_...)
- **Plan B:** lansăm cu Stripe TEST, zero cod de schimbat când vin live keys
- **Update:** setare în Railway + env storefront (2 variabile)

## De la sora lui Andrei (Mara)

### Instagram admin
- **Ce:** acces admin la contul Instagram existent
- **Plan B:** skip Insta la lansare, focus exclusiv pe FB
- **Priority:** low — nu blochează nimic

## Intern — de confirmat

### Google Analytics / FB Pixel IDs
- **Ce:** Ciprian creează property GA4 + pixel FB din contul aibaza.ro
- **Nu necesită de la Andrei:** Ciprian are admin pe pagina FB + Google

### Stripe Webhook Secret
- **Ce:** `whsec_...` din Stripe Dashboard după configurare endpoint
- **Action:** configurare webhook în Stripe Dashboard după ce Stripe e live

---

## Status urmărire

| Item | Responsabil | Status | Urgență |
|---|---|---|---|
| XLS-uri prețuri+greutăți | Ciprian (din Gmail) | ⏳ | ZIUA 1 |
| Decizie POMPĂ CU APĂ | Andrei | ⏳ | Ziua 1 |
| ardmag.ro domeniu | Andrei | ⏳ | Post-lansare |
| SelfAWB credentials | Andrei/Anca | ⏳ | Ziua 2-3 |
| Stripe LIVE keys | Cristian | ⏳ | Ziua 2-3 |
| Insta admin | Mara | ⏳ | Post-lansare |
| GA4 property | Ciprian | 📋 | Ziua 3 |
| FB Pixel | Ciprian | 📋 | Ziua 3 |
| Stripe Webhook | Ciprian | 📋 | Ziua 2 |
