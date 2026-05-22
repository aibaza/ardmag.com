-- scripts/dev/sanitize-clone.sql
--
-- Sanitize Medusa v2 schema dupa restore din productie.
-- Ruleaza in dev local DOAR. Productia nu se atinge.
--
-- Ruleaza in --single-transaction (vezi clone-prod-to-dev.sh): orice
-- esec face rollback la TOATE schimbarile - DB ramane in starea PRE-sanitize
-- (cu PII real, NU folosi).
--
-- Schema verificata via railway connect Postgres + information_schema (mai 2026).
-- Toate UPDATE-urile sunt IDEMPOTENTE: re-ruleaza si vei avea acelasi rezultat.
--
-- Reguli de anonimizare:
--   - identificatori personali -> 'Dev'/'User-<id-suffix>'
--   - emailuri -> '<scope>-<id>@dev.local'
--   - telefoane -> '+40700' + hash(id) modulo 1M
--   - adrese stradale -> 'Strada Dev <id-suffix>'
--   - city/country_code/province/postal_code -> PASTRATE (analytics geo OK)
--   - jsonb data/metadata -> golite sau PII keys sterse
--   - Stripe customer/payment IDs -> NULL (cheile sk_test_ oricum nu le acceseaza)
--   - api_key publishable -> regenerat cu pk_dev_*
--
-- Side effect: provider_identity.provider_metadata = NULL inseamna ca
-- password hash-urile sunt sterse. Login broken pana cand:
--   make dev-admin   (creeaza fresh admin dev@ardmag.local)

BEGIN;

-- pgcrypto pentru gen_random_bytes (Medusa migrations o creaza, dar defensive).
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================================================================
-- 1. customer (117 rows pe prod)
-- =========================================================================
UPDATE customer
SET
  email        = 'user-' || id || '@dev.local',
  first_name   = 'Dev',
  last_name    = 'User-' || substr(id, GREATEST(length(id)-5, 1)),
  phone        = '+40700' || lpad((abs(hashtext(id)) % 1000000)::text, 6, '0'),
  company_name = NULL,
  metadata     = CASE
                   WHEN metadata IS NULL THEN NULL
                   ELSE (metadata
                          - 'stripe_customer_id'
                          - 'stripe_payment_method_id'
                          - 'stripe_setup_intent_id'
                          - 'phone'
                          - 'email')
                 END
WHERE TRUE;   -- sanitize si soft-deleted: PII reala pe disc local e risc indiferent de visibility

-- =========================================================================
-- 2. customer_address (73 rows)
-- =========================================================================
UPDATE customer_address
SET
  first_name   = 'Dev',
  last_name    = 'User-' || substr(id, GREATEST(length(id)-5, 1)),
  company      = NULL,
  address_1    = 'Strada Dev ' || substr(id, GREATEST(length(id)-5, 1)),
  address_2    = NULL,
  address_name = COALESCE(address_name, 'Dev'),
  phone        = '+40700' || lpad((abs(hashtext(id)) % 1000000)::text, 6, '0'),
  metadata     = NULL
WHERE TRUE;   -- sanitize si soft-deleted: PII reala pe disc local e risc indiferent de visibility

-- =========================================================================
-- 3. order (6 rows; cuvant rezervat -> double-quote)
-- =========================================================================
UPDATE "order"
SET
  email    = 'order-' || id || '@dev.local',
  metadata = CASE
               WHEN metadata IS NULL THEN NULL
               ELSE (metadata
                      - 'stripe_payment_intent_id'
                      - 'stripe_charge_id'
                      - 'customer_phone'
                      - 'customer_email')
             END
WHERE TRUE;   -- sanitize si soft-deleted: PII reala pe disc local e risc indiferent de visibility

-- =========================================================================
-- 4. order_address (49 rows)
-- =========================================================================
UPDATE order_address
SET
  first_name = 'Dev',
  last_name  = 'User-' || substr(id, GREATEST(length(id)-5, 1)),
  company    = NULL,
  address_1  = 'Strada Dev ' || substr(id, GREATEST(length(id)-5, 1)),
  address_2  = NULL,
  phone      = '+40700' || lpad((abs(hashtext(id)) % 1000000)::text, 6, '0'),
  metadata   = NULL
WHERE TRUE;   -- sanitize si soft-deleted: PII reala pe disc local e risc indiferent de visibility

-- =========================================================================
-- 5. cart + cart_address (515 rows cart_address)
-- =========================================================================
UPDATE cart
SET
  email    = 'cart-' || id || '@dev.local',
  metadata = CASE
               WHEN metadata IS NULL THEN NULL
               ELSE metadata - 'customer_email' - 'customer_phone'
             END
WHERE TRUE;   -- sanitize si soft-deleted: PII reala pe disc local e risc indiferent de visibility

UPDATE cart_address
SET
  first_name = 'Dev',
  last_name  = 'User-' || substr(id, GREATEST(length(id)-5, 1)),
  company    = NULL,
  address_1  = 'Strada Dev ' || substr(id, GREATEST(length(id)-5, 1)),
  address_2  = NULL,
  phone      = '+40700' || lpad((abs(hashtext(id)) % 1000000)::text, 6, '0'),
  metadata   = NULL
WHERE TRUE;   -- sanitize si soft-deleted: PII reala pe disc local e risc indiferent de visibility

-- =========================================================================
-- 6. fulfillment_address
-- =========================================================================
UPDATE fulfillment_address
SET
  first_name = 'Dev',
  last_name  = 'User-' || substr(id, GREATEST(length(id)-5, 1)),
  company    = NULL,
  address_1  = 'Strada Dev ' || substr(id, GREATEST(length(id)-5, 1)),
  address_2  = NULL,
  phone      = '+40700' || lpad((abs(hashtext(id)) % 1000000)::text, 6, '0'),
  metadata   = NULL
WHERE TRUE;   -- sanitize si soft-deleted: PII reala pe disc local e risc indiferent de visibility

-- =========================================================================
-- 7. payment + payment_session + payment_collection
-- =========================================================================
-- Cu cheile dev sk_test_*, ID-urile prod pi_*/ch_*/cus_* nu sunt accesibile.
-- Le golim ca sa nu apara accidental in screenshots / debug logs.
UPDATE payment
SET data = '{}'::jsonb, metadata = NULL
WHERE TRUE;   -- sanitize si soft-deleted: PII reala pe disc local e risc indiferent de visibility

UPDATE payment_session
SET data = '{}'::jsonb, context = NULL, metadata = NULL
WHERE TRUE;   -- sanitize si soft-deleted: PII reala pe disc local e risc indiferent de visibility

UPDATE payment_collection
SET metadata = NULL
WHERE TRUE;   -- sanitize si soft-deleted: PII reala pe disc local e risc indiferent de visibility

-- =========================================================================
-- 8. account_holder (2 rows pe prod, CRITIC: contine Stripe cus_* real)
-- =========================================================================
UPDATE account_holder
SET
  email       = 'holder-' || id || '@dev.local',
  external_id = 'dev_' || id,
  data        = '{}'::jsonb,
  metadata    = NULL
WHERE TRUE;   -- sanitize si soft-deleted: PII reala pe disc local e risc indiferent de visibility

-- =========================================================================
-- 9. provider_identity (114 rows; entity_id = emailul de login pentru emailpass)
-- =========================================================================
UPDATE provider_identity
SET
  entity_id         = CASE
                        WHEN provider = 'emailpass' THEN 'user-' || id || '@dev.local'
                        ELSE 'dev-' || id
                      END,
  user_metadata     = NULL,
  provider_metadata = NULL    -- IMPORTANT: sterge password hash-uri.
                              -- Login broken -> ruleaza `make dev-admin` post-clone.
WHERE TRUE;   -- sanitize si soft-deleted: PII reala pe disc local e risc indiferent de visibility

-- =========================================================================
-- 10. auth_identity (app_metadata poate contine emailuri embedded)
-- =========================================================================
UPDATE auth_identity
SET app_metadata = NULL
WHERE TRUE;   -- sanitize si soft-deleted: PII reala pe disc local e risc indiferent de visibility

-- =========================================================================
-- 11. user (admin staff - 3 emailuri reale pe prod)
-- =========================================================================
UPDATE "user"
SET
  email      = 'admin-' || id || '@dev.local',
  first_name = 'Dev',
  last_name  = 'Admin',
  avatar_url = NULL,
  metadata   = NULL
WHERE TRUE;   -- sanitize si soft-deleted: PII reala pe disc local e risc indiferent de visibility

-- =========================================================================
-- 12. api_key publishable (1 row) - regenereaza pentru dev
-- =========================================================================
-- Storefront foloseste NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY.
-- Pastrarea cheii prod e safe (e un identificator opac, nu un secret),
-- DAR daca dev face requesturi cu ea, ele lovesc config sales_channel prod-side.
-- Regeneram cu pk_dev_*.
UPDATE api_key
SET
  token    = 'pk_dev_' || encode(gen_random_bytes(32), 'hex'),
  salt     = encode(gen_random_bytes(16), 'hex'),
  redacted = 'pk_dev_***'
WHERE type = 'publishable';   -- regenereaza si tokens soft-deleted (au fost emise candva, nu vrem leak)

-- =========================================================================
-- 13. newsletter_subscriber (custom module - exista DOAR dupa migrari locale)
-- =========================================================================
-- Pe prod NU exista (verificat). Pe dev exista dupa `npx medusa db:migrate`.
-- Defensive: wrap in DO ca sa nu crape --single-transaction daca tabela lipseste.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'newsletter_subscriber' AND relkind = 'r') THEN
    EXECUTE $sql$
      UPDATE newsletter_subscriber
      SET
        email             = 'newsletter-' || id || '@dev.local',
        confirm_token     = 'sanitized-confirm-' || id,
        unsubscribe_token = 'sanitized-unsub-'   || id
      WHERE 1=1
    $sql$;
  END IF;
END$$;

COMMIT;

-- Mark complete (in afara tranzactiei pt lizibilitate)
SELECT '[sanitize] OK at ' || now() AS status;
