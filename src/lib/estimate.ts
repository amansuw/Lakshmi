import { NEPAL_DUTY_STACK, TOLA_GRAMS, TROY_OZ_GRAMS } from "@/lib/constants";

/** Convert live XAU/USD into an estimated Nepal fine-gold retail price. */
export function estimateNepalFromSpot(
  usdPerOz: number,
  usdToNpr: number,
): { per10g: number; perTola: number } {
  const nprPerGram =
    (usdPerOz * usdToNpr) / TROY_OZ_GRAMS;
  const base10g = nprPerGram * 10;
  const stacked =
    base10g *
    (1 + NEPAL_DUTY_STACK.customsDuty) *
    (1 + NEPAL_DUTY_STACK.importerMargin) *
    (1 + NEPAL_DUTY_STACK.dealerMargin) *
    (1 + NEPAL_DUTY_STACK.estimatedAdjustment);

  const per10g = Math.round(stacked);
  const perTola = Math.round(stacked * (TOLA_GRAMS / 10));
  return { per10g, perTola };
}
