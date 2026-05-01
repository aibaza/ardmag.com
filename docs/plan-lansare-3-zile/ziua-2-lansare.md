# Ziua 2 — Lansare producție (2 mai 2026)

**Goal:** Comandă end-to-end funcțională — Ramburs (funcțional acum) + Card Stripe (de implementat) — cu email tranzacțional, județe RO corecte, Fan Courier modul gata de activat când vin credentialele.

---

## 2.1 Stripe — activare completă

### 2.1.1 Link Stripe la Region Romania (DB)
Rulează `backend/src/scripts/setup-ro-payment.ts` pe Railway:
```bash
cd backend
railway run -- node -e "
const { execSync } = require('child_process');
" # sau: railway run npx medusa exec ./src/scripts/setup-ro-payment.ts
```
Alternativă dacă Railway exec nu merge: SQL direct:
```sql
-- Verifică payment provider ID-ul Stripe
SELECT id FROM payment_provider WHERE id LIKE '%stripe%';
-- Linkează la region Romania
INSERT INTO region_payment_provider (region_id, payment_provider_id)
VALUES ('reg_01KPH383249W5F5HP8Z2ZWMR5A', 'pp_stripe_stripe')
ON CONFLICT DO NOTHING;
```

### 2.1.2 Stripe Elements în Checkout
**Fișiere de modificat:**
- `backend-storefront/src/modules/checkout/components/CheckoutPayment.tsx`
- `backend-storefront/src/lib/data/cart.ts` (funcția `placeOrder` la linia ~394)

Cod de referință în `_archive/modules/checkout/components/payment-*` — restaurare + adaptare la structura curentă.

Flow complet Stripe:
1. La selectare provider Stripe: `initiatePaymentSession()` returnează `client_secret`
2. Randat `<CardElement>` din `@stripe/react-stripe-js`
3. La "Plasează comanda": `stripe.confirmCardPayment(clientSecret)` → dacă success → `cart.complete()`
4. Handling 3DS: `stripe.confirmCardPayment()` gestionează automat challenge-ul

**Package necesar în storefront:**
```bash
cd backend-storefront && npm install @stripe/react-stripe-js @stripe/stripe-js
```

### 2.1.3 Stripe Webhook
- **Endpoint Railway:** Medusa v2 expune nativ webhook Stripe la `/hooks/payment/stripe`
- **Setare Railway:** `STRIPE_WEBHOOK_SECRET=whsec_...`
- **Configurare în Stripe Dashboard:** webhook URL = `https://api.ardmag.surcod.ro/hooks/payment/stripe`
- **Events:** `payment_intent.succeeded`, `payment_intent.payment_failed`

### 2.1.4 Verificare Stripe
```bash
# Test card: 4242 4242 4242 4242, exp 12/26, CVV 123
# Așteptat: comandă confirmată → email client + admin
```

---

## 2.2 Adresă checkout — județe RO + cod poștal

**Fișiere de modificat:**
- `backend-storefront/src/modules/checkout/components/CheckoutAddressForm.tsx`
- `backend-storefront/src/lib/data/romania.ts` — NOU

### `romania.ts` (nou)
```typescript
export const JUDETE_RO = [
  "Alba", "Arad", "Argeș", "Bacău", "Bihor", "Bistrița-Năsăud",
  "Botoșani", "Brăila", "Brașov", "București", "Buzău", "Călărași",
  "Caraș-Severin", "Cluj", "Constanța", "Covasna", "Dâmbovița",
  "Dolj", "Galați", "Giurgiu", "Gorj", "Harghita", "Hunedoara",
  "Ialomița", "Iași", "Ilfov", "Maramureș", "Mehedinți", "Mureș",
  "Neamț", "Olt", "Prahova", "Sălaj", "Satu Mare", "Sibiu",
  "Suceava", "Teleorman", "Timiș", "Tulcea", "Vâlcea", "Vaslui", "Vrancea"
] as const;

export function isValidCodPostalRO(cod: string): boolean {
  return /^\d{6}$/.test(cod);
}
```

### `CheckoutAddressForm.tsx` — schimbări:
- Câmpul `province` (județ): text input → `<select>` cu `JUDETE_RO`
- Câmpul `postal_code`: adaugă validare `isValidCodPostalRO()`
- Mesaj eroare cod poștal: "Codul poștal trebuie să aibă 6 cifre"

---

## 2.3 Fan Courier — modul complet (stub activabil)

### Structura `backend/src/modules/fulfillment-fan-courier/`

```
fulfillment-fan-courier/
├── index.ts          -- Module registration
├── service.ts        -- FanCourierFulfillmentService (extends AbstractFulfillmentProviderService)
├── client.ts         -- HTTP client + token cache
└── types.ts          -- Interfețe TypeScript
```

### `client.ts` — Token cache
```typescript
// Token cache in-memory cu TTL 23h (sub 24h limita FAN)
// POST https://api.fancourier.ro/login?username=&password=
// Response: { token: "id|secret", expiresAt: "YYYY-MM-DD HH:mm:ss" }
```

### `service.ts` — Metode obligatorii
- `validateFulfillmentData()` — validare adresă destinatar (județ required)
- `calculateShippingOptionPrice()` — apelează `/reports/awb/internal-tariff`
  - Params: `weight` (din sum variant weights), `recipient.county`, `info.service = "Standard"`, `info.packages.parcel = 1`
- `createFulfillment()` — apelează `POST /intern-awb` + `POST /order`
  - Salvează `awb_number` în `fulfillment.data`
  - `pickupHours: {first: "10:00", second: "14:00"}` (interval minim 2h)
- `cancelFulfillment()` — `DEL /awb?clientId=&awb=`
- `getFulfillmentDocuments()` — `GET /awb/label?clientId=&awbs[]=&pdf=1&format=A6`

### Activare condițională în `medusa-config.ts`
```typescript
if (process.env.FAN_COURIER_USERNAME && process.env.FAN_COURIER_PASSWORD) {
  modules.push({
    resolve: "./src/modules/fulfillment-fan-courier",
    options: {
      username: process.env.FAN_COURIER_USERNAME,
      password: process.env.FAN_COURIER_PASSWORD,
      clientId: process.env.FAN_COURIER_CLIENT_ID,
      baseUrl: process.env.FAN_COURIER_BASE_URL || "https://api.fancourier.ro",
    }
  })
}
```

### Shipping option Fan Courier (update DB)
Când modulul e activat, shipping option "Fan Courier" trebuie legat la noul provider în loc de `manual_manual`.

### Subscriber `order-placed-create-awb.ts` (nou)
```typescript
// pe event "order.created"
// dacă FAN_COURIER_* sunt setate și plata e confirmată:
//   createFulfillment() → AWB generat → salvat în order.metadata.awb_number
//   logează AWB number pentru admin
```

### ENV-uri noi în Railway (goale până vin credentialele)
```
FAN_COURIER_USERNAME=
FAN_COURIER_PASSWORD=
FAN_COURIER_CLIENT_ID=
FAN_COURIER_BASE_URL=https://api.fancourier.ro
```

---

## 2.4 Email tranzacțional — setări finale

```bash
# Setare explicită pe Railway (acum folosește fallback hardcodat)
railway variables --set "ORDER_NOTIFY_EMAIL=office@arcromdiamonds.ro"
```

**Test:** plasează comandă test Ramburs → verifică inbox `office@arcromdiamonds.ro` + email client.

---

## 2.5 Centralizare business info (opțional, non-blocker)

**Fișier nou:** `backend-storefront/src/lib/config/business.ts`
```typescript
export const BUSINESS = {
  name: "ARDMAG",
  phone: "+40 722 155 441",
  email: "office@arcromdiamonds.ro",
  address: "Calea Baciului 1-3, Cluj-Napoca 400230",
  hours: "L-V 08:00-16:00",
  hoursShort: "L-V 08-16",
} as const;
```
Înlocuire în ~10 fișiere (SiteHeader, SiteFooter, contact/page, despre-noi/page, etc.).

---

## 2.6 Test E2E complet ziua 2

| Scenariu | Așteptat |
|---|---|
| Comandă Ramburs, adresă RO completă | Order confirmed + email admin + email client |
| Comandă card Stripe test 4242... | 3DS challenge → success → order confirmed + email |
| Comandă cu cod poștal invalid | Eroare validare pe câmp |
| Județ selectat din dropdown | Salvat corect în `shipping_address.province` |
| Plată card fără webhook configurat | Order rămâne `pending payment` — webhook rezolvă |

---

## Notițe implementare

- **Stripe LIVE keys** (de la Cristian): când vin, actualizare `STRIPE_API_KEY` + `NEXT_PUBLIC_STRIPE_KEY` pe Railway + Vercel (sau env local storefront). Zero cod de schimbat.
- **3DS handling**: `stripe.confirmCardPayment()` gestionează SCA transparent; trebuie doar să nu apelăm `cart.complete()` înainte de confirmarea de la Stripe.
- **Fan Courier COD**: dacă plata e Ramburs, în `createFulfillment()` → setezi `info.cod = order.total_price` și `info.payment = "destinatar"` sau service = "Cont Colector".
- **Fan Courier greutate 0**: dacă vreo variantă nu are greutate, fallback la 500g per item (nu 0, altfel API FAN respinge).
