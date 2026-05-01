# ardmag.com — Sprint lansare 3 zile (1-3 mai 2026)

## Structura acestui folder

Fiecare fișier de mai jos este un sub-plan independent, executabil cu planning mode:

| Fișier | Ziua | Scope | Status |
|---|---|---|---|
| [ziua-1-catalog.md](ziua-1-catalog.md) | 1 mai | Prețuri corecte, greutăți, produse noi, cleanup | BLOCAT pe XLS-uri de la Andrei |
| [ziua-2-lansare.md](ziua-2-lansare.md) | 2 mai | Stripe live, județe RO, Fan Courier stub, E2E test | Pregătit |
| [ziua-3-marketing.md](ziua-3-marketing.md) | 3 mai | GA4, FB Pixel, GB Page, banner promo, content | Pregătit |
| [blocked-items.md](blocked-items.md) | - | Dependențe externe de la Andrei/Cristian | Reference |
| [fan-courier-email.md](fan-courier-email.md) | ACUM | Draft email către Fan Courier pentru SelfAWB credentials | De trimis |
| [verificare-finala.md](verificare-finala.md) | Ziua 3 final | E2E checklist pre-lansare | Reference |

## Cum se folosesc sub-planurile

Deschide fișierul zilei respective și dă-l ca input lui Claude cu:
> "Folosind docs/plan-lansare-3-zile/ziua-1-catalog.md ca spec, intră în plan mode și fă un plan detaliat de implementare"

## Timeline și dependențe critice

```
ZI 1 (1 mai)
├── [BLOCAT] Andrei pune XLS-urile în docs/preturi/
│   └── deblochează: update preturi + greutăți
├── Cleanup mese de tăiat (nu are dependențe)
└── Import produse noi SAIT + Soluții Delta + Bundle

ZI 2 (2 mai)
├── Stripe Elements în checkout
├── Județe RO + cod poștal
├── Fan Courier modul stub
└── E2E test comandă

ZI 3 (3 mai)
├── GA4 + FB Pixel + consent banner
├── Google Business Page (manual)
├── Banner promo Tenax -30%
└── Verificare finală pre-lansare

PARALEL (oricând)
├── [Andrei] Cumpără ardmag.ro (70 lei/an)
├── [Cristian] Stripe LIVE keys
└── [Fan Courier] SelfAWB credentials (email trimis din fan-courier-email.md)
```

## Stare curentă (confirmată 1 mai 2026)

- **90 produse / 805 variante** pe Railway, 100% cu preț RON
- **0/805 variante** au greutatea populată
- **Stripe** — modul configurat, NU linkat la region RO, NU webhook
- **Fan Courier** — 0% integrat, shipping options statice ca fallback
- **Email** — SMTP2GO funcțional, 2 template-uri (customer + admin)
- **1 comandă test** în DB, fără comenzi reale
