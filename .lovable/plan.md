# Replace placeholder designs with the real Unipadz catalog

The landing page is built and working, but the 9 gallery designs are AI-generated placeholders and the order form treats thickness as a free choice for every design. The real catalog on `uniquemodz.com` reveals a different structure, so this update swaps in the real artwork and fixes the pricing model to match reality.

## What the real site shows (verified)

9 designs, each sold in **one fixed thickness** (not 9 × 2 thicknesses). Price is determined by thickness, which is determined by the design:

| # | Design | Fixed thickness | Offer price | Was | Image file |
|---|---|---|---|---|---|
| 1 | Blood Moon Samurai | 4mm | ৳1,399 | ৳1,799 | Unipadz-5.webp |
| 2 | INTERFACE Black | 4mm | ৳1,399 | ৳1,799 | Unipadz-9.webp |
| 3 | INTERFACE White | 4mm | ৳1,399 | ৳1,799 | Unipadz-4.webp |
| 4 | Midnight Galaxy | 4mm | ৳1,399 | ৳1,799 | Unipadz-2.webp |
| 5 | Neon City | 4mm | ৳1,399 | ৳1,799 | Unipadz-6.webp |
| 6 | PC Parts Matrix Blue | 4mm | ৳1,399 | ৳1,799 | Unipadz-7.webp |
| 7 | PC Parts Matrix White | 4mm | ৳1,399 | ৳1,799 | Unipadz-1.webp |
| 8 | Cyclops Blast | 5mm | ৳1,799 | ৳2,299 | Unipadz-3.webp |
| 9 | Time Traveller Astronaut | 5mm | ৳1,799 | ৳2,299 | Unipadz-8.webp |

All are 900 × 400mm, natural rubber, anti-slip, stitched edges, washable.

Design visuals (confirmed via image inspection):
- **Blood Moon Samurai** — red samurai before a giant red moon, ink-wash, red/black/white.
- **Cyclops Blast** — Marvel's Cyclops firing an optic blast, fiery red/orange + dark blue. *(Note: this is licensed/copyrighted character art. It's already on your live store, so I'll include it as-is, but flagging it for your awareness.)*
- **INTERFACE Black / White** — sci-fi HUD 3D wireframe tunnel, black or white base.
- **Midnight Galaxy** — stylized planets on dark grey/black space backdrop.
- **Neon City** — cyberpunk neon street, red + blue glow.
- **PC Parts Matrix Blue / White** — line drawings of PC components on dark blue / clean white.
- **Time Traveller Astronaut** — astronaut in a vortex of clock faces, glowing red core.

## The pricing model change

Current code: design selector + independent thickness selector (4mm/5mm), price = thickness price. That lets a customer pick e.g. Blood Moon + 5mm — a combo that doesn't exist.

New model: **design-driven pricing.** Each `Design` carries its own `thickness` and `price`. Picking a design sets both. The standalone thickness selector becomes a read-only display showing the selected design's thickness and price; no invalid combos are possible.

- 4mm designs → ৳1,399 (show ৳1,799 struck-through as the "was" price)
- 5mm designs → ৳1,799 (show ৳2,299 struck-through as the "was" price)

This keeps the user's original "2 thickness options" intent (both 4mm and 5mm are offered across the line) while being accurate to what's actually sold.

## Files to change

1. **`src/lib/catalog.ts`**
   - Replace the 9 placeholder `Design` entries with the 9 real ones above (id, name, nameBn, description, descriptionBn).
   - Add `thickness: ThicknessId` and `price: number` (and optional `wasPrice`) fields to the `Design` interface, set per design.
   - Keep `THICKNESS_OPTIONS` for labels/pricing reference, but the order form no longer lets the user pick it freely.
   - Add short Bangla descriptions for each design.

2. **`src/lib/design-images.ts`**
   - Replace the 9 placeholder asset imports with the 9 real `.webp` images (downloaded from uniquemodz.com, uploaded to the CDN via Lovable Assets, referenced by `.asset.json` pointers).
   - Map new `DesignId` values to the real images.

3. **`src/components/site/OrderForm.tsx`**
   - Remove the standalone thickness `<select>`/radio.
   - When a design is chosen, set `thickness` and `unitPrice` from that design's fields (read-only display in the summary).
   - Live summary shows: design name, its thickness, its price (with struck-through "was" price), qty, delivery fee, total.
   - zod schema: `thickness` still validated server-side, but it now must equal the chosen design's thickness.

4. **`src/routes/index.tsx`** (gallery + hero)
   - Gallery cards render the real image, name, description, a thickness badge (4mm/5mm), and price (৳1,399 / ৳1,799 with struck-through original).
   - Clicking a card selects that design and scrolls to the form (already works; just uses new data).
   - Hero price line stays ৳1,399 / ৳1,799.

5. **`src/lib/order-schema.ts`** — no structural change; `thickness` remains a required field, now derived from the design client-side and re-validated server-side.

## Backend

No schema change needed. `orders` already stores `design_id`, `design_name`, `thickness`, `unit_price`. The server-side `placeOrder` validation just needs to confirm the submitted `thickness`/`unit_price` match the chosen design (reject mismatched combos) — a small guard added to the existing zod handler.

## Out of scope

No new routes, no online payment, no product detail pages. Only the catalog data, images, and form interaction model change. Admin dashboard is unaffected (it already shows design/thickness/price columns).

## Build order

1. Download the 9 real `.webp` images from `uniquemodz.com/wp-content/uploads/2026/06/`, upload each via `lovable-assets`, write `.asset.json` pointers.
2. Rewrite `catalog.ts` with the 9 real designs (+ thickness/price/wasPrice per design, + Bangla descriptions).
3. Rewrite `design-images.ts` to map the new design IDs to the real asset URLs.
4. Update `OrderForm.tsx` to design-driven thickness/pricing (remove free thickness selector, show read-only + struck-through price).
5. Update `index.tsx` gallery cards with thickness badges and offer prices.
6. Add a server-side guard in `placeOrder` so thickness/price must match the design.
7. Verify build + preview: gallery shows real art, picking a design sets its price, order submit still writes a row.
