# Feedback Andrei — implementare pe test, 1 octombrie 2026

Autorizare: DC „go”, dupa planul Total Wet, promotie Tenax, verificare si recuperare Cargus. Numai https://test.ardmag.ro si baza Railway staging c47689f6-eaf2-48ac-8eae-bdcf11e7c27c; productia asteapta validarea lui Andrei si DC.

## Total Wet

Sursa: WhatsApp Andrei Rinzis, 1 octombrie, 12:44–12:46 UTC. Preturile sunt confirmate bune, apelul telefonic a fost testat; stock 48 bucati 1 L, 60 bucati 5 L. Solicitari: eliminare foto eticheta spate si panglica rosie vizibila Nou.

Aplicat pe baza de test prin workflow-uri Medusa dupa backup complet:
- Stoc gestionat: 48 / 60; fara backorder, variante comandabile online.
- Scoasa fotografia din spate; fotografia principala originala de 1 L ramane.
- Metadata contact_to_order=false, stock_confirmation_pending=false.
- Preturile, optiunile si celelalte produse nu sunt modificate.
- Panglica Nou sus-dreapta in catalog si pagina produsului, numai pentru metadata is_new=true; celelalte badge-uri raman.
- API verificat: 1 L 140 lei, 5 L 622 lei, o singura imagine, disponibilitati 48/60. Cos: cantitate 2 apoi 3 pentru ambele variante, totaluri 420 / 1866 lei la 3 bucati. Fara comenzi, plati sau AWB-uri.

## Promo mastici Tenax — activa pe test

Andrei a confirmat pe WhatsApp la 1 octombrie, 14:35–14:39 UTC (mesaje 28352–28354): 12 bucati Solido 1 L alb/bej/negru se pot combina, inclusiv 4+4+4. Restul sunt masticii Tenax, cu cele 3 intaritoare excluse. Perioada: 01.10.2026–31.12.2026 inclusiv, Europe/Bucharest.

Motorul nativ Medusa aplica automat 20% in cos doar celor trei variante eligibile, cand suma cantitatilor lor este >=12. Extensia modulelor native calculeaza pragul server-side, pastreaza toate argumentele si tranzactiile native. Pretul de baza ramane 76 lei; la prag, 60,80 lei/bucata. Un price list sale separat aplica 20% direct celorlalte 28 variante de mastici, fara prag. Solido Jura si ambalajele de 4/18 L intra in celelalte variante. Solutiile, pigmentii, aplicatorul si intaritoarele nu intra. Preturile de baza nu au fost rescrise.

Campania incepe 2026-09-30T21:00:00Z si se incheie exclusiv 2026-12-31T22:00:00Z; price list expira cu 1 ms inainte. Nota din pagina/card este conditionata de metadata de staging si data; publicata numai dupa dovada proaspata a cosurilor reale. Backendul custom este permis numai in mediul Railway staging; Cargus ramane dezactivat.

Dovezi: /home/dc/.codex/task-artifacts/ardmag-tenax-2026-10-01. Backend TypeScript si build PASS, 76 teste PASS, frontend TypeScript si 20 teste tintite PASS, review independent PASS. Dovada API verifica toate 28 preturile directe, cos mixt 4+4+4 si o culoare x12 (729,60 lei, discount 182,40), 12->11->12, intaritor exclus, Jura care nu contribuie la prag si stergerea unei linii. Nu s-au plasat comenzi sau plati.

Nota pentru viitoarea actualizare Medusa: rulati migrarile native cu TENAX_PROMO_ENABLED=false, apoi porniti cu flagul de staging true. Extensia reutilizeaza entitatile si conexiunea nativa; manifestul migrarilor CLI implicit al modulului custom este gol. Schema existenta este deja migrata pentru 2.13.6, iar dependenta promotion este fixata la 2.13.6 inclusiv in imaginea runtime.

## Cargus — cod recuperat, activare blocata de acces

Codul din origin/staging este recuperat selectiv in checkout-ul canonic master, fara schimbarea ramurii. Nu s-au copiat istoricul de continut, setup/seed-urile sau alte schimbari ale ramurii.

Clientul HTTP este corectat fata de vechea implementare care trimitea doar cheia si un payload generic: LoginUser cu credentialele WebExpress, token Bearer, PriceTables contractual, ID-uri tara/judet/localitate, ShippingCalculation cu ShipmentPayer numeric si total GrandTotal. Endpoint fix, redirect-uri refuzate, buget total 6 secunde, fara credentiale in mesaje/loguri. Mai multe grile contractuale cer CARGUS_PRICE_TABLE_ID explicit; destinatia lipsa nu devine automat Cluj.

Providerul si regulile de plata se activeaza numai cu CARGUS_CHECKOUT_ENABLED=true. Flagul ramane dezactivat; Fan Courier si checkout-ul curent nu sunt schimbate. Backendul a fost redeployat pe staging pentru Tenax, cu Cargus dezactivat. Frontendul de checkout Cargus ramas pe vechea ramura trebuie integrat si verificat in etapa de activare.

Autentificare verificata independent cu credentialele staging recitite din Railway la 1 octombrie: POST LoginUser HTTP 500, fara token. HTTP 500 nu dovedeste cauza sau asocierea cheii. Cererea de asociere trebuie clarificata cu Cargus de titularul ARC ROM DIAMONDS; nicio cerere/email/chat nu a fost trimisa.

Inainte de activare: confirmare abonament/asociere, LoginUser si PriceTables reusite, tarif real pe localitati si greutati de referinta, cooldown pentru erorile API, frontend compatibil Fan+ramburs / Cargus+card, verificare server-side a perechilor si gratuitate >=500 lei, test pickup. Fallbackul istoric 22,99 lei nu este dovada unei cotatii reale.

## Verificari si limite

- Backend: TypeScript PASS, 69 teste unitare PASS.
- Storefront: TypeScript PASS, 48 teste pentru badge/selector/preturi/izolare mediu PASS.
- Suita mai larga a adaptoarelor: 104/112 PASS; 8 esecuri preexistente in teste pentru card, galerie si filtre, cu fisierele respective identice cu HEAD (asteptari istorice centi/RON, specs si placeholder). Cele 4 esecuri vechi ale pretului PDP sunt rezolvate prin corectarea fixture-urilor si a cotei TVA.
- Review independent Claude: corectii la garda inventarului aplicate, apoi PASS pentru Total Wet; Cargus PASS numai cu activarea dezactivata. Review separat al calculului fara TVA: PASS.
- Calculul informativ „fara TVA” este corectat de la 19% cu rotunjire la lei intregi la 21% cu rotunjire la bani, preturile brute ramanand identice. Total Wet: 140 brut / 115,70 net si 622 brut / 514,05 net. Sursa cota standard: https://static.anaf.ro/static/10/Brasov/Brasov/cote_TVA.pdf (ANAF, Legea 141/2025, aplicabila din 1 august 2025). Nu se schimba configuratia fiscala backend sau sumele din cos.
- Dovezi: /home/dc/.codex/task-artifacts/ardmag-followup-2026-10-01. Secretele raman exclusiv in fisiere private, nu in repository.

## Recuperarea sesiunii

Sesiunea din 30 septembrie 60f8a676ad2f4a3fb46c55698ccab3a6 a murit, PID-ul nu mai exista. Inainte de prima mutatie noua, toate cele 15 cai nepublicate din aceeasi conversatie au fost inventariate, copiate octet-cu-octet si hash-uite in recovery-provenance.json. Nicio modificare anterioara nu a fost resetata. Continuarea ruleaza intr-o sesiune source noua pe scope brand:ardmag.com, ca recuperare exceptionala documentata. Nu sunt autorizate commit/push/deploy in productie; release-ul canonic ramane pentru etapa validata.

## Shortlist actualizat pentru Andrei

1. Total Wet: o singura fotografie principala, panglica rosie Nou; verifica desktop si telefon.
2. Selecteaza 1 L si 5 L: 140 / 622 lei cu TVA, 115,70 / 514,05 fara TVA; ambele In stoc si comandabile.
3. Adauga fiecare varianta in cos si schimba cantitatea; verifica pretul si totalul. Fara finalizarea unei comenzi de test.
4. Solido 1 L: adauga 4 alb + 4 bej + 4 negru; total 729,60 lei. Redu la 11 bucati: reducerea dispare. Intaritorul nu contribuie la prag si nu primeste discount. Celelalte mastici afiseaza direct pretul redus cu 20%.
5. Pentru publicarea finala: fotografia recipientului de 5 L ramane de primit.

CLI Claude a fost indisponibil dupa actualizarea Helios de la 2.1.285 la 2.1.286: linkul instalarii canonice indica versiunea eliminata. Linkul canonic a fost reparat catre versiunea curenta, fara a crea o a doua instalare; review-ul ulterior a reusit.

## Deploy Total Wet, anterior campaniei Tenax

Vercel preview dpl_6JtEPiWfCNPDuc1HJPhHnza9dGKK READY, https://ardmag-storefront-32f382efz-surcod.vercel.app, asociat cu https://test.ardmag.ro. Readback API al aliasurilor: test indica acest deploy; ardmag.ro si www.ardmag.ro raman dpl_Fgs2YN1FHLLB7LSeDs4x27HP9umA.

Browser: desktop 1280 px si mobil 390 px, fotografia incarcata, panglica rosie vizibila pe PDP si cardul de catalog, o singura miniatura, fara overflow. Ambele selectii afiseaza pretul brut/net corect. Adaugarea variantei 5 L in browser produce confirmarea si un cos de 622 lei. Comanda/plata nu a fost finalizata.

## Dovada Tenax pe staging

{"backend_deployment": "90c6bc35-e5d2-407b-83fd-3ee32531e028", "api_cases": 8, "price_list_variants": 28}

## Deploy Tenax si verificare in browser

Vercel dpl_DKiri5SLajx9h4qeNjkY5cFXEeXG READY, https://ardmag-storefront-dfx0r13lg-surcod.vercel.app, asociat cu https://test.ardmag.ro. Aliasurile ardmag.ro si www.ardmag.ro sunt identice cu starea anterioara.

Browser 1280/390 px: Solido alb 1 L afiseaza 76 lei si nota exacta privind 12 bucati mixte; Jura 1 L afiseaza 60,80 lei cu pret anterior 76 si fara nota de prag. Catalogul prezinta nota numai la mastic-solid, reducerile directe la mastici si pretul intaritorului neschimbat. Cos mixt 4+4+4: subtotal 912, reducere 182,40, total 729,60. Schimbarea prin controlul din browser 12->11->12 elimina/restabileste reducerea. Fara overflow pe desktop/mobil, fara comanda/plata.

Corectat subtotalul afisat in cos/checkout de la item_total deja redus la item_subtotal inainte de reducere. Totalurile native nu au fost modificate. TypeScript PASS si review focalizat PASS. Cele 4 teste istorice de card care esuau au fost rerulate; zero esecuri noi.

Recuperare suplimentara: sesiunea veche din aceeasi conversatie nu mai avea proces activ. Toate cele 39 cai cunoscute au fost copiate si hash-uite in artefactele Tenax inainte de prima mutatie. Continuarea pe test foloseste sesiunea source codex-tenax-test-20261001, acelasi scope brand:ardmag.com. Commit/push/productie raman pentru validarea autorizata ulterioara.
