# ardmag.com -- Sprint lansare (actualizat 4 mai 2026)

## Status curent (4 mai 2026, seara)

| Zona | Status | Note |
|---|---|---|
| Catalog Railway | GATA | 923 variante, preturi+greutati corecte, stoc nelimitat |
| Stripe checkout | PARTIAL | Sandbox activ, banner TEST in checkout. LIVE keys asteptate de la Cristian |
| Email SMTP2GO | PARTIAL | Config gata, DKIM/SPF ardmag.ro neverificat inca |
| Fan Courier | PARTIAL | Modul stub functional, tarife flat. Credentials asteptate de la Andrei |
| DNS ardmag.ro | GATA | Vercel live |
| DNS ardmag.com | PENDING | Nameservere cu Andrei in persoana |
| Facebook page | GATA | Confirmat de Ciprian |
| GA4 / Meta Pixel | BLOCAT | Asteptam ID-uri de la Cristian/Andrei |
| Descrieri produse | PARTIAL | 16/22 texte gata in docs/content/, 6 intrebari la Andrei |
| Imagini R2 | PARTIAL | SAITRON 125/180 imagini gresite -- asteapta Andrei |

## Infrastructura productie (confirmat 4 mai)

```
ardmag.ro        -> Vercel (Next.js storefront)
api.ardmag.ro    -> Railway (Medusa v2 backend)
DB               -> Railway Postgres (postgres.railway.internal:5432)
Redis            -> Railway Redis (activ, folosit de Medusa)
Imagini          -> Cloudflare R2 (pub-28d7a4f80d924560ae8c2fe111240e4a.r2.dev)
Admin            -> https://admin.ardmag.ro (pe Railway)
```

IMPORTANT: localhost:5432/ardmag este DB de DEV local, nu productie.
Orice modificare de catalog se face cu: railway connect Postgres sau prin scripts/ cu --apply.

## Ce mai ramane pentru lansare completa

### Blocat pe noi (maine 5 mai)
- [ ] Stripe webhook sandbox -- endpoint in Stripe Dashboard + STRIPE_WEBHOOK_SECRET in Railway env
- [ ] SMTP2GO DKIM/SPF -- adauga records DNS in Cloudflare pentru ardmag.ro
- [ ] Test email E2E -- comanda test -> email primit la comenzi@ardmag.ro

### Blocat pe Cristian/Andrei
- [ ] Stripe LIVE keys (sk_live_, pk_live_) -- de la Cristian
- [ ] GA4 Measurement ID (G-XXXXXXXXXX) -- de la Cristian/Andrei
- [ ] Meta Pixel ID -- de la Cristian/Andrei
- [ ] Fan Courier SelfAWB credentials -- de la Andrei/Anca
- [ ] Imagini SAITRON 125/180 corecte -- de la Andrei
- [ ] ardmag.com nameservere -- cu Andrei in persoana
- [ ] Confirmare 10 produse draft (publicate sau ascunse intentionat)
- [ ] POTEN pret confirmat (108/83 RON sau altceva)

## Fișiere de referinta

- [email-andrei-04mai.md](../email-andrei-04mai.md) -- email de trimis azi
- [verificare-finala.md](verificare-finala.md) -- checklist E2E pre-lansare
- [blocked-items.md](blocked-items.md) -- dependente externe
- `scripts/update-all-prices-weights.ts` -- script preturi+greutati (--apply = Railway)
- `docs/content/` -- descrieri produse cercetate (gata de importat)
