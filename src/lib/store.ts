import "server-only";
import type { WaitlistStore } from "./store-shared";
import { fileStore } from "./store-file";
import { mysqlStore } from "./store-mysql";

export type { AddResult, SignupFilter, WaitlistStore } from "./store-shared";

/**
 * Callers only see the WaitlistStore interface. `DATABASE_URL` picks MySQL;
 * without it we fall back to a dev-only JSON file (Vercel's filesystem is read-only).
 */
export const store: WaitlistStore = process.env.DATABASE_URL ? mysqlStore : fileStore;
