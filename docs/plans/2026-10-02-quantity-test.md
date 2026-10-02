# Cantitate produs - corectie pe test, 2 octombrie 2026

Autorizare: DC cere repararea cantitatii selectate, a selectorului mobil si trimiterea rezultatului catre Andrei. Continuarea lucrarii de test din 1 octombrie; numai test.ardmag.ro. Producer lifecycle cu handoff explicit: sursele raman nepublicate pentru validarea finala si release-ul downstream autorizat ulterior. Fara commit/push ori deploy in productie in acest lifecycle.

Recuperare exceptionala: modificarile existente provin din aceeasi conversatie si sunt documentate in planul din 1 octombrie. Inainte de mutatie, toate caile modificate au fost copiate si hash-uite in /home/dc/.codex/task-artifacts/ardmag-quantity-2026-10-02/recovery-provenance.json. Sesiunea source curenta pastreaza lease-ul pana dupa verificare si deploy de test. Nu adopta modificarile vechi intr-un release Git.

PDPBuyActions conecteaza selectorul si butonul; cantitatea selectata este transmisa actiunii de cos si analytics. Schimbarea variantei reseteaza selectorul la 1. Campul numeric permite stergerea pentru reintroducere, accepta numai cifre si pastreaza limitele 1-999. Pe mobil, inputul umple spatiul dintre cele doua butoane, cu valoarea centrata. Confirmarea foloseste totalul final al cosului, inclusiv reducerile.

## Verificare finala

TypeScript PASS; review independent: corectiile cantitatii si totalurilor acceptate, alerta de eroare extinsa pe toata latimea si verificata separat PASS. Preview Vercel dpl_EfuAj8oacjCGnBtyW6ixj1TjiKxz READY; test.ardmag.ro citit inapoi cu acel deploy, aliasurile de productie identice cu starea initiala.

Browser T3: 390 si 1280 px. Pe mobil, 11 apasari + de la 1 selecteaza 12; actiunea adauga 12, confirmarea si cosul arata 729,60 lei. Inputul mobil are valoarea centrata exact, umple spatiul dintre butoane si nu produce overflow. Desktop: introducere directa 4, stergere -> 1 pe blur, 05 -> 5, schimbare varianta -> 1. Cos mixt alb/bej/negru 4+4+4: subtotal 912, reducere 182,40, total 729,60. 12 -> 11 -> 12: 729,60 -> 836 -> 729,60. Fara comenzi sau plati. Captura T3 indisponibila intermitent; masuratorile DOM, controalele UI si readbackurile API sunt salvate in acceptance.json.

Dovezi si handoff downstream: /home/dc/.codex/task-artifacts/ardmag-quantity-2026-10-02. Sursele raman in checkout-ul canonic pentru validarea si release-ul final autorizat ulterior, conform contractului de test al conversatiei.
