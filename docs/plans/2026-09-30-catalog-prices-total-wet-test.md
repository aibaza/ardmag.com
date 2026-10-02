# Plan de implementare: preturi actualizate si Total Wet

Sursa: emailul original „Fwd: liste scurte”, Andrei Rinzis, 30 septembrie 2026, 12:07 Europe/Bucharest; patru documente Word (Delta, Tenax si diverse, SAIT, Woosuk). Cerinta DC: implementare si deploy pe test, fara publicare in productie in aceasta etapa.

## 1. Inventar si preturi

- Extragem toate randurile cu sursa, tabel si rand; pastram RON cu TVA separat de EUR fara TVA.
- Folosim coloana pret de lista pentru Tenax; reducerea de 30% nu porneste fara perioada si conditiile confirmate de Andrei.
- Asociem explicit produse, variante, volume, culori, granulatii si ambalaje. Pentru SAIT, pretul pe bucata se inmulteste cu cantitatea ambalajului comercial.
- Nu deducem pretul din EUR si nu setam zero pentru „la cerere” sau celule goale. Raportam separat corespondentele lipsa/ambigue.
- Facem snapshot inainte de scriere; aplicam numai in baza staging confirmata distincta de productie; verificam readback si corespondenta cu sursa.

## 2. Total Wet

- Un singur produs „TOTAL WET”, gama proprie Delta Research, cu variante 1 L si 5 L.
- Preturi finale cu TVA din lista Delta: 140 lei / 1 L, 622 lei / 5 L.
- Descriere din documentul comercial si eticheta fotografiata; fara beneficii sau instructiuni inventate.
- Imaginea pregatita din fotografiile reale reprezinta ambalajul de 1 L; nu o etichetam drept ambalaj de 5 L. Pastram fotografia reala a instructiunilor in galerie.
- Stocul nu este confirmat in email: nu inventam cantitati disponibile. Produsul poate fi verificat pe test chiar daca disponibilitatea ramane neconfirmata.

## 3. Marcaj Nou

- Refolosim badge-ul existent din design system pentru produs nou pe site.
- Activare explicita prin metadate de produs; fara inferenta dupa denumire sau data de fabricatie.

## 4. Verificare si deploy

- Teste pentru badge explicit, preturi pe variante, protectia impotriva coloanei promotionale si parsarea decimala.
- Verificam selectorul 1 L / 5 L, preturile afisate, imaginea si marcajul pe pagina si in catalog, desktop/mobil.
- Deploy de preview cu backend Railway staging https://medusa-staging-a4fc.up.railway.app; alegem domeniul de test confirmat si pastram referinta deployment-ului precedent.
- Productia se livreaza separat dupa validarea lui DC; nu facem push pe staging, nu schimbam ramura canonica master.

## 5. Promo mastici (dependenta externa)

Andrei urmeaza sa confirme produsele incluse, reducerea, perioada si conditiile. Aceasta implementare nu activeaza campania.

## Rezultat pe test

Deploy Vercel de preview: dpl_52xP3dLFw3bs5X3Lbe5UEmqqqWFr, servit la https://test.ardmag.ro. Backend si baza staging distincte, fara schimbarea aliasurilor de productie.

- 234 randuri de sursa extrase si verificate independent fata de documentele originale.
- 354 variante existente verificate: 97 preturi corectate, 257 deja conforme. Restul de 746 preturi existente au fost pastrate; doua preturi noi au fost create pentru pagina separata Total Wet.
- Total Wet: pagina proprie, 1 L / 5 L, 140 / 622 lei, badge Nou, fotografie profesionala 1 L si fotografie originala a instructiunilor.
- 36 teste frontend PASS, verificari TypeScript backend/storefront fara erori, review independent PASS, readback API pentru toate cele 354 variante PASS.
- Verificare browser desktop/mobil: imagine si badge afisate, 5 L selectabil cu pret 622 lei, card de catalog Nou cu pret 140 lei, fara overflow pe mobil. Comanda telefonica pana la confirmarea stocului.
- Verificare cos: 2 cutii SAITRON (10 buc./cutie), 297 lei/cutie, total 594 lei. Nicio comanda finalizata.
- Raportul de corespondente si dovezile sunt in /home/dc/.codex/task-artifacts/ardmag-email-2026-09-30. Linkul extern de acces este livrat separat, fara secret in repository.

Checklist pentru Andrei: 2026-09-30-validare-andrei.md. Urmatoarea etapa este feedback-ul pe test (preturi, identitati lipsa/ambigue, stoc si ambalaj 5 L); campania de mastici asteapta conditiile lui Andrei.
