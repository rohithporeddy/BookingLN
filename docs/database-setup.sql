-- =============================================================================
-- BookingLN — Full Database Setup Script
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard)
-- Safe to re-run: all statements use IF NOT EXISTS / DROP IF EXISTS guards.
-- =============================================================================
-- TABLE OF CONTENTS
--   1. Extensions
--   2. Tables
--       2a. products
--       2b. orders
--       2c. order_items
--       2d. users  (for future Supabase Auth integration)
--   3. Row Level Security (RLS)
--   4. Sample data
-- =============================================================================


-- =============================================================================
-- 1. EXTENSIONS
-- =============================================================================

-- uuid_generate_v4() is used as a fallback; gen_random_uuid() (used below)
-- is built-in to Postgres 13+ and does not need this extension.
-- Included here for completeness / older Postgres versions.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- =============================================================================
-- 2. TABLES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 2a. products
--     Catalogue of items users can order.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT        NOT NULL,
  description     TEXT,
  price_per_litre NUMERIC     NOT NULL,   -- price per unit (litre / kg / bag …)
  is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN products.price_per_litre IS
  'Price per unit. The unit label (litre / kg / bag) is configured in app.config.js — the column name stays generic.';


-- -----------------------------------------------------------------------------
-- 2b. orders
--     One row per placed order.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- user_id links to auth.users once Supabase Auth is enabled.
  -- Nullable for now because the app uses phone-based localStorage auth.
  user_id           UUID        REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Monetary totals
  total_amount      NUMERIC     NOT NULL,

  -- Delivery information
  delivery_address  TEXT        NOT NULL,
  building_name     TEXT,
  org_name          TEXT,
  purpose           TEXT,
  purchaser_name    TEXT,

  -- Phone is used to link orders to the logged-in user (no Supabase Auth yet).
  -- Remove this column once user_id is populated from auth.uid().
  phone             TEXT,

  -- Lifecycle
  status            TEXT        NOT NULL DEFAULT 'placed'
                    CHECK (status IN ('placed', 'confirmed', 'delivered', 'cancelled')),
  estimated_delivery TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Make user_id nullable (no Supabase Auth yet — phone column is used instead)
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

COMMENT ON COLUMN orders.phone IS
  'Temporary: links order to user via phone number. Once Supabase Auth is added, '
  'populate user_id from auth.uid() and drop this column.';

COMMENT ON COLUMN orders.status IS
  'Values: placed | confirmed | delivered | cancelled';


-- -----------------------------------------------------------------------------
-- 2c. order_items
--     Line items belonging to an order.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID    NOT NULL REFERENCES orders(id)   ON DELETE CASCADE,
  product_id  UUID    NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  litres      NUMERIC NOT NULL,            -- quantity in the configured unit
  price       NUMERIC NOT NULL,            -- line-item total (litres × price_per_litre)
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN order_items.litres IS
  'Quantity ordered. Unit meaning is controlled by app.config.js > unit.label.';

COMMENT ON COLUMN order_items.price IS
  'Stores the line-item total at time of order (litres × price_per_litre). '
  'Snapshotted so historic orders are unaffected by future price changes.';


-- -----------------------------------------------------------------------------
-- 2d. users
--     Extended user profile — linked to Supabase Auth.
--     NOT used yet (app uses localStorage). Included for future migration.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT,
  role  TEXT NOT NULL DEFAULT 'user'
        CHECK (role IN ('user', 'admin')),
  name  TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- =============================================================================
-- The app uses the anon key (no authenticated users yet), so all policies
-- target the `anon` role. Tighten these once Supabase Auth is enabled.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- products — read-only for everyone
-- -----------------------------------------------------------------------------
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_anon_select" ON products;
CREATE POLICY "products_anon_select"
  ON products FOR SELECT
  TO anon
  USING (true);


-- -----------------------------------------------------------------------------
-- orders — anon users can insert their own orders and read/update all orders.
-- (Update needed so admins can change status via the anon key.)
-- Tighten to: USING (phone = current_setting('request.jwt.claims')...) once Auth is added.
-- -----------------------------------------------------------------------------
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_anon_insert" ON orders;
CREATE POLICY "orders_anon_insert"
  ON orders FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "orders_anon_select" ON orders;
CREATE POLICY "orders_anon_select"
  ON orders FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "orders_anon_update" ON orders;
CREATE POLICY "orders_anon_update"
  ON orders FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);


-- -----------------------------------------------------------------------------
-- order_items — anon users can insert and read
-- -----------------------------------------------------------------------------
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_items_anon_insert" ON order_items;
CREATE POLICY "order_items_anon_insert"
  ON order_items FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "order_items_anon_select" ON order_items;
CREATE POLICY "order_items_anon_select"
  ON order_items FOR SELECT
  TO anon
  USING (true);


-- =============================================================================
-- 4. SAMPLE DATA
-- =============================================================================
-- Remove or comment this section after first run if you don't want test data.
-- =============================================================================

INSERT INTO products (name, description, price_per_litre, is_active) VALUES
  ('Purified Water',    'Triple-filtered, RO purified drinking water.',          2.50,  TRUE),
  ('Mineral Water',     'Naturally sourced mineral water with balanced pH.',     3.75,  TRUE),
  ('Alkaline Water',    'Ionised alkaline water, pH 8+. Great for hydration.',   5.00,  TRUE),
  ('Distilled Water',   'Steam-distilled, zero impurities. Ideal for labs.',     4.00,  TRUE),
  ('Sparkling Water',   'Carbonated natural spring water.',                      6.00,  TRUE),
  ('Legacy Product',    'Discontinued — not shown in the app.',                  1.00,  FALSE)
ON CONFLICT DO NOTHING;


-- =============================================================================
-- DONE
-- =============================================================================
-- Tables created:  products, orders, order_items, users
-- RLS enabled on:  products, orders, order_items
-- Policies added:  anon SELECT on products
--                  anon INSERT / SELECT / UPDATE on orders
--                  anon INSERT / SELECT on order_items
--
-- Next steps after enabling Supabase Auth:
--   1. Populate orders.user_id from auth.uid() in the app.
--   2. ALTER TABLE orders ALTER COLUMN user_id SET NOT NULL;
--   3. Replace USING (true) on orders policies with:
--        USING (user_id = auth.uid())   -- users see only their own orders
--      Keep a separate admin policy using a custom claim or the users table.
--   4. Drop orders.phone once user_id is populated everywhere.
-- =============================================================================
