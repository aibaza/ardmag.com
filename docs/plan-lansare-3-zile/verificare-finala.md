# Verificare finală pre-lansare

Rulează toate checklist-urile înainte de mutarea domeniului ardmag.com pe site-ul nou.

---

## 1. Catalog

```bash
# Total produse active pe Railway
echo "SELECT COUNT(*) FROM product WHERE deleted_at IS NULL;" | railway connect Postgres
# Așteptat: ≥ 91 (90 existente - 1 masă tăiat + 22 noi)

# Variante fără greutate
echo "SELECT COUNT(*) FROM product_variant WHERE weight IS NULL AND deleted_at IS NULL;" | railway connect Postgres
# Așteptat: < 5 (sau 0)

# Prețuri corecte spot-check
echo "SELECT v.title, p2.amount/100 as pret_ron FROM product_variant v
JOIN product_variant_price_set pvps ON v.id = pvps.variant_id
JOIN price p2 ON pvps.price_set_id = p2.price_set_id
JOIN product p ON v.product_id = p.id
WHERE p.title ILIKE '%marmura%' AND v.title ILIKE '%300%' AND v.title ILIKE '%nou%'
AND p2.currency_code = 'ron';" | railway connect Postgres
# Așteptat: 477 RON

# Nicio referință "masă de tăiat" pe storefront
curl -s https://ardmag.surmont.co/produse | grep -i "masa de taiat" | wc -l
# Așteptat: 0
```

---

## 2. Checkout — Ramburs

1. Deschide https://ardmag.surmont.co
2. Adaugă un produs în coș
3. Mergi la checkout
4. Completează adresa cu:
   - Județ: selectat din dropdown (ex: Cluj)
   - Cod poștal: 400001 (valid 6 cifre)
5. Selectează "Ramburs la livrare"
6. Plasează comanda

**Verificat:**
- [ ] Pagina de confirmare se deschide cu numărul comenzii
- [ ] Email la `office@arcromdiamonds.ro` primit în max 2 minute
- [ ] Email la adresa clientului de test primit
- [ ] Comanda apare în Admin Railway (când admin e activ temporar)

---

## 3. Checkout — Card Stripe TEST

1. Adaugă produs în coș → checkout
2. Completează adresa
3. Selectează "Card bancar (Stripe)"
4. Introdu card test: `4242 4242 4242 4242`, exp `12/26`, CVV `123`
5. Plasează comanda

**Verificat:**
- [ ] Stripe Elements afișat corect (nu doar radio button)
- [ ] Plata procesată fără erori
- [ ] Redirect la pagina de confirmare
- [ ] Email confirmare primit
- [ ] Webhook Stripe primit (log în Railway)

---

## 4. Email tranzacțional

```bash
# Verifică că SMTP2GO trimite
# Configurare OK dacă comenzile de test de mai sus generează emailuri

# Verifică Railway env
railway variables | grep "SMTP\|ORDER_NOTIFY"
# Așteptat: SMTP2GO_API_KEY=SET, ORDER_NOTIFY_EMAIL=office@arcromdiamonds.ro
```

---

## 5. Fan Courier (dacă credentialele au venit)

```bash
# Test autentificare
curl -s -X POST "https://api.fancourier.ro/login?username=$FAN_COURIER_USERNAME&password=$FAN_COURIER_PASSWORD" | python3 -c "import sys,json; d=json.load(sys.stdin); print('OK' if 'token' in d else d)"

# Test calcul tarif (Cluj → București)
TOKEN=$(curl -s -X POST "https://api.fancourier.ro/login?username=$FAN_COURIER_USERNAME&password=$FAN_COURIER_PASSWORD" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
curl -s -H "Authorization: Bearer $TOKEN" \
"https://api.fancourier.ro/reports/awb/internal-tariff?clientId=$FAN_COURIER_CLIENT_ID&info[service]=Standard&info[payment]=expeditor&info[weight]=2&info[packages][parcel]=1&recipient[county]=Ilfov&recipient[locality]=Buftea"
# Așteptat: obiect JSON cu total (~30-35 RON)
```

---

## 6. Tracking & Analytics

```bash
# Deschide homepage în Chrome DevTools → Network → filtrează "google" și "facebook"
# La PageView: trebuie să apară request-uri la analytics.google.com + connect.facebook.net
# La AddToCart: trebuie event FB "AddToCart" în Facebook Pixel Helper extension
```

---

## 7. Performance

```bash
# Lighthouse mobile (din Chrome DevTools → Lighthouse → Mobile)
# Așteptat: Performance ≥ 80, Accessibility ≥ 90, Best Practices ≥ 90, SEO ≥ 90
```

---

## 8. Mobile QA

Deschide https://ardmag.surmont.co pe mobil și verifică:
- [ ] Homepage se încarcă în < 3s pe 4G
- [ ] Meniu de navigare funcționează
- [ ] Pagina de produs afișează corect poza, prețul, butonul de adăugare
- [ ] Checkout-ul e utilizabil pe ecran mic
- [ ] Footer-ul are toate link-urile corecte

---

## 9. Link-uri interne

```bash
# Verificare rapidă link-uri sparte
cd backend-storefront
npx next lint 2>/dev/null | grep -i "error\|broken" | head -10
```

Pagini de verificat manual:
- [ ] /produse — grid produse, filtre categorii
- [ ] /promotii — produse cu reducere
- [ ] /contact — formular funcțional
- [ ] /despre-noi — info companie
- [ ] /livrare — opțiuni transport
- [ ] /termeni — termeni și condiții
- [ ] /confidentialitate — GDPR

---

## Checklist final "gata de lansat"

- [ ] ≥ 91 produse active cu preț RON
- [ ] ≤ 5 variante fără greutate (sau 0)
- [ ] Mese de tăiat dispărute din catalog
- [ ] Comandă Ramburs test → succes + email
- [ ] Comandă Stripe test → succes + email
- [ ] Banner promo Mastici Tenax vizibil pe homepage
- [ ] Cookie consent banner funcțional
- [ ] GA4 events la checkout
- [ ] FB Pixel events la checkout
- [ ] Google Business Page live (sau în verificare)
- [ ] Lighthouse mobile ≥ 80
- [ ] Zero erori console pe homepage + product page
- [ ] ardmag.com DNS actualizat (sau programat)
