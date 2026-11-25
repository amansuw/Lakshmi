import { getMarketSnapshot } from "@/lib/market";
import { appendPollRecord, readPollHistory } from "@/lib/poll/store";
import { NextResponse } from "next/server";

export async function GET() {
  const history = await readPollHistory();
  return NextResponse.json({
    count: history.length,
    latest: history.at(-1) ?? null,
    history: history.slice(-48),
  });
}

export async function POST() {
  try {
    const snap = await getMarketSnapshot();
    const history = await appendPollRecord({
      at: snap.fetchedAt,
      spotUsdPerOz: snap.spot.usdPerOz,
      nepalFineGoldPer10g: snap.nepal.fineGoldPer10g,
      usdToNpr: snap.fx.usdToNpr,
      sentimentComposite: snap.sentiment?.composite ?? null,
      overnightIntlChangePct: snap.openMove.overnightIntlChangePct,
    });
    return NextResponse.json({
      ok: true,
      saved: history.at(-1),
      count: history.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
