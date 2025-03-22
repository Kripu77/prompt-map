import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

if (!process.env.NEON_CONNECTION_STRING) {
  throw new Error("NEON_CONNECTION_STRING environment variable is required");
}

export default {
  schema: "./lib/db/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.NEON_CONNECTION_STRING,
  },
} satisfies Config; 