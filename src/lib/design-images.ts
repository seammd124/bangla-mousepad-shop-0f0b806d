import bloodMoonSamurai from "@/assets/design-blood-moon-samurai.webp.asset.json";
import interfaceBlack from "@/assets/design-interface-black.webp.asset.json";
import interfaceWhite from "@/assets/design-interface-white.webp.asset.json";
import midnightGalaxy from "@/assets/design-midnight-galaxy.webp.asset.json";
import neonCity from "@/assets/design-neon-city.webp.asset.json";
import matrixBlue from "@/assets/design-matrix-blue.webp.asset.json";
import matrixWhite from "@/assets/design-matrix-white.webp.asset.json";
import cyclopsBlast from "@/assets/design-cyclops-blast.webp.asset.json";
import timeTraveller from "@/assets/design-time-traveller.webp.asset.json";

import type { DesignId } from "./catalog";

export const DESIGN_IMAGES: Record<DesignId, string> = {
  "blood-moon-samurai": bloodMoonSamurai.url,
  "interface-black": interfaceBlack.url,
  "interface-white": interfaceWhite.url,
  "midnight-galaxy": midnightGalaxy.url,
  "neon-city": neonCity.url,
  "matrix-blue": matrixBlue.url,
  "matrix-white": matrixWhite.url,
  "cyclops-blast": cyclopsBlast.url,
  "time-traveller": timeTraveller.url,
};
