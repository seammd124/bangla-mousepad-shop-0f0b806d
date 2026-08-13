# Unique Modz — Unipadz Mousepad COD Landing Page

A single-page bilingual (Bangla + English) storefront for **Unique Modz**, selling the **Unipadz** mousepad line. Customers browse 9 designs, pick a thickness (3mm/5mm), and place a Cash-on-Delivery order. Orders are saved to a backend database and viewable on a protected admin dashboard.

## Brand

- **Company:** Unique Modz
- **Product line:** Unipadz (the mousepads)
- **Logo:** the uploaded black isometric "UM" monogram — a 3D extruded U interlocking with a flat solid M, pure black on white.
- Header lockup: UM monogram + `UNIQUE MODZ` wordmark, with `UNIPADZ` as the product-line label. Logo also used as the favicon.

## Database

Postgres, as you asked — via **Lovable Cloud** (the built-in backend, PostgreSQL under the hood). Orders are stored in an `orders` table and shown on a protected `/admin` dashboard.


## Design direction — retheme to the logo

The approved layout/composition stays (Warm tactile premium structure), but the palette and detailing are re-cut to match the logo: **pure monochrome, hard geometry, isometric**.

- Palette: paper white `#ffffff` base, off-white `#f5f5f5` surface, ink black `#0a0a0a`, mid-grey `#3f3f46` (the logo's extruded shadow face), light grey `#d4d4d8` borders. No color accent — contrast and grey steps carry all emphasis, exactly like the mark.
- Typography: geometric, tight, uppercase for brand/labels — heavy grotesk display (matching the monogram's flat weight) + Inter for UI/body; **Hind Siliguri** for Bangla.
- Geometry: sharp corners (radius 0–2px, no pills), 1px hairline borders instead of soft rings, square buttons. Isometric motif — 30° extruded shadow on cards/buttons on hover, echoing the U's 3D face.
- Motion: restrained. Card lift with a hard offset shadow, smooth scroll-to-form, instant price update.

Carried into `src/styles.css` as semantic tokens (`--ink`, `--surface`, `--surface-alt`, `--edge`, `--shadow-iso`, `--font-display`, `--font-sans`, `--font-bangla`).

## Page sections (single route `/`)

1. **Sticky header** — UM monogram + `UNIQUE MODZ` lockup, anchor nav (Designs / Specifications / Delivery), and the `Order Now | এখনই কিনুন` button → smooth-scrolls to `#order-form`.
2. **Hero** — your uploaded **UniPadz intro video** as the centerpiece: portrait 9:16 clip, autoplay + muted + loop + `playsInline`, poster frame extracted from the video so nothing flashes before it loads. Beside it: uppercase headline, bilingual subline, price line (৳1,399 / ৳1,799), and the primary **Order Now** button.
   The 98MB source is compressed to a web-sized MP4 (plus a WebM) and hosted on the CDN via Lovable Assets, so the page stays fast.
3. **Specifications strip** — Size 900 × 400mm · Thickness 4mm / 5mm · stitched edge · anti-slip rubber base.
4. **Design gallery (`#gallery`)** — grid of Unipadz designs (image + name + short description). Clicking a card selects it and scrolls to the order form with that design pre-filled. Selected state: solid black border + corner mark. Built from a data file so adding your real designs later is a one-file edit.
5. **Order form (`#order-form`)** — two columns:
   - Left: the form (fields below), ending in `Confirm Cash on Delivery Order`.
   - Right (sticky): live Order Summary — design, thickness, qty, delivery fee, **Total ৳**, COD badge. Trust badges (Fast Delivery, Quality Check, 7-day return).
6. **Delivery / trust band** — COD nationwide, 1–2 days Dhaka / 3–5 days outside, return policy, contact.
7. **Footer** — UM monogram, support links, contact, social, "Made in Bangladesh".

## Order form fields and validation

Validated with zod on the client **and** re-validated server-side before insert. Errors show inline under each field, bilingual.

| Field | Rules |
|---|---|
| Email | **Optional.** If filled, must be a valid email or shows an error. |
| Phone | **Required.** Fixed `+88` country-code prefix rendered inside the field; the input accepts exactly 11 digits starting `01` and a valid BD operator digit (e.g. `01881655083`). Anything else → error. Stored as `+8801881655083`. |
| Name | Required. |
| Full address | Required (house, road, etc.). |
| City | Required. |
| Area | Required. |
| Postal code | Required, 4 digits (BD format). |
| Country | Fixed to **Bangladesh**, read-only. |
| Design | Required — select from the design list. |
| Thickness | Required — 4mm (৳1,399) or 5mm (৳1,799). Changing it updates the price everywhere instantly. |
| Quantity | 1–5. |
| Delivery area | Inside Dhaka ৳60 / Outside Dhaka ৳120. |

On submit: validate → call `placeOrder` server function → success state with order number. No online payment.

## Product data (`src/lib/products.ts`)

- **Size:** 900 × 400mm (all designs).
- **Thickness / price (same for every design):**
  - 4mm — **৳1,399**
  - 5mm — **৳1,799**
- **Designs:** you're sending the real designs + descriptions later. I'll build the gallery and selector against a placeholder set of 9 monochrome designs in the meantime, structured so dropping in your artwork, names, and descriptions is a single data-file update — no layout rework.


## Backend (Lovable Cloud / PostgreSQL)

Enable Lovable Cloud first. One migration creating:

```sql
create type public.order_status as enum ('new','confirmed','shipped','delivered','cancelled');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  customer_name text not null,
  email text,                        -- optional
  phone text not null,               -- stored as +8801XXXXXXXXX
  address text not null,
  city text not null,
  area text not null,
  postal_code text not null,
  country text not null default 'Bangladesh',
  design_id text not null,
  design_name text not null,
  thickness text not null,           -- '4mm' | '5mm'
  quantity int not null default 1,
  delivery_area text not null,       -- 'dhaka' | 'outside'
  unit_price int not null,           -- 1399 or 1799
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

## Media assets

- **Logo:** the uploaded UM monogram for the header lockup and footer, downscaled into `public/favicon.png` as the favicon.
- **Hero video:** your `UniPadz-1.mp4` (2160×3840, 21.7s, 98MB) compressed with ffmpeg to a web-ready MP4 (~1080×1920, H.264) plus a WebM fallback, uploaded via Lovable Assets and streamed from the CDN. A poster JPG is extracted from the first clean frame.
- **Design images:** placeholder monochrome renders under `src/assets/` until you send the real designs.

## What I need from you (can come after the build)

1. **The 9 mousepad designs + descriptions** — I'll build against placeholders and swap them in when you send them.
2. **Contact WhatsApp/phone number and/or email** for the contact section and footer.

## Out of scope (per "landing page only")

No online payment, no customer accounts/login, no cart for multiple products (one design per order), no product detail pages. Only the store-owner `/admin` dashboard exists behind login.

## Build order

1. Enable Lovable Cloud → write & apply the orders migration (table, grants, RLS, admin role).
2. Compress the hero video + extract poster; upload logo/video as CDN assets; set the favicon.
3. Add the monochrome/isometric tokens + fonts to `src/styles.css`; load fonts via `<link>` in `__root.tsx`.
4. Generate placeholder design images.
5. Build `src/lib/products.ts` and the landing page on `src/routes/index.tsx` (hero video, gallery, order form, live summary).
6. Add `placeOrder` server function with matching server-side zod validation; wire submit → DB insert → success state.
7. Build `/admin` dashboard route + `listOrders`/`updateOrderStatus`.
8. SEO head on `/` (Unique Modz / Unipadz title, description, og), verify build + preview.


