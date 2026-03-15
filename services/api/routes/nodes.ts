import type { Hono } from "hono"
import { getNodeDefinitions } from "@flareo/plugin-adapter"

export function nodesRoutes(app: Hono) {
  app.get("/nodes", (c) => c.json(getNodeDefinitions()))
}
