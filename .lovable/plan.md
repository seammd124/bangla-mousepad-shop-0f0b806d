# Unique Modz — Unipadz Mousepad COD Landing Page

A single-page bilingual (Bangla + English) storefront for **Unique Modz**, selling the **Unipadz** mousepad line. Customers browse 9 designs, pick a thickness (3mm/5mm), and place a Cash-on-Delivery order. Orders are saved to a backend database and viewable on a protected admin dashboard.

## Brand

- **Company:** Unique Modz
- **Product line:** Unipadz (the mousepads)
- **Logo:** the uploaded black isometric "UM" monogram — a 3D extruded U interlocking with a flat solid M, pure black on white.
- Header lockup: UM monogram + `UNIQUE MODZ` wordmark, with `UNIPADZ` as the product-line label. Logo also used as the favicon.

## Important: MongoDB is not available on this platform

You asked for MongoDB. This platform's built-in backend is **Lovable Cloud**, which runs on PostgreSQL (Supabase) — MongoDB is not supported here. The plan uses Lovable Cloud instead: a PostgreSQL `orders` table, server functions to insert orders, and a protected `/admin` dashboard to view them. Functionally it gives you exactly what you wanted (orders saved to a database, viewable on a backend dashboard) — just on Postgres, not Mongo. If MongoDB is a hard requirement, tell me and we'll reconsider.

## Design direction — retheme to the logo

The approved layout/composition stays (Warm tactile premium structure), but the palette and detailing are re-cut to match the logo: **pure monochrome, hard geometry, isometric**.

- Palette: paper white `#ffffff` base, off-white `#f5f5f5` surface, ink black `#0a0a0a`, mid-grey `#3f3f46` (the logo's extruded shadow face), light grey `#d4d4d8` borders. No color accent — contrast and grey steps carry all emphasis, exactly like the mark.
- Typography: geometric, tight, uppercase for brand/labels — heavy grotesk display (matching the monogram's flat weight) + Inter for UI/body; **Hind Siliguri** for Bangla.
- Geometry: sharp corners (radius 0–2px, no pills), 1px hairline borders instead of soft rings, square buttons. Isometric motif — 30° extruded shadow on cards/buttons on hover, echoing the U's 3D face.
- Motion: restrained. Card lift with a hard offset shadow, smooth scroll-to-form, instant price update.

Carried into `src/styles.css` as semantic tokens (`--ink`, `--surface`, `--surface-alt`, `--edge`, `--shadow-iso`, `--font-display`, `--font-sans`, `--font-bangla`).

## Page sections (single route `/`)

1. **Sticky header** — UM monogram + `UNIQUE MODZ` lockup, anchor nav (Designs / Specifications / Delivery), `Order Now | এখনই কিনুন` square button → scrolls to `#order-form`.
2. **Hero** — big uppercase headline introducing Unipadz, bilingual subline, `View Designs | ডিজাইন দেখুন` button, hero product image (black mousepad, high-contrast studio shot).
3. **Specifications strip** — material, dimensions, edge stitch, anti-slip base (4 spec cells with hairline dividers).
4. **Design gallery (`#gallery`)** — 9 selectable Unipadz design cards (image + bilingual name + "In Stock"). Clicking a card selects it and scrolls to the order form, pre-filling the chosen design. Selected state: solid black border + corner mark.
5. **Order form (`#order-form`)** — two columns:
   - Left: form — Name | নাম, Phone | ফোন নম্বর, Shipping Address | ডেলিভারি ঠিকানা, Design selector (the 9 designs), Thickness toggle (3mm / 5mm +৳100), Quantity stepper, Delivery area toggle (Inside Dhaka ৳60 / Outside Dhaka ৳120). `Confirm Cash on Delivery Order` button.
   - Right (sticky): live Order Summary card — design, thickness, qty, delivery fee, **Total ৳**, COD badge. Trust badges (Fast Delivery, Quality Check, 7-day return).
6. **Delivery / trust band** — COD nationwide, 1–2 days Dhaka / 3–5 days outside, return policy, contact.
7. **Footer** — UM monogram, support links, contact, social, "Made in Bangladesh".


On submit: client validation (zod) → call `placeOrder` server function → success state with order number; no online payment.

## Product data (defined in a client-safe `src/lib/products.ts`)

9 Unipadz designs, re-cut as a monochrome/geometric collection matching the logo (bilingual names), each with a generated image:
1. Iso Grid | আইসো গ্রিড — ৳850
2. Monogram | মনোগ্রাম (UM mark, oversized) — ৳950
3. Dhaka Lines | ঢাকা লাইনস — ৳850
4. Halftone | হাফটোন — ৳850
5. Extrude | এক্সট্রুড — ৳950
6. Blackout | ব্ল্যাকআউট (plain black, stitched edge) — ৳850
7. Topo Mono | টপো মনো — ৳850
8. Static | স্ট্যাটিক (noise/grain field) — ৳850
9. Bengal Motif | বাংলা মোটিফ (geometric, monochrome) — ৳950


Thickness: **3mm Slim** (base price) · **5mm Pro** (+৳100). Delivery: Inside Dhaka ৳60 · Outside Dhaka ৳120. Quantity 1–5.

## Backend (Lovable Cloud / PostgreSQL)

Enable Lovable Cloud first. One migration creating:

```sql
create type public.order_status as enum ('new','confirmed','shipped','delivered','cancelled');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  customer_name text not null,
  phone text not null,
  address text not null,
  design_id text not null,
  design_name text not null,
  thickness text not null,          -- '3mm' | '5mm'
  quantity int not null default 1,
  delivery_area text not null,       -- 'dhaka' | 'outside'
  unit_price int not null,
  delivery_fee int not null,
  total int not null,
  status public.order_status default 'new',
  note text
);
-- grants, RLS, policies (see below)
```

Grants + RLS: `INSERT` for `anon` (public order form, no login) with a `WITH CHECK` policy; `SELECT/UPDATE/DELETE` only for `service_role` and `admin` role (dashboard). No public read of orders.

Server functions (`src/lib/orders.functions.ts`):
- `placeOrder` (POST, public) — zod-validated input → inserts a row → returns `{ orderId }`.
- `listOrders` (POST, `requireSupabaseAuth` + admin role check) — returns orders for the dashboard.
- `updateOrderStatus` (POST, auth+admin) — changes status.

## Admin dashboard (`/admin`)

Protected route under `_authenticated/`. Gate via `requireSupabaseAuth` + `has_role('admin')`. Shows a table of all orders (date, customer, phone, design, thickness, qty, total, status) with a status dropdown and basic filters. You (the store owner) sign in with your Lovable Cloud account and are granted the `admin` role.

## Images (generated via imagegen)

- 1 hero image (warm overhead charcoal mousepad on wooden desk).
- 9 design images (one per design, matching each design's prompt). Saved under `src/assets/` and imported.

## What I need from you

1. **WhatsApp/phone number and/or email** for the contact section and order confirmation copy. (You chose "I'll type it" but didn't include it — send it after approving and I'll wire it in. Until then I'll use a clearly-marked placeholder you can edit.)
2. Confirmation that **Lovable Cloud (PostgreSQL)** is acceptable in place of MongoDB.

## Out of scope (per "landing page only")

No online payment, no customer accounts/login, no cart for multiple products (one design per order), no product detail pages. Only the store-owner `/admin` dashboard exists behind login.

## Build order

1. Enable Lovable Cloud → write & apply the orders migration (table, grants, RLS, admin role).
2. Add design tokens + fonts to `src/styles.css`; load fonts via `<link>` in `__root.tsx`.
3. Generate hero + 9 design images.
4. Build `src/lib/products.ts` and the landing page on `src/routes/index.tsx` (all sections, order form, live summary).
5. Add `placeOrder` server function; wire form submit → DB insert → success state.
6. Build `/admin` dashboard route + `listOrders`/`updateOrderStatus`.
7. SEO head on `/` (title, description, og), verify build + preview.
