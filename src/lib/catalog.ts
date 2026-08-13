// Pure product data — no image imports, safe to use on the server.

export type ThicknessId = "4mm" | "5mm";
export type DeliveryAreaId = "dhaka" | "outside";

export const PRODUCT_SIZE = "900 × 400mm";

export const THICKNESS_OPTIONS: {
  id: ThicknessId;
  label: string;
  labelBn: string;
  price: number;
  blurb: string;
  blurbBn: string;
}[] = [
  {
    id: "4mm",
    label: "4mm",
    labelBn: "৪ মি.মি.",
    price: 1399,
    blurb: "Low profile, fast glide",
    blurbBn: "পাতলা, দ্রুত গ্লাইড",
  },
  {
    id: "5mm",
    label: "5mm",
    labelBn: "৫ মি.মি.",
    price: 1799,
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
  { id: "dhaka", label: "Inside Dhaka", labelBn: "ঢাকার ভিতরে", fee: 60, eta: "1–2 days" },
  { id: "outside", label: "Outside Dhaka", labelBn: "ঢাকার বাইরে", fee: 120, eta: "3–5 days" },
];

export type DesignId =
  | "iso-grid"
  | "monogram"
  | "dhaka-dusk"
  | "zen-wave"
  | "circuit"
  | "topograph"
  | "halftone"
  | "blueprint"
  | "void";

export interface Design {
  id: DesignId;
  name: string;
  nameBn: string;
  description: string;
  descriptionBn: string;
}

export const DESIGNS: Design[] = [
  {
    id: "iso-grid",
    name: "Iso Grid",
    nameBn: "আইসো গ্রিড",
    description: "Fine isometric grid lines on deep black.",
    descriptionBn: "গাঢ় কালোর উপর সূক্ষ্ম আইসোমেট্রিক গ্রিড।",
  },
  {
    id: "monogram",
    name: "Monogram",
    nameBn: "মনোগ্রাম",
    description: "Centered Unique Modz mark, clean and quiet.",
    descriptionBn: "মাঝখানে ইউনিক মডজ মার্ক, ছিমছাম ডিজাইন।",
  },
  {
    id: "dhaka-dusk",
    name: "Dhaka Dusk",
    nameBn: "ঢাকা ডাস্ক",
    description: "Single-line city skyline across the pad.",
    descriptionBn: "প্যাড জুড়ে এক-রেখার শহরের স্কাইলাইন।",
  },
  {
    id: "zen-wave",
    name: "Zen Wave",
    nameBn: "জেন ওয়েভ",
    description: "Flowing contour waves, calm and wide.",
    descriptionBn: "বয়ে চলা ঢেউয়ের রেখা, শান্ত ও প্রশস্ত।",
  },
  {
    id: "circuit",
    name: "Circuit",
    nameBn: "সার্কিট",
    description: "Traced circuit paths for the build crowd.",
    descriptionBn: "টেক-প্রেমীদের জন্য সার্কিট ট্রেস ডিজাইন।",
  },
  {
    id: "topograph",
    name: "Topograph",
    nameBn: "টপোগ্রাফ",
    description: "Hairline contour map, subtle at a glance.",
    descriptionBn: "সূক্ষ্ম কনট্যুর ম্যাপ, চোখে আরামদায়ক।",
  },
  {
    id: "halftone",
    name: "Halftone",
    nameBn: "হাফটোন",
    description: "Dot gradient fading black into white.",
    descriptionBn: "কালো থেকে সাদায় মিশে যাওয়া ডট গ্রেডিয়েন্ট।",
  },
  {
    id: "blueprint",
    name: "Blueprint",
    nameBn: "ব্লুপ্রিন্ট",
    description: "Technical schematic layout, desk-ready.",
    descriptionBn: "টেকনিক্যাল ব্লুপ্রিন্ট লেআউট।",
  },
  {
    id: "void",
    name: "Void",
    nameBn: "ভয়েড",
    description: "Pure matte black. Nothing else.",
    descriptionBn: "নিখুঁত ম্যাট কালো। আর কিছু নয়।",
  },
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

const bdt = new Intl.NumberFormat("en-BD");

export function formatBdt(amount: number): string {
  return `৳${bdt.format(amount)}`;
}
