# Remediere review lacune grave - 2 octombrie 2026

Autorizare: GO explicit al utilizatorului pentru remediere si publicare pe test. Checkout canonic existent, delta de handoff pastrata. Fara commit/push/productie sau mesaje catre Andrei.

## Schimbari

- Coș: aceeasi limita de 999 ca PDP; cantitatile existente mai mari sunt pastrate. Draftul gol nu trimite 1; tastarea trimite doar la blur/Enter. Actualizarile si stergerile sunt serializate, controalele blocate pana la raspuns, erorile vizibile, valoarea resincronizata cu serverul.
- Finalizare: raspunsurile Medusa HTTP 200 cu type=cart si error sunt afisate. Erorile de transport au mesaj sigur. Redirectul Next ramane intact, cookie-ul se sterge numai dupa succes si cu await.
- Totaluri: aceeasi functie pentru coș, checkout, confirmare si cont. Subtotal brut = item_total + item_discount_total; transportul este net dupa reducerile de transport. TVA afisat ca inclus. Pretul unei linii ramane unit_price x quantity, inainte de reducerea de cos, identic intre toate cele patru ecrane.
- Contact: corp maxim 16 KiB, validare de tip/lungime/email, control Origin, honeypot, fara autoreply catre adrese arbitrare. Limita atomica partajata PostgreSQL: 5/IP/15 minute, 3/email/ora, 60 global/ora. Identificatorii sunt HMAC, fara IP/email brut in tabela; tabela are expirare si cleanup limitat cu SKIP LOCKED. Indisponibilitatea limiterului blocheaza trimiterea.

## Configurare staging si release

Vercel API: configuratie custom firewall inexistenta (active=null, draft=null). Aceasta constatare nu exclude protectiile platformei.

Staging: schema ardmag_contact si rol ardmag_contact_guard cu acces doar la tabela rate_limits. Credentele si secretul HMAC sunt private, in afara Git. Parametrii server-only CONTACT_RATE_LIMIT_DATABASE_URL si CONTACT_RATE_LIMIT_SECRET sunt injectati doar in preview. Rolul nu poate citi public.product.

Productie: protocolul canonic de release ramane prerequisite. Inainte de release se provisioneaza aceeasi schema si un rol dedicat pe DB production, se configureaza cele doua variabile server-only si TLS conform infrastructurii. In staging Railway TLS este criptat, cu verificare CA dezactivata pentru certificatul privat existent; verificarea CA pentru productie trebuie stabilita la release. Nu copia credentele staging in productie. Lipsa limiterului produce 503, nu permite email nelimitat.

SMTP nu este configurat in preview; testele de email folosesc exclusiv mock. Nu exista comanda/plata/AWB/email real emise de acest review. Pentru verificarea cantitatilor se folosesc numai cosuri staging noi, marcate in metadata, fara modificarea cosului utilizatorului.

## Verificari

- TypeScript PASS.
- 30 teste noi focalizate PASS.
- 36 teste existente (total canonic, pret PDP, variante) PASS.
- Concurrenta limiter pe DB staging: exact 3/10 admise pentru acelasi email si exact 5/15 pentru acelasi IP, pe conexiuni concurente.
- Review independent final Opus 5.5 PASS, dupa uniformizarea liniilor la pretul inainte de reducere.
- Deploy dpl_FaFDzBR9FoFxmzSVJ3ebQ1sd2P8Q READY; alias test.ardmag.ro verificat. Productia ramane dpl_Fgs2YN1FHLLB7LSeDs4x27HP9umA.
- Browser local si live, coș separat: 120 bucati pastrate; 12 bucati 912 - 182,40 = 729,60; 11 bucati 836 fara reducere; draft gol fara cerere; eroare de retea simulata vizibila si retry reusit. Fara overflow la 375/1280 px.
- PDP live: Solido 4 x 76 = 304; schimbare Jura reseteaza la 1 x 60,80, apoi 4 x 60,80 = 243,20.
- API contact live: corp invalid 400, origin nepermis 403, honeypot 200 fara trimitere; 3 cereri admise pana la verificarea SMTP (503 Email not configured), a patra blocata 429. Zero emailuri trimise.
- Avertisment preexistent observat pe dev: raspunsul de catalog de aproximativ 2,9 MB depaseste limita cache Next de 2 MB. Nu a fost modificat in acest pachet.

Dovezi private: /srv/paperclip/backup/ardmag-review-fixes-2026-10-02.
