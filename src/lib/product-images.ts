// Local product images — bundled with the app, no database / CDN lookup.
import bloodMoonSamurai from "@/assets/design-blood-moon-samurai.webp";
import cyclopsBlast from "@/assets/design-cyclops-blast.webp";
import interfaceBlack from "@/assets/design-interface-black.webp";
import interfaceWhite from "@/assets/design-interface-white.webp";
import matrixBlue from "@/assets/design-matrix-blue.webp";
import matrixWhite from "@/assets/design-matrix-white.webp";
import midnightGalaxy from "@/assets/design-midnight-galaxy.webp";
import neonCity from "@/assets/design-neon-city.webp";
import timeTraveller from "@/assets/design-time-traveller.webp";

export const PRODUCT_IMAGES: Record<string, string> = {
  "blood-moon-samurai": bloodMoonSamurai,
  "cyclops-blast": cyclopsBlast,
  "interface-black": interfaceBlack,
  "interface-white": interfaceWhite,
  "matrix-blue": matrixBlue,
  "matrix-white": matrixWhite,
  "midnight-galaxy": midnightGalaxy,
  "neon-city": neonCity,
  "time-traveller": timeTraveller,
};

/** Local image for a product code; falls back to any stored URL. */
export function productImage(id: string, fallback?: string): string {
  return PRODUCT_IMAGES[id] ?? fallback ?? "";
}
