import { Hono } from "hono"
import { cors } from "hono/cors"
import { FlareoWorkflow } from "@flareo/workflow-runtime"
import { routes } from "./routes"

export { FlareoWorkflow }

const app = new Hono()
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    allowHeaders: ["*"],
    exposeHeaders: ["*"],
  })
)
routes(app)

export default { fetch: app.fetch }
