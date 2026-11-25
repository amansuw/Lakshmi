export type HorizonId =
  | "day"
  | "week"
  | "month"
  | "quarter"
  | "six_month"
  | "year";

export interface SpotPrice {
  usdPerOz: number;
  updatedAt: string;
  source: string;
}

export interface NepalGoldRate {
  fineGoldPer10g: number;
  fineGoldPerTola: number;
  silverPer10g: number | null;
  silverPerTola: number | null;
  previousFineGoldPer10g: number | null;
  previousFineGoldPerTola: number | null;
  changePer10g: number | null;
  changePct: number | null;
  publishedAt: string;
  source: string;
}

export interface FxRate {
  usdToNpr: number;
  updatedAt: string;
  source: string;
}

export interface SentimentSnapshot {
  label: "BULLISH" | "NEUTRAL" | "BEARISH";
  composite: number;
  newsScore: number | null;
  institutionalScore: number | null;
  headlines: Array<{ title: string; score: number; publishedAt: string }>;
  updatedAt: string;
  source: string;
}

export interface PricePoint {
  date: string;
  close: number;
}

export interface Forecast {
  horizon: HorizonId;
  label: string;
  days: number;
  direction: "up" | "down" | "flat";
  expectedChangePct: number;
  lowChangePct: number;
  highChangePct: number;
  confidence: number;
  internationalUsdPerOz: number;
  nepalFineGoldPer10g: number;
  rationale: string;
}

export interface OpenMoveEstimate {
  overnightIntlChangePct: number;
  impliedNepalOpenChangePct: number;
  impliedNepalPer10g: number;
  currentNepalPer10g: number;
  gapToImpliedPct: number;
  note: string;
}

export interface MarketSnapshot {
  fetchedAt: string;
  spot: SpotPrice;
  nepal: NepalGoldRate;
  fx: FxRate;
  estimatedNepalFromSpot: {
    per10g: number;
    perTola: number;
    premiumVsOfficialPct: number | null;
  };
  openMove: OpenMoveEstimate;
  sentiment: SentimentSnapshot | null;
  forecasts: Forecast[];
  history: {
    international: PricePoint[];
    nepal: PricePoint[];
  };
  sources: Array<{ name: string; url: string; pollHint: string }>;
}
