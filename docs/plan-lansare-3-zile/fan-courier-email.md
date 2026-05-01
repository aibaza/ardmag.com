# Draft email — Solicitare credentiale SelfAWB (Fan Courier)

**De trimis de:** Ciprian Dobrea sau Andrei Rinzis (preferabil din contul ARC ROM DIAMONDS)

**Către:** customer@fancourier.ro
**CC:** presales@fancourier.ro
**Subiect:** Solicitare credentiale SelfAWB pentru integrare API — ARC ROM DIAMONDS SRL

---

## Text email

Buna ziua,

Va contactez in legatura cu integrarea API Fan Courier pentru site-ul ardmag.com, magazinul online al firmei **ARC ROM DIAMONDS SRL** (CUI 13828707, Calea Baciului 1-3, Cluj-Napoca 400230).

Avem contract activ de curierat Fan Courier. In iulie 2025, colega noastra Anca Dima (anca@deltaresearch.it, Delta Research Division) a contactat Fan Courier pentru documentatia API, documentatie pe care am primit-o si am studiat-o (versiunea API 2.0, martie 2025).

Acum suntem in faza de implementare a integrarii API si avem nevoie de urmatoarele date pentru contul nostru contractual:

1. **Username si parola SelfAWB** (pentru autentificare la `POST https://api.fancourier.ro/login`)
2. **Client ID** (ID-ul sucursalei noastre — necesar in toate apelurile API)

Vom folosi API-ul pentru:
- Calculul automat al costului de livrare la finalizarea comenzilor (`GET /reports/awb/internal-tariff`)
- Generarea automata a AWB-urilor la confirmarea comenzilor (`POST /intern-awb`)
- Plasarea comenzilor zilnice de ridicare (`POST /order`)
- Tracking AWB (`GET /reports/awb/tracking`)

Volumul estimat in primele luni: **5-20 AWB/zi**, serviciu **Standard**, plata la expeditor.

Va asiguram ca vom respecta toate cerintele tehnice din documentatie (inclusiv caching-ul token-ului de 24h).

Va rugam sa ne transmiteti credentialele la adresa **dc@aibaza.ro** sau direct la **rinzis.andrei@yahoo.com**.

Va multumesc,

Ciprian Dobrea
Dezvoltator web — ardmag.com
dc@aibaza.ro

In numele:
**ARC ROM DIAMONDS SRL**
Calea Baciului 1-3, Cluj-Napoca 400230
Tel: +40 722 155 441
Contact Andrei Rinzis: rinzis.andrei@yahoo.com

---

## Note pentru trimitere

- Dacă trimite **Andrei** (mai credibil ca reprezentant firmă): adaptează "Va contactez" → "Va contactam" și scoate paragraful "In numele"
- Dacă trimite **Ciprian**: emailul e complet ca mai sus
- Atașează `docs/RO_FANCourier_API_030625.pdf` pentru context (dovedește că am studiat documentația)
- Răspunsul vine de obicei în 1-2 zile lucrătoare de la `selfawb@fancourier.ro`

## Ce facem cu credentialele când vin

1. Adaugă în Railway:
   ```
   FAN_COURIER_USERNAME=<username_selfawb>
   FAN_COURIER_PASSWORD=<parola_selfawb>
   FAN_COURIER_CLIENT_ID=<client_id_numeric>
   ```
2. Testează autentificarea:
   ```bash
   curl -X POST "https://api.fancourier.ro/login?username=X&password=Y"
   ```
3. Railway redeploy automat → modul Fan Courier se activează
4. Test calcul tarif cu o adresă București:
   ```bash
   curl -H "Authorization: Bearer TOKEN" \
   "https://api.fancourier.ro/reports/awb/internal-tariff?clientId=ID&info[service]=Standard&info[payment]=expeditor&info[weight]=2&info[packages][parcel]=1&recipient[county]=Ilfov&recipient[locality]=Buftea"
   ```
