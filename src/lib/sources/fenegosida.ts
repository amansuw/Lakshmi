import {
  FENEGOSIDA_BASE,
  FINE_GOLD_10G,
  FINE_GOLD_TOLA,
  SILVER_10G,
  SILVER_TOLA,
} from "@/lib/constants";
import type { NepalGoldRate, PricePoint } from "@/lib/types";

interface TodayRow {
  rateType: string;
  todayBaseRatePerGram: number;
  yestardayBaseRatePerGram: number;
  todayDate: string;
}

interface HistoryRow {
  rateType: string;
  baseRatePerGram: number;
  todayDate: string;
}

function pick(rows: TodayRow[], type: string): TodayRow | undefined {
  return rows.find((r) => r.rateType === type);
}

export async function fetchNepalToday(): Promise<NepalGoldRate> {
  const res = await fetch(`${FENEGOSIDA_BASE}/Dashboard/today`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    throw new Error(`FENEGOSIDA today failed: ${res.status}`);
  }
  const rows = (await res.json()) as TodayRow[];
  const g10 = pick(rows, FINE_GOLD_10G);
  const gt = pick(rows, FINE_GOLD_TOLA);
  const s10 = pick(rows, SILVER_10G);
  const st = pick(rows, SILVER_TOLA);

  if (!g10 || !gt) {
    throw new Error("FENEGOSIDA response missing fine gold rates");
  }

  const change =
    g10.todayBaseRatePerGram - g10.yestardayBaseRatePerGram;
  const changePct =
    g10.yestardayBaseRatePerGram === 0
      ? null
      : (change / g10.yestardayBaseRatePerGram) * 100;

  return {
    fineGoldPer10g: g10.todayBaseRatePerGram,
    fineGoldPerTola: gt.todayBaseRatePerGram,
    silverPer10g: s10?.todayBaseRatePerGram ?? null,
    silverPerTola: st?.todayBaseRatePerGram ?? null,
    previousFineGoldPer10g: g10.yestardayBaseRatePerGram,
    previousFineGoldPerTola: gt.yestardayBaseRatePerGram,
    changePer10g: change,
    changePct,
    publishedAt: g10.todayDate,
    source: "api.fenegosida.org",
  };
}

function monthStarts(monthsBack: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = monthsBack - 1; i >= 0; i -= 1) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    out.push(`${y}-${m}-01`);
  }
  return out;
}

export async function fetchNepalHistory(
  monthsBack = 12,
): Promise<PricePoint[]> {
  const dates = monthStarts(monthsBack);
  const byDate = new Map<string, number>();

  await Promise.all(
    dates.map(async (date) => {
      try {
        const res = await fetch(
          `${FENEGOSIDA_BASE}/Dashboard/monthwisehistory?date=${date}`,
          { next: { revalidate: 3600 } },
        );
        if (!res.ok) return;
        const rows = (await res.json()) as HistoryRow[];
        if (!Array.isArray(rows)) return;
        for (const row of rows) {
          if (row.rateType !== FINE_GOLD_10G) continue;
          const day = row.todayDate.slice(0, 10);
          byDate.set(day, row.baseRatePerGram);
        }
      } catch {
        // Skip failed months; partial history is still useful.
      }
    }),
  );

  return [...byDate.entries()]
    .map(([date, close]) => ({ date, close }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
