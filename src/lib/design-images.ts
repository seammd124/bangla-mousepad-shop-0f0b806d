import isoGrid from "@/assets/design-iso-grid.jpg";
import monogram from "@/assets/design-monogram.jpg";
import dhakaDusk from "@/assets/design-dhaka-dusk.jpg";
import zenWave from "@/assets/design-zen-wave.jpg";
import circuit from "@/assets/design-circuit.jpg";
import topograph from "@/assets/design-topograph.jpg";
import halftone from "@/assets/design-halftone.jpg";
import blueprint from "@/assets/design-blueprint.jpg";
import voidPad from "@/assets/design-void.jpg";

import type { DesignId } from "./catalog";

export const DESIGN_IMAGES: Record<DesignId, string> = {
  "iso-grid": isoGrid,
  monogram: monogram,
  "dhaka-dusk": dhakaDusk,
  "zen-wave": zenWave,
  circuit: circuit,
  topograph: topograph,
  halftone: halftone,
  blueprint: blueprint,
  void: voidPad,
};
