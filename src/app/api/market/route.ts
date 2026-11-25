import { getMarketSnapshot } from "@/lib/market";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const snapshot = await getMarketSnapshot();
    return NextResponse.json(snapshot);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
