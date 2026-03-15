
import type { Hono } from "hono"

import { healthRoutes } from "./health"
import { nodesRoutes } from "./nodes"
import { flowsRoutes } from "./flows"
import { runsRoutes } from "./runs"

export function routes(app: Hono) {
  healthRoutes(app)
  nodesRoutes(app)
  flowsRoutes(app)
  runsRoutes(app)
}
