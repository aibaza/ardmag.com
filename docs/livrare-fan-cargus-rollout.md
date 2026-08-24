# Rollout Fan Courier + Ramburs / Cargus + Card

Implementarea păstrează `Ridicare Cluj` exact în forma existentă. Nu conține funcții Cargus pentru creare, printare sau anulare AWB.

## Preflight

1. Faceți backup bazei și confirmați că backend-ul țintă este mediul aprobat.
2. Confirmați existența providerilor `pp_system_default`, Stripe, `fan-courier_fan-courier` și `cargus_cargus`.
3. Configurați `CARGUS_API_KEY` exclusiv în secret manager-ul backend. Nu folosiți prefixul `NEXT_PUBLIC_` și nu copiați valoarea în loguri, Git sau ticket.
4. Până la validarea tarifelor contractuale, Cargus folosește fallback-ul provizoriu de 22,99 RON. Gratuitatea peste 500 RON se aplică atât Fan, cât și Cargus.

## Scripturi (operator-only)

Aceste comenzi nu au fost executate în timpul implementării. Rulați-le numai după aprobarea rollout-ului și niciodată implicit pe `api.ardmag.ro` fără fereastră de schimbare.

```bash
cd backend
npx medusa exec ./src/scripts/setup-ro-shipping.ts
npx medusa exec ./src/scripts/setup-ro-payment.ts
npx medusa exec ./src/scripts/migrate-shipping-cargus-payment-map.ts
```

Ultima comandă este numai dry-run și afișează SQL-ul idempotent. Verificați că acesta dezactivează doar Sameday/Poșta, activează Fan/Cargus calculate și nu conține niciun `UPDATE` pentru `Ridicare Cluj`. Scriptul blochează intenționat aplicarea automată chiar și cu `-- apply`; operatorul copiază SQL-ul revizuit în consola SQL aprobată și îl rulează tranzacțional.

## Ordine de activare

1. Instalați versiunea backend și reporniți procesul pentru înregistrarea providerului Cargus.
2. Executați preflight-ul și scripturile de setup în mediul aprobat.
3. Revizuiți și aplicați manual SQL-ul generat de migrare.
4. Verificați Store API: Fan, Cargus și Ridicare Cluj sunt disponibile; Sameday și Poșta nu sunt disponibile.
5. Verificați combinațiile: Fan+ramburs acceptată, Cargus+card acceptată, Fan+card respinsă, Cargus+ramburs respinsă. Verificați separat Ridicare Cluj cu comportamentul anterior.
6. Fără cheie sau la timeout/răspuns invalid Cargus, confirmați cotația 22,99 RON. Pentru coșuri de minimum 500 RON, confirmați gratuitatea Fan și Cargus.
7. Activați storefront-ul compatibil numai după validarea backend-ului.

## Rollback

Păstrați versiunea anterioară a aplicației și snapshot-ul bazei. Pentru rollback de date, restaurați snapshot-ul sau reactivați explicit opțiunile anterioare pe baza rezultatului preflight; nu modificați `Ridicare Cluj`. Eliminați `CARGUS_API_KEY` din secret manager pentru a forța imediat fallback-ul static, fără a expune valoarea.

## Rămas pentru validarea contractuală Cargus

Înainte de a considera cotația API contractuală, validați endpoint-ul, autentificarea, tabela de preț, serviciul, localitățile, TVA-ul, unitățile și exemple etalon furnizate de Cargus. Apoi înlocuiți marcajul provizoriu din `fallback-tariff.ts` numai printr-un review comercial separat.
