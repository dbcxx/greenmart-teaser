import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { SignupRecord } from "./waitlist";
import { REFERRAL_BOOST, matchesFilter, newReferralCode, type WaitlistStore } from "./store-shared";

/** Dev-only JSON file store. Used when DATABASE_URL is unset. */

const FILE = path.join(process.cwd(), ".data", "waitlist.json");

async function readAll(): Promise<SignupRecord[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    return [];
  }
}

async function writeAll(rows: SignupRecord[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(rows, null, 2));
}

// Position = order of signup within the group, minus 5 places per referral.
function positionOf(rows: SignupRecord[], rec: SignupRecord) {
  const group = rows
    .filter((r) => r.group === rec.group)
    .map((r, i) => ({ id: r.id, score: i - r.referralCount * REFERRAL_BOOST }))
    .sort((a, b) => a.score - b.score);
  return group.findIndex((r) => r.id === rec.id) + 1;
}

export const fileStore: WaitlistStore = {
  async add(input, meta) {
    const rows = await readAll();
    const existing = rows.find(
      (r) =>
        r.group === input.group &&
        ((input.phone && r.phone === input.phone) || (input.email && r.email === input.email)),
    );
    if (existing) return { record: existing, position: positionOf(rows, existing), duplicate: true };

    const record: SignupRecord = {
      ...input,
      id: randomUUID(),
      referralCode: newReferralCode(),
      referralCount: 0,
      ipHash: meta?.ipHash,
      createdAt: new Date().toISOString(),
    };
    if (input.referredBy) {
      const ref = rows.find((r) => r.referralCode === input.referredBy);
      if (ref) ref.referralCount += 1;
    }
    rows.push(record);
    await writeAll(rows);
    return { record, position: positionOf(rows, record), duplicate: false };
  },
  async counts() {
    const rows = await readAll();
    return {
      farmer: rows.filter((r) => r.group === "farmer").length,
      seller: rows.filter((r) => r.group === "seller").length,
      buyer: rows.filter((r) => r.group === "buyer").length,
    };
  },
  async list(filter = {}) {
    const rows = await readAll();
    return rows.filter((r) => matchesFilter(r, filter)).reverse();
  },
  async recentFromIp(ipHash, since) {
    const rows = await readAll();
    return rows.filter((r) => r.ipHash === ipHash && new Date(r.createdAt) >= since).length;
  },
};
