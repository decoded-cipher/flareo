import fs from "node:fs"
import path from "node:path"
import { defineConfig } from "drizzle-kit"

const basePath = path.resolve(".wrangler/state/v3/d1")

function getLocalD1Path(): string {
  if (!fs.existsSync(basePath)) {
    throw new Error("Run 'wrangler d1 execute flareo --local --command=\"SELECT 1\"' first to create the local DB")
  }
  const entries = fs.readdirSync(basePath, { recursive: true }) as string[]
  const sqlite = entries.find((f) => f.endsWith(".sqlite"))
  if (!sqlite) {
    throw new Error("No D1 SQLite file found. Run wrangler dev once to create it.")
  }
  const fullPath = path.join(basePath, sqlite)
  return `file:${fullPath}`
}

export default defineConfig({
  schema: "./services/api/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: getLocalD1Path(),
  },
})
