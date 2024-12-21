import { neon } from "@neondatabase/serverless"
import { config } from "dotenv"
import { drizzle } from "drizzle-orm/neon-http"

// featching .env file
config({ path: ".env.local" }) // Ensure sensitive data like database URL is not hardcoded

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle({ client: sql })
