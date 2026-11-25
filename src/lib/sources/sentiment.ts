import type { SentimentSnapshot } from "@/lib/types";

const SENTIMENT_LIST =
  "https://xoomar.com/api/markets/sentiment?window=24h";

function labelFromScore(score: number): SentimentSnapshot["label"] {
  if (score >= 0.15) return "BULLISH";
  if (score <= -0.15) return "BEARISH";
  return "NEUTRAL";
}

export async function fetchGoldSentiment(): Promise<SentimentSnapshot | null> {
  try {
    const res = await fetch(SENTIMENT_LIST, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      data?: {
        data?: Array<{
          slug: string;
          timestamp: string;
          compositeScore: number;
          sentimentLabel?: string;
          newsLayer?: { score: number | null };
          institutionalLayer?: { score: number | null };
          metadata?: {
            sampleHeadlines?: Array<{
              title: string;
              score: number;
              published_at: string;
            }>;
          };
        }>;
      };
    };
    const gold = body.data?.data?.find((row) => row.slug === "gold");
    if (!gold) return null;
    const composite = gold.compositeScore;
    return {
      label:
        (gold.sentimentLabel as SentimentSnapshot["label"] | undefined) ??
        labelFromScore(composite),
      composite,
      newsScore: gold.newsLayer?.score ?? null,
      institutionalScore: gold.institutionalLayer?.score ?? null,
      headlines: (gold.metadata?.sampleHeadlines ?? []).map((h) => ({
        title: h.title,
        score: h.score,
        publishedAt: h.published_at,
      })),
      updatedAt: gold.timestamp,
      source: "xoomar.com",
    };
  } catch {
    return null;
  }
}
