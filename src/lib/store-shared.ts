import "server-only";
import { randomBytes } from "crypto";
import type { Group, SignupInput, SignupRecord } from "./waitlist";

export type AddResult = { record: SignupRecord; position: number; duplicate: boolean };

export type SignupFilter = { group?: Group; state?: string; category?: string };

export interface WaitlistStore {
  add(input: SignupInput, meta?: { ipHash?: string }): Promise<AddResult>;
  counts(): Promise<Record<Group, number>>;
  list(filter?: SignupFilter): Promise<SignupRecord[]>;
  /** Signups from this IP hash since the given time, for rate limiting. */
  recentFromIp(ipHash: string, since: Date): Promise<number>;
}

/** Each friend who joins moves the referrer up this many places. */
export const REFERRAL_BOOST = 5;

export function newReferralCode() {
  return randomBytes(4).toString("hex").toUpperCase();
}

export function matchesFilter(r: SignupRecord, f: SignupFilter) {
  if (f.group && r.group !== f.group) return false;
  if (f.state && r.state !== f.state) return false;
  if (f.category && !("categories" in r && r.categories?.includes(f.category as never))) return false;
  return true;
}
