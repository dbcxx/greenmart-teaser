// Creates the waitlist table. Usage: DATABASE_URL=mysql://… npm run db:migrate
import { readFile } from "node:fs/promises";
import mysql from "mysql2/promise";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Set DATABASE_URL first.");
  process.exit(1);
}

const sql = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");
const conn = await mysql.createConnection({ uri: url, multipleStatements: true });
await conn.query(sql);
await conn.end();
console.log("waitlist_signups is ready.");
