# Feedback Andrei: Jura si checkout, 2 octombrie 2026

Sursa: Beeper WhatsApp Andrei Rinzis, mesaje 30732, 30741, 30740, 30750. DC a cerut continuarea corectiilor pe test. Productia si commit/push raman in fluxul de validare existent.

- Jura 1 L este a patra culoare eligibila la pragul comun de 12 bucati Solido. Pret de baza 76 lei, reducere 20% in cos la prag, inclusiv culori combinate. Jura 18 L ramane in campania directa pentru celelalte ambalaje.
- Workflow operator-only cu verificare staging, identitati si backup complet: include-jura-staging-20261002.ts. Extinde regula existenta, elimina numai pretul direct redus Jura 1 L si actualizeaza metadata. Nu se reaplica pe o campanie deja reconciliata.
- Checkout: API payment-providers staging returna [null, pp_system_default]. Sortarea pe null arunca exceptie, mascata ca lista goala. Filtrarea pastreaza providerii valizi si activi.
- Produsul staging-checkout-test-100 din imagine exista numai in staging. Verificare SQL read-only productie: zero produse cu acest handle/titlu. Nu se transfera datele catalogului staging in productie.

Validare locala: 8 teste backend promo PASS, 8 teste frontend PASS, TypeScript backend/storefront PASS, build Medusa PASS. Browser: Ramburs -> review, fara comanda sau plata card. Artefacte private: /srv/paperclip/backup/ardmag-feedback-2026-10-02.

Backend staging: deployment f2e0c49f-5be5-4fea-8e59-ea086e745b8f SUCCESS. Verificari API live PASS: Jura 1x76; Jura 12 = 729,60; 3+3+3+3 = 729,60; alb 8 + Jura 4 = 729,60; 11 = 836; Jura 12->11->12 elimina/restabileste reducerea. Nicio comanda sau plata card.

Storefront dpl_HF9vFDJL2nmRJkRaV9vAumcwP2wc READY, asociat test.ardmag.ro. Browser live PASS: Ramburs -> review, Jura 1 L 76 lei si nota prag comun cu Jura. Productia ramane dpl_Fgs2YN1FHLLB7LSeDs4x27HP9umA. Fara comanda, card, AWB sau email.
