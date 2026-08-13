// Pure product data — no image imports, safe to use on the server.

export type ThicknessId = "4mm" | "5mm";
export type DeliveryAreaId = "dhaka" | "outside";

export const PRODUCT_SIZE = "900 × 400mm";

/** Regular (pre-discount) and offer price for each thickness tier. */
export const TIER_PRICING: Record<
  ThicknessId,
  { regularPrice: number; price: number }
> = {
  "4mm": { regularPrice: 1799, price: 1399 },
  "5mm": { regularPrice: 2299, price: 1799 },
};

export const THICKNESS_OPTIONS: {
  id: ThicknessId;
  label: string;
  labelBn: string;
  price: number;
  regularPrice: number;
  blurb: string;
  blurbBn: string;
}[] = [
  {
    id: "4mm",
    label: "4mm",
    labelBn: "৪ মি.মি.",
    price: TIER_PRICING["4mm"].price,
    regularPrice: TIER_PRICING["4mm"].regularPrice,
    blurb: "Low profile, fast glide",
    blurbBn: "পাতলা, দ্রুত গ্লাইড",
  },
  {
    id: "5mm",
    label: "5mm",
    labelBn: "৫ মি.মি.",
    price: TIER_PRICING["5mm"].price,
    regularPrice: TIER_PRICING["5mm"].regularPrice,
    blurb: "Extra cushion, plush feel",
    blurbBn: "বেশি কুশন, আরামদায়ক",
  },
];

export const DELIVERY_OPTIONS: {
  id: DeliveryAreaId;
  label: string;
  labelBn: string;
  fee: number;
  eta: string;
}[] = [
  { id: "dhaka", label: "Inside Dhaka", labelBn: "ঢাকার ভিতরে", fee: 70, eta: "1–2 days" },
  { id: "outside", label: "Outside Dhaka", labelBn: "ঢাকার বাইরে", fee: 130, eta: "3–5 days" },
];

export type DesignId =
  | "blood-moon-samurai"
  | "interface-black"
  | "interface-white"
  | "midnight-galaxy"
  | "neon-city"
  | "matrix-blue"
  | "matrix-white"
  | "cyclops-blast"
  | "time-traveller";

export interface Design {
  id: DesignId;
  name: string;
  nameBn: string;
  description: string;
  descriptionBn: string;
  thickness: ThicknessId;
  price: number;
  regularPrice: number;
}

function design(
  id: DesignId,
  name: string,
  nameBn: string,
  description: string,
  descriptionBn: string,
  thickness: ThicknessId,
): Design {
  return { id, name, nameBn, description, descriptionBn, thickness, ...TIER_PRICING[thickness] };
}

export const DESIGNS: Design[] = [
  design(
    "blood-moon-samurai",
    "Blood Moon Samurai",
    "ব্লাড মুন সামুরাই",
    "Lone warrior against a towering crimson moon, ink-wash style.",
    "রক্তলাল চাঁদের সামনে একাকী যোদ্ধা, কালি-ধোয়া ধাঁচে আঁকা।",
    "4mm",
  ),
  design(
    "interface-black",
    "INTERFACE Black",
    "ইন্টারফেস ব্ল্যাক",
    "Sci-fi HUD wireframe tunnel on deep black.",
    "গাঢ় কালোর উপর সাই-ফাই HUD ওয়্যারফ্রেম টানেল।",
    "4mm",
  ),
  design(
    "interface-white",
    "INTERFACE White",
    "ইন্টারফেস হোয়াইট",
    "The same HUD tunnel, inverted onto a clean white base.",
    "একই HUD টানেল, ঝকঝকে সাদা বেসে উল্টানো।",
    "4mm",
  ),
  design(
    "midnight-galaxy",
    "Midnight Galaxy",
    "মিডনাইট গ্যালাক্সি",
    "Stylised planets drifting across deep space greys.",
    "গভীর মহাকাশের ধূসরতায় ভেসে বেড়ানো গ্রহ।",
    "4mm",
  ),
  design(
    "neon-city",
    "Neon City",
    "নিয়ন সিটি",
    "Cyberpunk street glowing in red and blue neon.",
    "লাল-নীল নিয়ন আলোয় জ্বলজ্বলে সাইবারপাঙ্ক রাস্তা।",
    "4mm",
  ),
  design(
    "matrix-blue",
    "PC Parts Matrix Blue",
    "পিসি পার্টস ম্যাট্রিক্স ব্লু",
    "Teal line drawings of PC components on deep blue.",
    "গাঢ় নীলে পিসি যন্ত্রাংশের টিল রেখাচিত্র।",
    "4mm",
  ),
  design(
    "matrix-white",
    "PC Parts Matrix White",
    "পিসি পার্টস ম্যাট্রিক্স হোয়াইট",
    "The same component schematic in grey on clean white.",
    "একই যন্ত্রাংশের নকশা, সাদা বেসে ধূসর রেখায়।",
    "4mm",
  ),
  design(
    "cyclops-blast",
    "Cyclops Blast",
    "সাইক্লপস ব্লাস্ট",
    "Full-force optic blast in fiery red over midnight blue.",
    "গাঢ় নীলের উপর জ্বলন্ত লাল অপটিক ব্লাস্ট।",
    "5mm",
  ),
  design(
    "time-traveller",
    "Time Traveller Astronaut",
    "টাইম ট্রাভেলার অ্যাস্ট্রোনট",
    "Astronaut adrift in a vortex of clock faces and red light.",
    "ঘড়ির ঘূর্ণিতে ভেসে থাকা নভোচারী, লাল আলোর কেন্দ্র।",
    "5mm",
  ),
];

export function getDesign(id: string): Design | undefined {
  return DESIGNS.find((d) => d.id === id);
}

export function getThickness(id: string) {
  return THICKNESS_OPTIONS.find((t) => t.id === id);
}

export function getDelivery(id: string) {
  return DELIVERY_OPTIONS.find((d) => d.id === id);
}

/** Taka saved per unit versus the regular price. */
export function savings(item: { regularPrice: number; price: number }): number {
  return Math.max(0, item.regularPrice - item.price);
}

/** Whole-number discount percentage versus the regular price. */
export function discountPercent(item: { regularPrice: number; price: number }): number {
  if (!item.regularPrice) return 0;
  return Math.round((savings(item) / item.regularPrice) * 100);
}

/** Largest taka saving across the whole catalogue — used in offer copy. */
export const MAX_SAVING = Math.max(...DESIGNS.map(savings));

/** Headline discount percentage shown in offer badges. */
export const HEADLINE_DISCOUNT = Math.max(...DESIGNS.map(discountPercent));

const bdt = new Intl.NumberFormat("en-BD");

export function formatBdt(amount: number): string {
  return `৳${bdt.format(amount)}`;
}

const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

/** Format a number in Bangla digits, e.g. 400 -> ৪০০. */
export function toBanglaDigits(value: number | string): string {
  return String(value).replace(/\d/g, (d) => bnDigits[Number(d)] ?? d);
}
