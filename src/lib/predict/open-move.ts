import type { OpenMoveEstimate, PricePoint } from "@/lib/types";

/**
 * Nepal FENEGOSIDA rates are typically set around market open and absorb
 * overnight / prior-session international moves. We estimate the next open
 * move from the latest international daily return (or intraday vs prior close).
 */
export function estimateOpenMove(
  international: PricePoint[],
  spotUsd: number,
  nepalPer10g: number,
): OpenMoveEstimate {
  if (international.length < 2) {
    return {
      overnightIntlChangePct: 0,
      impliedNepalOpenChangePct: 0,
      impliedNepalPer10g: nepalPer10g,
      currentNepalPer10g: nepalPer10g,
      gapToImpliedPct: 0,
      note: "Not enough international history to estimate the open move.",
    };
  }

  const priorClose = international[international.length - 2].close;
  const lastClose = international[international.length - 1].close;
  const ref = priorClose || lastClose;
  const overnight = ref === 0 ? 0 : spotUsd / ref - 1;

  // Empirically Nepal often passes through most of the overnight % with a small lag/friction.
  const passThrough = 0.85;
  const impliedPct = overnight * passThrough;
  const impliedNepal = Math.round(nepalPer10g * (1 + impliedPct));
  const gap =
    nepalPer10g === 0 ? 0 : (impliedNepal - nepalPer10g) / nepalPer10g;

  return {
    overnightIntlChangePct: overnight * 100,
    impliedNepalOpenChangePct: impliedPct * 100,
    impliedNepalPer10g: impliedNepal,
    currentNepalPer10g: nepalPer10g,
    gapToImpliedPct: gap * 100,
    note:
      "When international gold moves overnight, Nepal's next FENEGOSIDA print usually follows in the same direction at open. This estimate applies ~85% pass-through of the overnight international move.",
  };
}
