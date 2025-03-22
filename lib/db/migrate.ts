import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { Pool } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Check for environment variable
if (!process.env.NEON_CONNECTION_STRING) {
  throw new Error("NEON_CONNECTION_STRING environment variable is required");
}

// Function to run migrations
async function runMigrations() {
  console.log("Running migrations...");

  const pool = new Pool({ connectionString: process.env.NEON_CONNECTION_STRING! });
  const db = drizzle(pool);

  try {
    await migrate(db, { migrationsFolder: "migrations" });
    console.log("Migrations completed successfully");
  } catch (error) {
    console.error("Migration failed", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the migrations
runMigrations().catch((err) => {
  console.error("Migration script failed:", err);
  process.exit(1);
}); 