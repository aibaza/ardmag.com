# Insigna de reducere pe cardul de produs — C aleasa de DC si implementata

Mockupuri pe cardul real (Mastic Lichid, preturi reale din catalog: 64,00 Lei, inainte 80,00 Lei, -20%), randate local cu Playwright la 1440 si 390. Starea de azi: `actual-*.png`.

- **A — insigna mare pe imagine** (`propunere-A-*.png`): aceeasi insigna din colt, dar de ~2x (20px, bold, umbra usoara), cu pretul nou colorat si cel vechi taiat; cea mai mica schimbare, tiparul clasic al magazinelor de moda si casa.
- **B — reducerea langa pret** (`propunere-B-*.png`): insigna pleaca de pe imagine si sta langa pret, cu pretul vechi taiat si „Economisești 16,00 Lei”; urmeaza cercetarea Baymard ca oferta se intelege cand sta grupata langa pret.
- **C — banderola pe imagine** (`propunere-C-*.png`): banda pe toata latimea, sus pe imagine, „-20% PREȚ REDUS”, plus pretul colorat si cel vechi taiat; cea mai vizibila in grila, se vede de la distanta.

Cercetarea a fost scurta (cautari web si rezumatele lor, fara analiza pe magazine anume); sursele folosite: [Baymard — discounturi pe pagina de produs](https://baymard.com/blog/product-page-price-discounts), [Baymard — 10 practici UX pentru reduceri](https://baymard.com/blog/10-sales-ux-best-practices), [Baymard — badge-uri UI](https://baymard.com/blog/badge-ui), [ecommerceguide — tiparul price promo](https://ecommerceguide.com/patterns/price-promo/), [Google Merchant — adnotari de pret redus](https://support.google.com/merchants/answer/9017019).

## Implementat: C (26.11.2026)

Banderola apare pe orice card de produs cu reducere (cautare, categorii in grila si lista, /promotii, homepage „La reducere”). Capturi locale pe date reale: `implementat-C-*.png` (desktop 1440, mobil 390, lista, tema intunecata; `*-fortat-nou-stoc` are panglica „Nou” si insigna „Stoc redus” adaugate artificial, ca sa se vada ca stau sub banderola).

Procentul vine acum din aceeasi varianta ca pretul afisat (cea mai ieftina). Inainte, insigna lua reducerea maxima dintre toate variantele.

**Mastic Solid**: ambalajele de 1 L (76 Lei) sunt la pret intreg, iar cele de 4 L si 18 L au -20% (241,60 in loc de 302, 712 in loc de 890). Cardul arata pretul de 1 L, asa ca nu mai afiseaza reducerea. Produsul ramane in „La reducere” si pe /promotii, cu nota de oferta pe cantitate deja existenta.

Decizie de produs, de luat separat:
1. cardul ramane asa (pret minim, fara banderola);
2. cardul arata cel mai ieftin ambalaj redus (241,60 / 302), desi nu e cel mai mic pret;
3. banderola calificata („-20% la 4 L si 18 L”);
4. produsele cu reducere doar pe unele variante ies din listele de promotii.
