import { HORIZONS } from "@/lib/constants";
import type {
  Forecast,
  HorizonId,
  PricePoint,
  SentimentSnapshot,
} from "@/lib/types";

function returns(series: number[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < series.length; i += 1) {
    if (series[i - 1] === 0) continue;
    out.push(series[i] / series[i - 1] - 1);
  }
  return out;
}

function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function stdev(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  const v = mean(xs.map((x) => (x - m) ** 2));
  return Math.sqrt(v);
}

function sliceLast(points: PricePoint[], days: number): number[] {
  return points.slice(-Math.max(days + 1, 2)).map((p) => p.close);
}

function momentum(points: PricePoint[], lookback: number): number {
  if (points.length < lookback + 1) return 0;
  const a = points[points.length - 1 - lookback].close;
  const b = points[points.length - 1].close;
  if (a === 0) return 0;
  return b / a - 1;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/**
 * Heuristic multi-horizon forecast (not financial advice).
 * Blends short/medium momentum, mean-reversion to SMA, vol bands, and sentiment.
 */
export function buildForecasts(
  international: PricePoint[],
  nepalPer10g: number,
  spotUsd: number,
  sentiment: SentimentSnapshot | null,
): Forecast[] {
  if (international.length < 30) return [];

  const closes = international.map((p) => p.close);
  const daily = returns(closes);
  const volDaily = stdev(daily.slice(-60));
  const sentimentTilt =
    sentiment == null ? 0 : clamp(sentiment.composite, -1, 1) * 0.015;

  return HORIZONS.map((h) => {
    const look = Math.min(h.days, international.length - 1);
    const mom = momentum(international, look);
    const window = sliceLast(international, Math.min(look * 2, 120));
    const sma = mean(window);
    const last = closes[closes.length - 1];
    const reversion = sma === 0 ? 0 : (sma / last - 1) * 0.35;

    // Fade raw momentum on longer horizons; lean on reversion + sentiment.
    const momWeight = h.days <= 7 ? 0.7 : h.days <= 30 ? 0.55 : 0.35;
    const raw =
      mom * momWeight + reversion * (1 - momWeight) + sentimentTilt * Math.sqrt(h.days / 7);

    const expected = clamp(raw, -0.35, 0.45);
    const band = volDaily * Math.sqrt(h.days) * 1.65;
    const low = expected - band;
    const high = expected + band;

    const confidenceBase =
      h.days <= 7 ? 0.62 : h.days <= 30 ? 0.52 : h.days <= 90 ? 0.42 : 0.32;
    const confidence = clamp(
      confidenceBase - Math.abs(expected) * 0.15 + (sentiment ? 0.05 : 0),
      0.2,
      0.75,
    );

    const direction: Forecast["direction"] =
      Math.abs(expected) < 0.004 ? "flat" : expected > 0 ? "up" : "down";

    const rationaleParts = [
      `Momentum over ~${look}d: ${(mom * 100).toFixed(1)}%.`,
      `Mean-reversion vs SMA: ${(reversion * 100).toFixed(1)}%.`,
    ];
    if (sentiment) {
      rationaleParts.push(
        `Sentiment ${sentiment.label.toLowerCase()} (${sentiment.composite.toFixed(2)}).`,
      );
    }
    rationaleParts.push(
      "Nepal retail usually tracks overnight international moves at the next FENEGOSIDA print.",
    );

    return {
      horizon: h.id as HorizonId,
      label: h.label,
      days: h.days,
      direction,
      expectedChangePct: expected * 100,
      lowChangePct: low * 100,
      highChangePct: high * 100,
      confidence,
      internationalUsdPerOz: Math.round(spotUsd * (1 + expected) * 100) / 100,
      nepalFineGoldPer10g: Math.round(nepalPer10g * (1 + expected)),
      rationale: rationaleParts.join(" "),
    };
  });
}
