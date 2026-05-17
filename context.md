# BookingLN — Project Context

## Overview
BookingLN is a water/liquid product booking web app built with **React + Vite + Supabase**.  
Users browse products, add them to a cart, and place orders with delivery details.  
Admins can view all orders, change statuses, and see sales analytics.

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 19, Vite 8                    |
| Routing    | React Router DOM v7                 |
| Styling    | Tailwind CSS v4 (via `@tailwindcss/vite`), inline styles |
| Backend    | Supabase (PostgreSQL + RLS)         |
| Auth       | Phone-based localStorage (no Supabase Auth yet) |
| Deployment | GitHub Pages via `gh-pages`         |

---

## Environment Variables (`.env`)

```
VITE_SUPABASE_URL=https://xqykvtxmgxztjqfrawfh.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

`.env` and `supabase_creds.json` are both in `.gitignore`.

---

## Routing

| Path         | Page           | Access     |
|--------------|----------------|------------|
| `/`          | → `/login`     | Public     |
| `/login`     | Login          | Public     |
| `/home`      | Home           | Auth       |
| `/products`  | Products       | Auth       |
| `/orders`    | Orders         | Auth       |
| `/cart`      | Cart           | Auth       |
| `/analytics` | Analytics      | Admin only |

**Route protection:** Each page reads `localStorage.getItem('user')` and redirects to `/login` if null.  
**Admin guard:** Analytics redirects non-admin users to `/home`.

---

## Authentication

- No Supabase Auth implemented yet.
- On login, phone number is validated (10 digits minimum).
- A user object is saved to `localStorage`:
  ```js
  { phone: '9876543210', role: 'user' }
  ```
- Phone `9999999999` gets `role: 'admin'`.
- Logout clears localStorage and redirects to `/login`.

---

## Database Schema

### `products`
```sql
create table products (
  id               uuid primary key default gen_random_uuid(),
  name             text,
  description      text,
  price_per_litre  numeric,
  is_active        boolean default true
);
```

### `orders`
```sql
create table orders (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id),  -- nullable for now (no Supabase Auth yet)
  total_amount     numeric,
  delivery_address text,
  building_name    text,
  org_name         text,
  purpose          text,
  purchaser_name   text,
  phone            text,                             -- used to link order to logged-in user
  status           text default 'placed',
  estimated_delivery timestamp,
  created_at       timestamp default now()
);
```

### `order_items`
```sql
create table order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid references orders(id),
  product_id  uuid references products(id),
  litres      numeric,
  price       numeric   -- stores line-item total (litres × price_per_litre)
);
```

### `users`
```sql
create table users (
  id    uuid primary key references auth.users(id),
  phone text,
  role  text default 'user'
);
```

---

## Supabase RLS Policies

Run these in Supabase SQL Editor:

```sql
-- products (read)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON products FOR SELECT TO anon USING (true);

-- orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_orders"  ON orders FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_select_orders"  ON orders FOR SELECT TO anon USING (true);
CREATE POLICY "anon_update_orders"  ON orders FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_order_items" ON order_items FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_select_order_items" ON order_items FOR SELECT TO anon USING (true);

-- Make user_id nullable (no Supabase Auth yet)
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

-- Extra columns added to orders
ALTER TABLE orders ADD COLUMN building_name    text;
ALTER TABLE orders ADD COLUMN org_name         text;
ALTER TABLE orders ADD COLUMN purpose          text;
ALTER TABLE orders ADD COLUMN purchaser_name   text;
ALTER TABLE orders ADD COLUMN phone            text;
```

---

## File Structure

```
src/
├── App.jsx                        # Route definitions
├── main.jsx                       # Entry — BrowserRouter + CartProvider
├── index.css                      # Tailwind import + global styles + btn animations
│
├── lib/
│   └── supabase.js                # Supabase client (reads from .env)
│
├── context/
│   └── CartContext.jsx            # Cart state — addToCart, removeFromCart, clearCart
│
├── pages/
│   ├── Login.jsx                  # Phone login → saves user to localStorage
│   ├── Home.jsx                   # Dashboard — 4 analytics KPI tiles + quick actions
│   ├── Products.jsx               # Product grid — fetch active products, proceed to buy
│   ├── Orders.jsx                 # Orders table — filters, admin inline status change, row click for detail
│   ├── Cart.jsx                   # Cart items, total, place order → opens OrderModal
│   └── Analytics.jsx             # Admin only — revenue chart, status breakdown, top products
│
└── components/
    ├── Navbar.jsx                 # Sticky nav — tabs differ for admin vs user, cart badge
    ├── ProductCard.jsx            # Card with litres input, add-to-cart animation
    ├── OrderModal.jsx             # Delivery details form — inserts orders + order_items
    ├── OrderDetailModal.jsx       # Order detail popup — items, status change (admin)
    ├── StatusBadge.jsx            # Coloured pill badge for order status
    └── TestTubes.jsx              # SVG decoration used on Login and Home
```

---

## Pages — Detail

### Login (`/login`)
- Phone input with `+91` prefix
- 10-digit validation
- Saves `{ phone, role }` to localStorage
- Redirects to `/home`

### Home (`/home`)
- Fetches user's orders from Supabase (`phone = user.phone`)
- 4 KPI stat tiles: Total Orders, Pending, Delivered, Total Spent
- Quick action buttons: Browse Products, View Orders

### Products (`/products`)
- Fetches `products` where `is_active = true`
- Responsive grid (`auto-fill, minmax(280px, 1fr)`)
- Each `ProductCard`: name, description, price/L, litres input, live total, Add to Cart
- Add to Cart: green "✓ Added" bounce animation for 1.5s, card border glows
- "Proceed to Buy →" button at bottom → navigates to `/cart`

### Orders (`/orders`)
- **Admin:** sees all orders; inline status dropdown per row (saves immediately); click row → OrderDetailModal
- **User:** sees only their own orders (filtered by `phone`); read-only status badge
- Filters: search (ID/name/address), status dropdown, date from/to, clear button
- Skeleton loading rows

### Cart (`/cart`)
- Lists cart items from CartContext
- Shows subtotal per item and grand total
- "Place Order" → opens `OrderModal` with delivery details form
- After successful order: success screen with order ID, cart is cleared

### Analytics (`/analytics`) — Admin only
- Date range: presets (7/30/90 days) + custom from/to date picker
- KPI cards: Total Revenue, Orders, Avg Order Value, Total Litres
- Revenue over time — CSS bar chart grouped by day
- Orders by status — horizontal progress bars
- Top 5 products by litres — horizontal progress bars

---

## Components — Detail

### Navbar
- Sticky, `z-index: 10`
- Admin tabs: Home, Products, Orders, Analytics, Cart
- User tabs: Home, Products, Orders, Cart
- Cart tab shows item count badge
- Logout clears localStorage → `/login`

### CartContext
- `cartItems`: `[{ product, litres }]`
- `addToCart(product, litres)`: accumulates litres if product already in cart
- `removeFromCart(productId)`
- `clearCart()`
- Wrapped in `main.jsx` so all pages share state

### OrderModal
- Triggered from Cart page "Place Order"
- Fields: Purchaser Name*, Organisation, Building/Site Name*, Delivery Address*, Purpose*
- Phone auto-filled from `localStorage` (not shown in form)
- On submit: inserts `orders` row → then inserts all `order_items`
- Shows server errors inline

### OrderDetailModal
- Opened by admin clicking a row in Orders table
- Shows full delivery info in a 2-col grid
- Fetches `order_items` joined with `products` on open
- Admin-only status change dropdown + Save button with "✓ Saved" feedback

---

## Cart Flow

```
Products page
  → Add to Cart (ProductCard) → CartContext.addToCart()
  → Proceed to Buy → /cart

Cart page
  → Place Order → OrderModal (delivery form)
  → Confirm Order → INSERT orders + order_items → clearCart()
  → Success screen with order ID
```

---

## Admin vs User Differences

| Feature               | User            | Admin                  |
|-----------------------|-----------------|------------------------|
| Orders visible        | Own only        | All orders             |
| Order status          | Read-only badge | Inline dropdown + modal|
| Analytics tab         | Hidden          | Visible                |
| Order detail modal    | No              | Yes (click row)        |
| Navbar tabs           | 4 tabs          | 5 tabs (+ Analytics)   |

---

## Deployment

- Hosted on GitHub Pages at `https://rohithporeddy.github.io/BookingLN/`
- Vite `base` is set to `/BookingLN/` in `vite.config.js`
- `BrowserRouter` uses `basename="/BookingLN"` in `main.jsx`
- Deploy command: `npm run deploy` (runs `vite build` then `gh-pages -d dist`)
- **Note:** GitHub Pages doesn't support client-side routing on direct URL access (use HashRouter if this becomes an issue)

---

## Known Limitations / Future Work

1. **No Supabase Auth** — login is phone + localStorage only. `orders.user_id` is nullable as a result. When Supabase phone OTP auth is added:
   - Set `user_id` from `auth.uid()`
   - Re-enable NOT NULL on `orders.user_id`
   - Update RLS policies to use `auth.uid() = user_id`
   - Remove the `phone` column from `orders` (redundant)

2. **No OTP verification** — any 10-digit number can log in as any user.

3. **Cart is in-memory** — refreshing the page clears the cart (CartContext is not persisted).

4. **No order editing** — users cannot modify or cancel their own orders from the UI.

5. **Delivery charge** — shown as "TBD" in the cart total section.

6. **No pagination** — Orders and Analytics pages load all records at once.
