# Email Andrei -- 4 mai 2026

## Ce s-a facut azi

**Catalog (productie Railway):**
- Stocul setat nelimitat pe toate produsele (923 variante) -- clientii nu vor vedea "Epuizat".
- Greutatile si preturile din XLS-uri confirmate corecte in productie (aplicate intr-o sesiune anterioara). Aplicare repetata azi pentru siguranta -- 708 randuri confirmate.
- 5 produse noi (SAITRON 125, SAITRON 180, SAITRIS 180, EK WIENNER, SUPORT VELCROPAD) activate in canal de vanzari -- apareau pe site fara imagini.
- Bug fix: SAITRIS 180 nu putea fi adaugat in cos -- rezolvat.
- Imagini generate automat pentru 179 produse noi (variante thumbnail/large pentru Cloudflare R2).

**Site si infrastructura:**
- Banner avertizare adaugat in checkout: "Plata cu cardul este in modul TEST. Pentru comenzi reale, alege Ramburs la livrare."
- ardmag.ro live pe Vercel, api.ardmag.ro live pe Railway. DNS configurat corect.
- Facebook page: confirmat setat.
- ardmag.com: nameservere schimbate in persoana cu Andrei (ramane de facut).

**Research descrieri produse:**
- Am cercetat 22 de produse fara descriere. Texte gata de importat pentru 16 din ele (in docs/content/).

---

## Ce mai ramane de facut

**Urgent (maine, 5 mai):**
- Configurare webhook Stripe sandbox (pentru confirmarea platilor cu cardul in mod test)
- Verificare DKIM/SPF pentru ardmag.ro in SMTP2GO (ca emailurile de comanda sa nu ajunga in Spam)
- Test email complet: comanda plasata -> email primit la comenzi@ardmag.ro si la client

**Ziua 3 (6 mai):**
- GA4 + Facebook Pixel -- avem nevoie de ID-uri de la voi (vezi mai jos)
- Verificare finala E2E: comanda test Ramburs + comanda test card
- Import descrieri produse in DB

**Post-lansare:**
- Stripe LIVE keys de la Cristian -> platile cu cardul devin reale
- Fan Courier credentials -> AWB automat
- ardmag.com nameservere cu Andrei in persoana

---

## Ce avem nevoie de la Andrei

1. **Google Analytics ID (GA4)** -- format: G-XXXXXXXXXX

2. **Facebook Pixel ID** -- format: numar de 15-16 cifre

3. **Imagini corecte SAITRON 125 si SAITRON 180** -- ambele afiseaza poza unui pad de cauciuc (SAITAC-PAD) in loc de discul abraziv SAITRON. Trimite imaginile si le uploadam noi, sau le inlocuiesti direct in admin Medusa.

4. **POTEN pret** -- dupa actualizarea din XLS: POTEN MARMURA = 108 RON (era 540 RON), POTEN GRANIT = 83 RON (era 415 RON). XLS-ul pare sa aiba pretul per bucata. Care e pretul corect de afisat?

5. **Produse ascunse (draft)** -- urmatoarele nu apar pe site. Confirma care raman ascunse si care trebuie publicate:
   DISCURI ORIZONTALE MARMURA/ANDEZIT, FIR DIAMANTAT, MASA DE TAIAT, MASTIC POLIESTERIC, POMPA CU APA, PROSEAL FS, SOLUTII DELTA, SOLUTII TENAX, TITANIUM SOLID TRANSPARENT, DISCURI MARMURA SI ANDEZIT TOLA SECOND

6. **Imagini Woosuk** -- dischete K-series, carote, burghie nu au imagini oficiale online. Catalog PDF sau pack imagini de la Arcrom Diamonds.

7. **Credentiale Fan Courier SelfAWB** -- username, password, client ID.

8. **Descrieri produse (6 intrebari specifice):**
   a. CERAMASTER 3 STEP -- cine e producatorul? Nu apare in catalogul Tenax/Fox/altii.
   b. MATERIAL DEZANCRASANT -- e acelasi produs cu De Graub (Delta Research)?
   c. CREION -- e creion diamantat pentru rectificat, sau altceva?
   d. SABBIATORE AX/F -- exista un Sabbiatore F distinct fata de AX?
   e. MAC MUD -- disponibil in 1L pentru Romania? (site Delta il are doar 5L/10L)
   f. INTARITOR MASTIC -- MIC/MEDIU/MARE = ce ml/grame exact?

9. **Cheile Stripe LIVE** (sk_live_, pk_live_) de la Cristian -- pentru activarea platilor reale cu cardul.

---

## Nota tehnica (pentru Ciprian)

Infrastructura productie confirmata:
- Frontend: Vercel (ardmag.ro)
- Backend: Railway (api.ardmag.ro) -- Medusa v2
- DB: Railway Postgres (postgres.railway.internal) -- NU localhost
- Redis: Railway Redis -- activ si folosit de Medusa
- Imagini: Cloudflare R2 (pub-28d7a4f80d924560ae8c2fe111240e4a.r2.dev)

Script actualizare preturi+greutati: scripts/update-all-prices-weights.ts
Rulat cu --apply aplica pe Railway via tunnel. Idempotent.
