// Pure product types + formatting helpers. Catalogue data now lives in the database.

export type ThicknessId = "4mm" | "5mm";
export type DeliveryAreaId = "dhaka" | "outside";

export const PRODUCT_SIZE = "900 × 400mm";

export const THICKNESS_IDS: ThicknessId[] = ["4mm", "5mm"];

export interface Product {
  id: string;
  name: string;
  nameBn: string;
  description: string;
  descriptionBn: string;
  thickness: ThicknessId;
  price: number;
  regularPrice: number;
  imageUrl: string;
  sortOrder: number;
  active: boolean;
}

export interface DeliveryOption {
  id: DeliveryAreaId;
  label: string;
  labelBn: string;
  fee: number;
  eta: string;
}

export interface Storefront {
  products: Product[];
  delivery: DeliveryOption[];
}

export function getProduct(products: Product[], id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getDeliveryOption(
  options: DeliveryOption[],
  id: string,
): DeliveryOption | undefined {
  return options.find((d) => d.id === id);
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

/** Largest taka saving across the catalogue — used in offer copy. */
export function maxSaving(products: Product[]): number {
  return products.length ? Math.max(...products.map(savings)) : 0;
}

/** Headline discount percentage shown in offer badges. */
export function maxDiscountPercent(products: Product[]): number {
  return products.length ? Math.max(...products.map(discountPercent)) : 0;
}

const bdt = new Intl.NumberFormat("en-BD");

export function formatBdt(amount: number): string {
  return `৳${bdt.format(amount)}`;
}

const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

/** Format a number in Bangla digits, e.g. 400 -> ৪০০. */
export function toBanglaDigits(value: number | string): string {
  return String(value).replace(/\d/g, (d) => bnDigits[Number(d)] ?? d);
}
