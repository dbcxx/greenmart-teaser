import "server-only";
import mysql, { type Pool, type RowDataPacket } from "mysql2/promise";
import type { Group, SignupInput, SignupRecord } from "./waitlist";
import { REFERRAL_BOOST, newReferralCode, type SignupFilter, type WaitlistStore } from "./store-shared";

/** MySQL store over the `waitlist_signups` table (see db/schema.sql). */

// Reuse one pool across hot reloads and warm serverless invocations.
const g = globalThis as unknown as { __gmPool?: Pool };
function pool() {
  g.__gmPool ??= mysql.createPool({ uri: process.env.DATABASE_URL, connectionLimit: 5, timezone: "Z" });
  return g.__gmPool;
}

type Row = RowDataPacket & {
  id: number;
  group: Group;
  name: string;
  phone: string | null;
  email: string | null;
  state: string;
  lga_or_city: string;
  categories: string[] | null;
  scale: string;
  business_name: string | null;
  sells_online: "yes" | "no" | null;
  referral_code: string;
  referred_by: string | null;
  referral_count: number;
  utm_source: string | null;
  utm_campaign: string | null;
  consent: number;
  ip_hash: string | null;
  created_at: Date;
};

function toRecord(r: Row): SignupRecord {
  return {
    id: String(r.id),
    group: r.group,
    name: r.name,
    phone: r.phone ?? "",
    email: r.email ?? "",
    state: r.state,
    lgaOrCity: r.lga_or_city,
    ...(r.group !== "buyer" && {
      categories: r.categories ?? [],
      businessName: r.business_name ?? undefined,
      sellsOnline: r.sells_online ?? "no",
    }),
    scale: r.scale,
    consent: true,
    referredBy: r.referred_by ?? undefined,
    utmSource: r.utm_source ?? undefined,
    utmCampaign: r.utm_campaign ?? undefined,
    referralCode: r.referral_code,
    referralCount: r.referral_count,
    ipHash: r.ip_hash ?? undefined,
    createdAt: r.created_at.toISOString(),
  } as SignupRecord;
}

// Same rule as the file store: join order within the group, minus 5 places
// per referral, ties broken by who joined first.
const POSITION_SQL = `
  WITH joined AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY id) - 1 - referral_count * ${REFERRAL_BOOST} AS score
    FROM waitlist_signups WHERE \`group\` = ?
  ), ranked AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY score, id) AS pos FROM joined
  )
  SELECT pos FROM ranked WHERE id = ?`;

async function positionOf(group: Group, id: number) {
  const [rows] = await pool().query<RowDataPacket[]>(POSITION_SQL, [group, id]);
  return Number(rows[0]?.pos ?? 0);
}

async function findExisting(input: SignupInput) {
  const [rows] = await pool().query<Row[]>(
    "SELECT * FROM waitlist_signups WHERE `group` = ? AND (phone = ? OR email = ?) LIMIT 1",
    [input.group, input.phone || null, input.email || null],
  );
  return rows[0];
}

export const mysqlStore: WaitlistStore = {
  async add(input, meta) {
    const existing = await findExisting(input);
    if (existing) {
      return { record: toRecord(existing), position: await positionOf(input.group, existing.id), duplicate: true };
    }

    const sells = input.group !== "buyer";
    const conn = await pool().getConnection();
    let insertId = 0;
    try {
      await conn.beginTransaction();
      // Referral codes are random; retry on the rare collision.
      for (let attempt = 0; ; attempt++) {
        try {
          const [res] = await conn.execute<mysql.ResultSetHeader>(
            `INSERT INTO waitlist_signups
              (\`group\`, name, phone, email, state, lga_or_city, categories, scale, business_name,
               sells_online, referral_code, referred_by, utm_source, utm_campaign, consent, ip_hash)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              input.group,
              input.name,
              input.phone || null,
              input.email || null,
              input.state,
              input.lgaOrCity,
              sells ? JSON.stringify(input.categories) : null,
              input.scale,
              (sells && input.businessName) || null,
              sells ? input.sellsOnline : null,
              newReferralCode(),
              input.referredBy || null,
              input.utmSource || null,
              input.utmCampaign || null,
              input.consent,
              meta?.ipHash ?? null,
            ],
          );
          insertId = res.insertId;
          break;
        } catch (e) {
          const err = e as { code?: string; message?: string };
          if (err.code !== "ER_DUP_ENTRY") throw e;
          if (err.message?.includes("uq_referral_code") && attempt < 3) continue;
          // Lost a race with an identical signup: report it as a duplicate.
          await conn.rollback();
          const dupe = await findExisting(input);
          if (!dupe) throw e;
          return { record: toRecord(dupe), position: await positionOf(input.group, dupe.id), duplicate: true };
        }
      }
      if (input.referredBy) {
        await conn.execute(
          "UPDATE waitlist_signups SET referral_count = referral_count + 1 WHERE referral_code = ?",
          [input.referredBy],
        );
      }
      await conn.commit();
    } catch (e) {
      await conn.rollback().catch(() => {});
      throw e;
    } finally {
      conn.release();
    }

    const [rows] = await pool().query<Row[]>("SELECT * FROM waitlist_signups WHERE id = ?", [insertId]);
    const record = toRecord(rows[0]);
    return { record, position: await positionOf(input.group, Number(record.id)), duplicate: false };
  },

  async counts() {
    const [rows] = await pool().query<RowDataPacket[]>(
      "SELECT `group`, COUNT(*) AS n FROM waitlist_signups GROUP BY `group`",
    );
    const out: Record<Group, number> = { farmer: 0, seller: 0, buyer: 0 };
    for (const r of rows) out[r.group as Group] = Number(r.n);
    return out;
  },

  async list(filter: SignupFilter = {}) {
    const where: string[] = [];
    const args: string[] = [];
    const add = (clause: string, value: string) => {
      where.push(clause);
      args.push(value);
    };
    if (filter.group) add("`group` = ?", filter.group);
    if (filter.state) add("state = ?", filter.state);
    if (filter.category) add("JSON_CONTAINS(categories, JSON_QUOTE(?))", filter.category);
    const [rows] = await pool().query<Row[]>(
      `SELECT * FROM waitlist_signups ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY id DESC`,
      args,
    );
    return rows.map(toRecord);
  },

  async recentFromIp(ipHash, since) {
    const [rows] = await pool().query<RowDataPacket[]>(
      "SELECT COUNT(*) AS n FROM waitlist_signups WHERE ip_hash = ? AND created_at >= ?",
      [ipHash, since],
    );
    return Number(rows[0]?.n ?? 0);
  },
};
