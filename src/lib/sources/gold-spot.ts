import { GOLD_API_BASE } from "@/lib/constants";
import type { SpotPrice } from "@/lib/types";

export async function fetchGoldSpot(): Promise<SpotPrice> {
  const res = await fetch(`${GOLD_API_BASE}/price/XAU`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error(`gold-api.com failed: ${res.status}`);
  }
  const data = (await res.json()) as {
    price: number;
    updatedAt: string;
  };
  return {
    usdPerOz: data.price,
    updatedAt: data.updatedAt,
    source: "gold-api.com",
  };
}
