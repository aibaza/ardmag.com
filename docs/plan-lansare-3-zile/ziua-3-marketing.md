# Ziua 3 — Marketing & Polish (3 mai 2026)

**Goal:** Infrastructura de tracking activă, Google Business Page live, banner promo Tenax, primul conținut pregătit pentru FB ads, QA final pre-lansare.

---

## 3.1 Google Analytics 4

**Creare property:**
- Cont Google: ciprian.dobrea@gmail.com (sau cont dedicat ardmag)
- Property name: "ardmag.com"
- Timezone: Romania, Currency: RON
- Measurement ID format: `G-XXXXXXXXXX`

**Instalare în `backend-storefront/src/app/layout.tsx`:**
```tsx
import Script from 'next/script'

// în <head>:
<Script
  src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_MEASUREMENT_ID}');
  `}
</Script>
```

**ENV nou:** `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX`

**Ecommerce events** (în componentele relevante):
- `view_item` — pe pagina de produs
- `add_to_cart` — la click "Adaugă în coș"
- `begin_checkout` — la intrarea în checkout
- `purchase` — pe pagina `/order/{id}/confirmed`

---

## 3.2 Facebook Pixel

**Creare pixel:**
- Acces la pagina FB "Ardmag" → Events Manager → Creare Pixel → "ardmag.com pixel"
- Pixel ID format: numeric (ex. `1234567890123456`)

**Instalare în `layout.tsx`:**
```tsx
<Script id="facebook-pixel" strategy="afterInteractive">
  {`
    !function(f,b,e,v,n,t,s){...}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${FB_PIXEL_ID}');
    fbq('track', 'PageView');
  `}
</Script>
```

**Events:**
- `ViewContent` — pe pagina de produs (cu `content_ids`, `content_type`, `value`, `currency`)
- `AddToCart` — la click "Adaugă în coș"
- `InitiateCheckout` — la intrarea în checkout
- `Purchase` — pe pagina de confirmare comandă

**GDPR consent banner:**
- Component simplu: "Folosim cookie-uri pentru analiză și remarketing. [Acceptă] [Refuz]"
- Cookie `ardmag_consent=yes|no` cu expiry 1 an
- GA4 + FB Pixel încărcate condițional după consent
- Fișier: `backend-storefront/src/modules/layout/CookieConsent.tsx` (nou)

---

## 3.3 Google Business Page

Proces manual (necesită verificare Google):

1. **Creare:** https://business.google.com → "Adaugă afacerea"
2. **Date:**
   - Nume: "ARDMAG"
   - Categorie principală: "Magazin de scule și echipamente"
   - Categorie secundară: "Distribuitor de materiale"
   - Adresă: Calea Baciului 1-3, Cluj-Napoca 400230
   - Telefon: +40 722 155 441
   - Website: https://ardmag.surmont.co (actualizat când se mută domeniu)
   - Orar: L-V 08:00-16:00, S-D închis
3. **Verificare:** prin telefon (cel mai rapid, 5 minute)
4. **Fotografii de adăugat:** logo + 3-4 produse populare (discuri marmură, mastici Tenax, soluții Delta)

---

## 3.4 Banner promo Mastici Tenax -30%

**Context:** Andrei a specificat explicit (29 apr): "ii foarte important la mastici tenax sa apara mare pe front page ca avem reducere de 30% la toata gama, cum avem trecut si pe site-ul vechi."

**Fișier nou:** `backend-storefront/src/modules/home/PromoBanner.tsx`

Design (respectă paleta site):
```
[Fundal gri închis/slate, accent galben/auriu]
🔥 REDUCERE 30% LA TOATĂ GAMA MASTICI TENAX
[subtext] Ofertă valabilă până la epuizarea stocului
[CTA button] → Vezi produsele Tenax
```

Integrare în `backend-storefront/src/app/[countryCode]/(main)/page.tsx` — deasupra hero-ului sau imediat după.

Linkul CTA → `/categorii/mastici-tenax` sau filtru brand Tenax pe `/produse`.

---

## 3.5 Bundle deals — categorie și produs

**Categorie nouă:** "PACHETE PROMOTIONALE" (handle: `pachete-promotionale`)
- Creare în Railway Admin sau SQL

**Produs bundle** (importat în ziua 1):
- Afișaj: preț bundle vs. total individual = economie X%
- Greutate: 6kg (confirmat de Andrei)
- Link din homepage: secțiune separată "Oferte speciale"

---

## 3.6 Content seed — outline-uri articole blog

Articolele NU se publică acum — doar outline-uri pregătite pentru FB ads post-lansare.

**Fișiere în `docs/content/`:**

1. `cum-alegi-disc-diamantat-marmura.md` — ghid cumpărare
2. `lustruire-uscat-vs-umed.md` — comparație tehnică
3. `mastic-tenax-pe-tip-piatra.md` — ghid aplicare
4. `intretinere-piatra-naturala-interior.md` — sfaturi practice
5. `ghid-complet-slefuit-profesional.md` — long-form

Fiecare outline: titlu, intro 2 fraze, 5-7 H2 headers, CTA spre produs relevant.

**Strategie FB ads:** Ciprian a confirmat 100 lei/zi budget inițial. Primele ad sets:
- **Remarketing:** vizitatori site fără conversie → produs văzut
- **Cold audience:** 25-55 ani RO, interes construcții + amenajări + pietre decorative
- **Creative:** 2 variante per produs (imagine produs + text beneficiu, imagine produs + text promoție)

---

## 3.7 Verificare finală pre-lansare

Rulează toate checklist-urile din `verificare-finala.md`.

---

## Notițe implementare

- GA4 și FB Pixel trebuie să funcționeze DOAR după consent GDPR (lege RO/EU).
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` și `NEXT_PUBLIC_FB_PIXEL_ID` — setat ca env var pe Railway pentru storefront, nu hardcodat în cod.
- Google Business Page verificarea durează uneori 1-3 zile prin poștă — încearcă prima dată prin telefon sau SMS.
- Banner promo Tenax: verifică că discountul de 30% e vizibil și în prețurile calculate (e setat ca price list în DB cu `-30%` la cart).
