
import type { Hono } from "hono"
import { drizzle } from "drizzle-orm/d1"
import { desc, eq } from "drizzle-orm"
import * as schema from "../schema"

export function runsRoutes(app: Hono) {

  // Get all runs
  app.get("/runs", async (c) => {
    const limit = Math.min(parseInt(c.req.query("limit") || "50", 10), 100)
    const status = c.req.query("status")
    const db = drizzle(c.env.DB, { schema })
    const list = status
      ? await db.select().from(schema.runs).where(eq(schema.runs.status, status)).orderBy(desc(schema.runs.created_at)).limit(limit)
      : await db.select().from(schema.runs).orderBy(desc(schema.runs.created_at)).limit(limit)
    return c.json(list)
  })


  // Get run by ID
  app.get("/runs/:id", async (c) => {
    const db = drizzle(c.env.DB, { schema })
    const [run] = await db.select().from(schema.runs).where(eq(schema.runs.id, c.req.param("id")))
    if (!run) return c.json({ error: "Run not found" }, 404)
    return c.json(run)
  })
  
}
