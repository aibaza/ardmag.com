# Cargus în producție — runbook, 24 noiembrie 2026

Ramura: `fix/cargus-cotatie-20261124`. Credențialele nu apar aici: API key și utilizatorul `ardmag.api` sunt în 1Password (item Cargus, vault „aiBaza Ops”), câmpurile `credential`, `u2`, `p2`.

## Pe scurt

Codul și opțiunea sunt verificate pe staging, cu cotații reale Cargus. Producția nu a fost atinsă. Pentru activare urmează pașii de mai jos, în ordine. Regula care contează: storefront-ul nou (cel care recotează la plată) trebuie să fie live înainte să existe opțiunea Cargus; altfel clientul cu Cargus + ramburs primește eroarea de nepotrivire la plată.

## Ce face livrarea acum

- Fan Courier și Cargus acceptă amândouă cardul (Stripe) și rambursul.
- Cargus cotează live, cu grila contractului `293764`. La ramburs, cotația include comisionul Cargus (12 lei + 2% din suma încasată, fără TVA), calculat pe suma încasată reală: produse + transport.
- Modul de plată cu care s-a cotat Cargus stă pe metoda de livrare a coșului (`shipping_method.data.payment`). Pagina de plată recotează înainte de a crea sesiunea de plată. Serverul refuză sesiunea și finalizarea dacă plata aleasă nu se potrivește cu cotația, cu mesaj clar pentru client.
- De la 500 lei produse, livrarea e gratuită la ambii curieri, fără apel la API (neschimbat).
- Dacă API-ul nu răspunde: tarif de rezervă pe greutate, PROVIZORIU, rotunjit în sus, din probele live (`backend/src/modules/fulfillment-cargus/lib/fallback-tariff.ts`). După erori de login, 5xx, 401/403/429 sau timeout, Cargus nu mai e apelat 60 s, cu dublare până la 10 min. Bugetul de 6 s pe cotație rămâne.
- Adrese: județul e obligatoriu, fără Cluj implicit. Diacriticele, spațiile din „Cluj - Napoca”, prefixele „Mun.”, „Jud.”, „RO-” și sectoarele Bucureștiului sunt normalizate, la Cargus și la Fan.
- Ridicarea personală nu se schimbă.

## Verificat pe staging (24.11)

Cotații Store API, toate `source=cargus-api` în loguri, cu excepția localității inexistente:

| Coș | Fan | Cargus card | Cargus ramburs |
|---|---|---|---|
| București, 2 × Mastic lichid redus (128 lei) | 23,45 | 45,54 | 64,72 |
| Cluj-Napoca („Cluj - Napoca”), 2,70 lei | 19,11 | 44,03 | 60,07 |
| Timiș/Timișoara cu diacritice, 64 lei | 20,55 | 44,77 | 62,35 |
| Maramureș/Borșa (km suplimentari), 64 lei | 20,55 | 78,27 | 96,67 |
| Iași, 500 lei | 0 | 0 | 0 |
| Localitate inexistentă (rezervă) | 22 | 79 | 98 |

- Fan pentru București dă acum tarif real, 23,45. Înainte de normalizare dădea rezerva de 18 lei, din cauza diacriticelor (HTTP 422).
- Rambursul pe coșul redus folosește prețul după reducere (`item_total` 128, nu 160).
- Politica: Cargus cotat ramburs + sesiune `pp_system_default` → 200; Cargus cotat card + `pp_system_default` → 400 cu mesajul pentru client; Fan + `pp_system_default` → 200.
- După adăugarea unui produs, Medusa recalculează Cargus păstrând modul ramburs (64,72 → 64,83).
- Scriptul de opțiune a creat `so_01M86XJXS27WGS4M9W8V0F536H` și a legat depozitul Cluj de `cargus_cargus`; a doua rulare nu face nimic.

**Neverificat pe staging:** plata cu cardul. Staging nu are `STRIPE_API_KEY`, deci calea card e acoperită numai de testele unitare. Interfața de checkout nu a fost văzută într-un browser. TypeScript trece, iar build-ul Vercel al ramurii (preview `dpl_5fvgpGFkKLU1zZdNo2CEce2NEiLw`, commit `f0a723b`) este READY.

## Pașii pentru producție

Fiecare pas se verifică înainte de următorul. Nimic nu se face pe producție fără acordul DC.

1. **Merge în `master`** după review. Merge-ul pornește atât storefront-ul (Vercel), cât și backend-ul (Railway). Cât timp nu există opțiunea Cargus, totul se comportă ca acum pentru Fan și ridicare.
2. **Backend producție**: verifică deploy-ul din `master` și că Fan cotează normal (`[FanCourier] calc` în loguri). Verifică și că storefront-ul de producție e Ready pe același commit.
3. **Variabile Railway producție**, cu deploy după setare:
   - `CARGUS_API_KEY`, `CARGUS_USERNAME`, `CARGUS_PASSWORD` (utilizatorul `ardmag.api`, nu contul principal);
   - `CARGUS_PRICE_TABLE_ID=293764`;
   - `CARGUS_CHECKOUT_ENABLED=true`.
   Pe staging ele există deja și merg.
4. **Precondiție pentru opțiune**: în logurile deploy-ului de producție, după pasul 3, serverul pornește fără erori și are providerul Cargus încărcat. Nu treci la pasul 5 dacă deploy-ul nu e SUCCESS cu flagul `true`.
5. **Opțiunea de livrare**, la final. Pe uscat, apoi aplicare:
   ```
   npx medusa exec ./src/scripts/setup-cargus-shipping-option.ts
   npx medusa exec ./src/scripts/setup-cargus-shipping-option.ts apply
   ```
   Cum am rulat pe staging: SSH-ul Railway nu e disponibil (contul nu are chei înregistrate), deci scriptul a rulat local din `backend/`, cu `DATABASE_URL` = URL-ul public al bazei, `CARGUS_CHECKOUT_ENABLED=true`, fără `REDIS_URL`, SMTP și Stripe. URL-ul se dă procesului prin stdin, nu în linia de comandă.
   Atenție:
   - garda „provider încărcat” verifică procesul care rulează scriptul, nu serverul. De aceea pasul 4 e obligatoriu;
   - pornirea Medusa sincronizează providerii în baza de date, deci și rularea pe uscat poate marca `cargus_cargus` ca activ. Nu e o problemă cât timp serverul are deja flagul `true`.
   Scriptul copiază zona, profilul și regulile de la opțiunea Fan și se oprește dacă nu găsește exact o opțiune Fan calculată sau dacă există dubluri Cargus. Opțiunile șterse soft sunt ignorate. Conform verificării din 16.11 (nerefăcută azi), producția are 3 opțiuni Cargus vechi, flat 22,99, șterse soft.
6. **Verificare live**, fără comandă: un coș sub 500 lei și unul peste, cotații Cargus card și ramburs, `[Cargus] quote source=cargus-api` în loguri. Prima comandă reală Cargus se urmărește manual.

## Revenire

Ordinea contează: o opțiune Cargus listată, cu providerul neîncărcat, dă HTTP 500 la calcul (văzut pe staging).

1. Șterge soft sau dezactivează opțiunea Cargus din Admin (Settings → Locations → Depozit Cluj → Shipping).
2. Abia apoi `CARGUS_CHECKOUT_ENABLED=false` și redeploy.

Fan și ridicarea personală nu depind de acești pași.

## Ce trebuie de la client sau de la DC

- **Grila din contractul Cargus.** Tariful de rezervă e provizoriu, măsurat din API. Când vine grila, se înlocuiesc treptele din `fallback-tariff.ts`.
- **Adresa de ridicare înregistrată la Cargus.** Cotația pleacă din Cluj-Napoca; dacă punctul de ridicare e în altă localitate, se schimbă `ORIGIN` în `service.ts`.
- **AWB-urile rămân manuale.** Providerul nu creează expedieri; comenzile Cargus se emit din app.cargus.ro, ca acum la Fan.
- **Peste 50 kg** Cargus cotează palet (serviciul 36, 397,49 lei). De confirmat dacă ARDmag vrea să ofere Cargus la asemenea greutăți.
- **Livrare gratuită cu ramburs.** De la 500 lei clientul plătește 0 la transport, dar Cargus facturează transportul și comisionul de ramburs (de exemplu, la 600 lei încasați ramburs, până la 15 kg: circa 44 lei transport + 7 lei asigurare + 29 lei comision, cu TVA, deci aproximativ 80 lei). Regula „gratuit de la 500” a rămas cum era, prin decizie; costul îl suportă ARDmag. De confirmat de DC dacă e acceptat.
- **Localitățile negăsite** primesc în rezervă un supliment de 34 lei pentru km suplimentari. E o estimare prudentă, nu tariful contractului.
