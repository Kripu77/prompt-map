import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "./schema";

// Create a connection pool to Neon DB
const connectionString = process.env.NEON_CONNECTION_STRING!;
const pool = new Pool({ connectionString });

// Create a drizzle client
export const db = drizzle(pool, { schema });

// Helper function to get connection pool for migrations
export const getConnectionPool = () => pool; 