import { estimateNepalFromSpot } from "@/lib/estimate";
import { buildForecasts } from "@/lib/predict/forecast";
import { estimateOpenMove } from "@/lib/predict/open-move";
import { fetchNepalHistory, fetchNepalToday } from "@/lib/sources/fenegosida";
import { fetchUsdNpr } from "@/lib/sources/fx";
import { fetchGoldSpot } from "@/lib/sources/gold-spot";
import { fetchInternationalHistory } from "@/lib/sources/history";
import { fetchGoldSentiment } from "@/lib/sources/sentiment";
import type { MarketSnapshot } from "@/lib/types";

export async function getMarketSnapshot(): Promise<MarketSnapshot> {
  const [spot, nepal, fx, international, nepalHistory, sentiment] =
    await Promise.all([
      fetchGoldSpot(),
      fetchNepalToday(),
      fetchUsdNpr(),
      fetchInternationalHistory(365),
      fetchNepalHistory(12),
      fetchGoldSentiment(),
    ]);

  const estimated = estimateNepalFromSpot(spot.usdPerOz, fx.usdToNpr);
  const premiumVsOfficialPct =
    nepal.fineGoldPer10g === 0
      ? null
      : ((estimated.per10g - nepal.fineGoldPer10g) / nepal.fineGoldPer10g) *
        100;

  const openMove = estimateOpenMove(
    international,
    spot.usdPerOz,
    nepal.fineGoldPer10g,
  );

  const forecasts = buildForecasts(
    international,
    nepal.fineGoldPer10g,
    spot.usdPerOz,
    sentiment,
  );

  return {
    fetchedAt: new Date().toISOString(),
    spot,
    nepal,
    fx,
    estimatedNepalFromSpot: {
      per10g: estimated.per10g,
      perTola: estimated.perTola,
      premiumVsOfficialPct,
    },
    openMove,
    sentiment,
    forecasts,
    history: {
      international: international.slice(-120),
      nepal: nepalHistory.slice(-120),
    },
    sources: [
      {
        name: "gold-api.com (live XAU/USD)",
        url: "https://api.gold-api.com/price/XAU",
        pollHint: "No key · updates ~30s · safe to poll hourly (or every minute)",
      },
      {
        name: "FENEGOSIDA Nepal official rates",
        url: "https://api.fenegosida.org/api/website/v1/Dashboard/today",
        pollHint: "Official daily print · poll hourly; meaningful change at open",
      },
      {
        name: "XAUS daily history",
        url: "https://xaus.com/api/v1/history?symbol=xau&days=365",
        pollHint: "No key · daily bars · poll a few times per day",
      },
      {
        name: "Open Exchange Rates (USD/NPR)",
        url: "https://open.er-api.com/v6/latest/USD",
        pollHint: "Free · daily FX · hourly is fine",
      },
      {
        name: "XOOMAR gold sentiment",
        url: "https://xoomar.com/api/markets/sentiment?window=24h",
        pollHint: "No key · ~5 min updates · 10 req/min",
      },
    ],
  };
}
