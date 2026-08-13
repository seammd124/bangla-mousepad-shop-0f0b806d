# Add "Why Choose Unipadz" benefits section

## Goal
Integrate the user's provided marketing copy into the landing page as a dedicated, bilingual (English + Bangla) benefits section that sells the material quality and build of the Unipadz mousepad — beyond the terse spec tiles that already exist.

## Where it goes
Insert a new section in `src/routes/index.tsx`, between the existing **Specifications** section (`#specs`) and the **Designs gallery** (`#designs`). It does not replace the spec tiles; it expands on them with the richer copy the user supplied.

## Section structure — `#why-unipadz`

1. **Eyebrow + headline**
   - Eyebrow: `Why Unipadz` / `কেন ইউনিপ্যাডজ`
   - Headline (EN): `Smoother control. Better comfort. Premium desk aesthetics.`
   - Subline (BN): `গেমিং, অফিস, ডিজাইন বা পড়াশোনা — যেকোনো কাজে নিখুঁত মাউস ট্র্যাকিং আর আরামদায়ক অভিজ্ঞতা।`

2. **Intro paragraph** (bilingual, two-column on desktop)
   - EN: the user's first paragraph — "Experience smoother control, better comfort, and premium desk aesthetics… precise mouse tracking with a soft and durable surface… high-quality materials, smooth micro-textured cloth surface for speed and accuracy, anti-slip rubber base… stitched edges prevent fraying."
   - BN: a faithful Bangla translation of the same.

3. **Three feature blocks** ("Why Choose Unipadz?" bullets) in a 3-up grid, each with icon + title + EN body + BN body, sourced from the user's three bullets:
   - **Ultra Smooth Finish** — Ultra Smooth Finish microfiber fabric for smooth, accurate mouse movement (gaming + pro work). BN equivalent.
   - **Natural Rubber Base** — High-quality natural rubber, strong anti-slip grip, long-lasting comfort during extended use. BN equivalent.
   - **Premium Stitched Edges** — Built to prevent fraying, more durable and reliable over time. BN equivalent.

   Icons reused from the existing `lucide-react` set (e.g. `Sparkles`, `Grip`, `Stitch`/`ShieldCheck`) to stay monochrome and consistent.

## Data file
Add the section's text as a small `WHY_FEATURES` array + intro copy constant in `src/lib/catalog.ts` (or a new `src/lib/why.ts`), so copy lives in data — not inline JSX — matching the existing `FEATURES` pattern.

## Styling
Reuse existing tokens (`bg-surface-alt`, `border-ink`, `font-display`, `.eyebrow`, `.bn`). No new colors. Hard-cornered cards with hairline borders, consistent with the approved monochrome/isometric direction.

## Out of scope
No changes to the order form, pricing, database, or design gallery. No new dependencies.

## Verification
- `tsgo` typecheck passes.
- Visual check in the preview: new section renders between Specs and Designs, bilingual text legible, monochrome styling intact.
