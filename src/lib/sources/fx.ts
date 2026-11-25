import { FX_URL } from "@/lib/constants";
import type { FxRate } from "@/lib/types";

export async function fetchUsdNpr(): Promise<FxRate> {
  const res = await fetch(FX_URL, { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error(`FX API failed: ${res.status}`);
  }
  const data = (await res.json()) as {
    result: string;
    rates: { NPR?: number };
    time_last_update_utc?: string;
  };
  if (data.result !== "success" || !data.rates.NPR) {
    throw new Error("FX API missing NPR rate");
  }
  return {
    usdToNpr: data.rates.NPR,
    updatedAt: data.time_last_update_utc ?? new Date().toISOString(),
    source: "open.er-api.com",
  };
}
