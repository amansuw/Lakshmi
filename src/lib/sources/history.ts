import { XAUS_HISTORY } from "@/lib/constants";
import type { PricePoint } from "@/lib/types";

export async function fetchInternationalHistory(
  days = 365,
): Promise<PricePoint[]> {
  const res = await fetch(`${XAUS_HISTORY}?symbol=xau&days=${days}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`XAUS history failed: ${res.status}`);
  }
  const data = (await res.json()) as {
    points: Array<{ d: string; c: number }>;
  };
  return (data.points ?? []).map((p) => ({
    date: p.d,
    close: p.c,
  }));
}
