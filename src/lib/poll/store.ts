import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const SNAPSHOTS_FILE = path.join(DATA_DIR, "snapshots.json");

export interface PollRecord {
  at: string;
  spotUsdPerOz: number;
  nepalFineGoldPer10g: number;
  usdToNpr: number;
  sentimentComposite: number | null;
  overnightIntlChangePct: number;
}

async function ensureDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

export async function readPollHistory(): Promise<PollRecord[]> {
  try {
    const raw = await readFile(SNAPSHOTS_FILE, "utf8");
    const parsed = JSON.parse(raw) as PollRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function appendPollRecord(
  record: PollRecord,
  keep = 500,
): Promise<PollRecord[]> {
  await ensureDir();
  const existing = await readPollHistory();
  const next = [...existing, record].slice(-keep);
  await writeFile(SNAPSHOTS_FILE, JSON.stringify(next, null, 2));
  return next;
}
