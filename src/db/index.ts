import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { pg?: ReturnType<typeof postgres> };

// prepare: false keeps this compatible with Neon's pooled (pgbouncer) connections.
const client =
  globalForDb.pg ??
  postgres(process.env.DATABASE_URL as string, {
    prepare: false,
    max: process.env.NODE_ENV === "production" ? 1 : 10,
  });

if (process.env.NODE_ENV !== "production") globalForDb.pg = client;

export const db = drizzle(client, { schema });
