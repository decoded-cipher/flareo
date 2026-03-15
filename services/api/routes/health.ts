import type { Hono } from "hono"

export function healthRoutes(app: Hono) {
  app.get("/", (c) => c.json({ status: "Flareo API running" }))
}
