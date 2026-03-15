import { Hono } from "hono"
import { cors } from "hono/cors"
import { FlareoWorkflow } from "@flareo/workflow-runtime"
import { routes } from "./routes"

export { FlareoWorkflow }

const api = new Hono()
api.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    allowHeaders: ["*"],
    exposeHeaders: ["*"],
  })
)
routes(api)

// Mount API under /api; everything else is served from static assets (apps/web)
const app = new Hono<{ Bindings: { ASSETS: { fetch: (req: Request) => Promise<Response> } } }>()
  .route("/api", api)
  .all("*", (c) => c.env.ASSETS.fetch(c.req.raw))

export default { fetch: app.fetch }
