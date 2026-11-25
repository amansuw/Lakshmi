/** Troy ounce in grams (LBMA / ISO convention). */
export const TROY_OZ_GRAMS = 31.1034768;

/** Nepal tola ≈ 11.6638038 g; FENEGOSIDA publishes both 10g and tola. */
export const TOLA_GRAMS = 11.6638038;

/** Rough importer/dealer stack used to map spot → Nepal retail estimate. */
export const NEPAL_DUTY_STACK = {
  customsDuty: 0.2,
  importerMargin: 0.005,
  dealerMargin: 0.005,
  estimatedAdjustment: 0.008,
} as const;

export const FENEGOSIDA_BASE = "https://api.fenegosida.org/api/website/v1";
export const GOLD_API_BASE = "https://api.gold-api.com";
export const XAUS_HISTORY = "https://xaus.com/api/v1/history";
export const FX_URL = "https://open.er-api.com/v6/latest/USD";
export const SENTIMENT_URL =
  "https://xoomar.com/api/markets/sentiment?window=24h";

export const FINE_GOLD_10G = "छापावाल सुन (१० ग्राम)";
export const FINE_GOLD_TOLA = "छापावाल सुन (१ तोला)";
export const SILVER_10G = "असली चाँदी दर (१० ग्राम)";
export const SILVER_TOLA = "असली चाँदी दर (१ तोला)";

export const HORIZONS = [
  { id: "day" as const, label: "Next day", days: 1 },
  { id: "week" as const, label: "1 week", days: 7 },
  { id: "month" as const, label: "1 month", days: 30 },
  { id: "quarter" as const, label: "1 quarter", days: 90 },
  { id: "six_month" as const, label: "6 months", days: 182 },
  { id: "year" as const, label: "1 year", days: 365 },
];

export const POLL_INTERVAL_MS = 60 * 60 * 1000;
