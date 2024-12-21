import { config } from "dotenv" // To load environment variables
import { defineConfig } from "drizzle-kit"

config({ path: ".env.local" })
export default defineConfig({
  out: "./migrations",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
